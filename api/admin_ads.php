<?php
declare(strict_types=1);
require __DIR__ . '/config.php';
require __DIR__ . '/auth_lib.php';

/*
 * GET  api/admin_ads.php                      paid ads waiting for review
 * POST api/admin_ads.php {"action":"approve"|"reject","ad_id":12,"reason":"..."}
 * Admin session only (api/admin_login.php).
 */
try {
    require_admin();
    $pdo = db();

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
        $st = $pdo->query(
            "SELECT a.id, a.title, a.body, a.contact_phone AS contact, s.business_name AS seller, k.name AS package, p.amount_naira,
                    to_char(p.paid_at AT TIME ZONE 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') AS paid_at
             FROM ads a
             JOIN sellers s ON s.id = a.seller_id
             JOIN ad_packages k ON k.id = a.package_id
             JOIN payments p ON p.ad_id = a.id AND p.status = 'success'
             WHERE a.status = 'pending'
             ORDER BY p.paid_at
             LIMIT 100"
        );
        json_out(['ads' => $st->fetchAll()]);
    }

    require_method('POST');
    require_same_origin();
    require_json_request();
    $in = read_json();
    $adId = clamp_int($in['ad_id'] ?? null, 1, PHP_INT_MAX, 0);
    $action = (string) ($in['action'] ?? '');

    if ($action === 'approve') {
        $st = $pdo->prepare(
            "UPDATE ads a SET status = 'live', starts_at = now(), ends_at = now() + make_interval(days => k.days), updated_at = now()
             FROM ad_packages k
             WHERE k.id = a.package_id AND a.id = ? AND a.status = 'pending'
               AND EXISTS (SELECT 1 FROM payments p WHERE p.ad_id = a.id AND p.status = 'success')"
        );
        $st->execute([$adId]);
        if ($st->rowCount() === 0) {
            json_out(['error' => 'That ad is not paid or is not waiting for review.'], 409);
        }
        $title = 'Your ad is live';
        $text = 'We approved your ad. Students can see it now.';
    } elseif ($action === 'reject') {
        $reason = mb_substr(trim((string) ($in['reason'] ?? '')), 0, 300);
        if ($reason === '') {
            json_out(['error' => 'Give a short reason so the student knows what to change.'], 422);
        }
        $st = $pdo->prepare("UPDATE ads SET status = 'rejected', reject_reason = ?, updated_at = now() WHERE id = ? AND status = 'pending'");
        $st->execute([$reason, $adId]);
        if ($st->rowCount() === 0) {
            json_out(['error' => 'That ad is not waiting for review.'], 409);
        }
        $title = 'Your ad was not approved';
        $text = $reason;
    } else {
        json_out(['error' => 'Unknown action'], 400);
    }

    $owner = $pdo->prepare('SELECT s.user_id FROM ads a JOIN sellers s ON s.id = a.seller_id WHERE a.id = ?');
    $owner->execute([$adId]);
    if ($uid = $owner->fetchColumn()) {
        notify_users([$uid], $title, $text, 'market.html');
    }
    json_out(['ok' => true]);
} catch (Throwable $e) {
    fail($e);
}
