<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

/*
 * GET api/pay_status.php?reference=XXXX     (signed-in owner only)
 * The payment page asks this every few seconds. Returns: awaiting | success | expired | failed
 * It only reads the database; the money is confirmed by api/pay_webhook.php.
 */
require_method('GET');

try {
    $userId = auth_user_id();
    if ($userId === null) {
        json_out(['error' => 'Please sign in first'], 401);
    }
    $ref = (string) ($_GET['reference'] ?? '');
    if (!preg_match('/^[A-Za-z0-9_-]{6,64}$/', $ref)) {
        json_out(['error' => 'Invalid reference'], 400);
    }
    $stmt = db()->prepare(
        "SELECT p.status, (p.status = 'awaiting' AND p.expires_at <= now()) AS timed_out, a.status AS ad_status
         FROM payments p JOIN ads a ON a.id = p.ad_id JOIN sellers s ON s.id = a.seller_id
         WHERE p.reference = ? AND s.user_id = ?"
    );
    $stmt->execute([$ref, $userId]);
    $row = $stmt->fetch();
    if (!$row) {
        json_out(['error' => 'Payment not found'], 404);
    }
    json_out(['status' => $row['timed_out'] ? 'expired' : $row['status'], 'ad_status' => $row['ad_status']]);
} catch (Throwable $e) {
    fail($e);
}
