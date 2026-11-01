<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

/*
 * GET api/sellers.php                  sellers who have at least one live ad
 * GET api/sellers.php?q=braids         match seller name, bio, category, or any of their live ads
 * GET api/sellers.php?category=food    filter by category slug
 * Optional: limit (1-50, default 30)
 */
require_method('GET');

try {
    $where = '';
    $params = [];

    foreach (search_terms((string) ($_GET['q'] ?? '')) as $term) {
        $like = like_term($term);
        $where .= ' AND (s.business_name ILIKE ? OR s.bio ILIKE ? OR c.name ILIKE ?'
            . " OR EXISTS (SELECT 1 FROM ads x WHERE x.seller_id = s.id AND x.status = 'live'"
            . ' AND (x.ends_at IS NULL OR x.ends_at > now()) AND (x.title ILIKE ? OR x.body ILIKE ?)))';
        array_push($params, $like, $like, $like, $like, $like);
    }
    if (!empty($_GET['category']) && preg_match('/^[a-z0-9-]{1,30}$/', (string) $_GET['category'])) {
        $where .= ' AND c.slug = ?';
        $params[] = (string) $_GET['category'];
    }

    $limit = clamp_int($_GET['limit'] ?? null, 1, 50, 30);
    $params[] = $limit;

    $sql = <<<SQL
SELECT s.id, s.business_name AS name, s.bio, s.location, s.verified,
       c.slug AS category, c.name AS category_name,
       COUNT(a.id)::int AS ad_count
FROM sellers s
JOIN categories c ON c.id = s.category_id
JOIN ads a ON a.seller_id = s.id AND a.status = 'live' AND (a.ends_at IS NULL OR a.ends_at > now())
WHERE s.is_active
$where
GROUP BY s.id, c.id
ORDER BY ad_count DESC, s.business_name
LIMIT ?
SQL;

    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    json_out(['sellers' => $stmt->fetchAll()]);
} catch (Throwable $e) {
    fail($e);
}
