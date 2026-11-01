<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

/*
 * GET api/ads.php                      latest live ads
 * GET api/ads.php?q=laptop             search title, description, seller, category, location
 * GET api/ads.php?category=food        filter by category slug
 * GET api/ads.php?seller=3             ads from one seller
 * GET api/ads.php?id=12                one ad (for the details page)
 * Optional: limit (1-50, default 30), offset
 */
require_method('GET');

const AD_SELECT = <<<'SQL'
SELECT a.id, a.title, a.body, a.offer_text AS offer, a.price_naira AS price, a.price_note,
       a.location, a.contact_phone AS contact, a.image_path AS image,
       a.views, a.contact_taps,
       to_char(a.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS posted_at,
       to_char(a.ends_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS ends_at,
       c.slug AS category, c.name AS category_name,
       s.id AS seller_id, s.business_name AS seller_name, s.verified AS seller_verified
FROM ads a
JOIN sellers s     ON s.id = a.seller_id AND s.is_active
JOIN categories c  ON c.id = a.category_id
JOIN ad_packages p ON p.id = a.package_id
WHERE a.status = 'live' AND (a.ends_at IS NULL OR a.ends_at > now())
SQL;

try {
    $pdo = db();

    if (isset($_GET['id'])) {
        $stmt = $pdo->prepare(AD_SELECT . ' AND a.id = ?');
        $stmt->execute([clamp_int($_GET['id'], 1, PHP_INT_MAX, 0)]);
        $ad = $stmt->fetch();
        if (!$ad) {
            json_out(['error' => 'Ad not found'], 404);
        }
        json_out(['ad' => $ad]);
    }

    $where = '';
    $params = [];

    foreach (search_terms((string) ($_GET['q'] ?? '')) as $term) {
        $like = like_term($term);
        $where .= ' AND (a.title ILIKE ? OR a.body ILIKE ? OR s.business_name ILIKE ? OR c.name ILIKE ? OR a.location ILIKE ?)';
        array_push($params, $like, $like, $like, $like, $like);
    }
    if (!empty($_GET['category']) && preg_match('/^[a-z0-9-]{1,30}$/', (string) $_GET['category'])) {
        $where .= ' AND c.slug = ?';
        $params[] = (string) $_GET['category'];
    }
    if (isset($_GET['seller']) && ctype_digit((string) $_GET['seller'])) {
        $where .= ' AND s.id = ?';
        $params[] = (int) $_GET['seller'];
    }

    $limit  = clamp_int($_GET['limit'] ?? null, 1, 50, 30);
    $offset = clamp_int($_GET['offset'] ?? null, 0, 100000, 0);

    // Bigger packages are shown first, then the newest ads.
    $sql = AD_SELECT . $where . ' ORDER BY p.priority DESC, a.created_at DESC LIMIT ? OFFSET ?';
    $params[] = $limit;
    $params[] = $offset;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $ads = $stmt->fetchAll();

    json_out(['ads' => $ads, 'count' => count($ads), 'limit' => $limit, 'offset' => $offset]);
} catch (Throwable $e) {
    fail($e);
}
