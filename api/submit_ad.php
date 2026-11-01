<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

/*
 * POST api/submit_ad.php   (signed-in students only)
 * {"title","body","offer","price","price_note","location","contact","category","package","business_name"}
 *
 * Saves the ad as "pending". It is not shown to anyone until it is paid (api/pay_start.php gives the
 * advertiser a temporary account to pay into) and, unless SLC_AUTO_APPROVE=1, reviewed by you.
 */
require_method('POST');
require_same_origin();

try {
    $userId = auth_user_id();
    if ($userId === null) {
        json_out(['error' => 'Please sign in first'], 401);
    }

    $in = read_json();
    $title = trim((string) ($in['title'] ?? ''));
    $body = trim((string) ($in['body'] ?? ''));
    $offer = trim((string) ($in['offer'] ?? ''));
    $loc = trim((string) ($in['location'] ?? ''));
    $contact = trim((string) ($in['contact'] ?? ''));
    $note = trim((string) ($in['price_note'] ?? ''));
    $business = trim((string) ($in['business_name'] ?? ''));
    $price = ($in['price'] ?? '') === '' ? null : clamp_int($in['price'] ?? null, 0, 100000000, 0);

    $errors = [];
    if (mb_strlen($title) < 4 || mb_strlen($title) > 120) { $errors[] = 'Title must be 4 to 120 characters.'; }
    if (mb_strlen($body) < 10 || mb_strlen($body) > 1000) { $errors[] = 'Description must be 10 to 1000 characters.'; }
    if (mb_strlen($offer) > 120 || mb_strlen($loc) > 160 || mb_strlen($note) > 40) { $errors[] = 'One of the fields is too long.'; }
    if (!preg_match('/^\+?[0-9 ]{7,20}$/', $contact)) { $errors[] = 'Enter a phone number people can reach you on.'; }
    if ($errors) {
        json_out(['error' => implode(' ', $errors)], 422);
    }

    $pdo = db();
    $pdo->beginTransaction();

    $cat = $pdo->prepare('SELECT id FROM categories WHERE slug = ?');
    $cat->execute([(string) ($in['category'] ?? 'services')]);
    $categoryId = $cat->fetchColumn();

    $pkg = $pdo->prepare('SELECT id, price_naira FROM ad_packages WHERE code = ?');
    $pkg->execute([(string) ($in['package'] ?? 'basic')]);
    $package = $pkg->fetch();

    if (!$categoryId || !$package) {
        $pdo->rollBack();
        json_out(['error' => 'Choose a valid category and package.'], 422);
    }

    $sel = $pdo->prepare('SELECT id FROM sellers WHERE user_id = ?');
    $sel->execute([$userId]);
    $sellerId = $sel->fetchColumn();
    if (!$sellerId) {
        if (mb_strlen($business) < 2 || mb_strlen($business) > 120) {
            $pdo->rollBack();
            json_out(['error' => 'Enter your business or stall name.'], 422);
        }
        $mk = $pdo->prepare('INSERT INTO sellers (user_id, business_name, category_id, location, phone) VALUES (?, ?, ?, ?, ?) RETURNING id');
        $mk->execute([$userId, $business, $categoryId, $loc, $contact]);
        $sellerId = $mk->fetchColumn();
    }

    $ad = $pdo->prepare(
        "INSERT INTO ads (seller_id, category_id, package_id, title, body, offer_text, price_naira, price_note, location, contact_phone, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending') RETURNING id"
    );
    $ad->execute([$sellerId, $categoryId, $package['id'], $title, $body, $offer ?: null, $price, $note ?: null, $loc ?: null, $contact]);
    $adId = (int) $ad->fetchColumn();

    $pdo->commit();
    json_out(['ok' => true, 'ad_id' => $adId, 'amount_naira' => (int) $package['price_naira']], 201);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    fail($e);
}
