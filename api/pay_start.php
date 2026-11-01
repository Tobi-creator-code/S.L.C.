<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

/*
 * POST api/pay_start.php   {"ad_id": 12}      (signed-in owner of the ad only)
 *
 * Asks Paystack for a one-time bank account that works for this payment only and stops working
 * after a few minutes. The advertiser sends the money to that account; Paystack settles it into
 * YOUR payout account (set in your Paystack dashboard). Your own account number is never shown.
 *
 * Calling it again after the account expired gives a fresh account.
 */
require_method('POST');
require_same_origin();

try {
    $userId = auth_user_id();
    if ($userId === null) {
        json_out(['error' => 'Please sign in first'], 401);
    }
    $adId = clamp_int(read_json()['ad_id'] ?? null, 1, PHP_INT_MAX, 0);
    $pdo = db();

    $q = $pdo->prepare(
        'SELECT a.status, k.price_naira, u.email
         FROM ads a
         JOIN sellers s      ON s.id = a.seller_id
         JOIN ad_packages k  ON k.id = a.package_id
         LEFT JOIN users u   ON u.id = s.user_id
         WHERE a.id = ? AND s.user_id = ?'
    );
    $q->execute([$adId, $userId]);
    $ad = $q->fetch();
    if (!$ad) {
        json_out(['error' => 'Ad not found'], 404);
    }
    if ($ad['status'] !== 'pending') {
        json_out(['error' => 'This ad is already paid for or closed.'], 409);
    }
    $paid = $pdo->prepare("SELECT 1 FROM payments WHERE ad_id = ? AND status = 'success'");
    $paid->execute([$adId]);
    if ($paid->fetchColumn()) {
        json_out(['error' => 'This ad is already paid for.'], 409);
    }

    // Reuse an account that is still valid for at least one more minute.
    $live = $pdo->prepare(
        "SELECT reference, account_bank, account_number, account_name, amount_naira,
                to_char(expires_at AT TIME ZONE 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') AS expires_at
         FROM payments
         WHERE ad_id = ? AND status = 'awaiting' AND expires_at > now() + interval '60 seconds'
         ORDER BY id DESC LIMIT 1"
    );
    $live->execute([$adId]);
    if ($row = $live->fetch()) {
        json_out(['ok' => true, 'reference' => $row['reference'], 'bank' => $row['account_bank'], 'account_number' => $row['account_number'],
                  'account_name' => $row['account_name'], 'amount' => (int) $row['amount_naira'], 'expires_at' => $row['expires_at']]);
    }

    $amount = (int) $ad['price_naira'];
    $email = $ad['email'] ?: env('SLC_PAY_FALLBACK_EMAIL', '');
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new RuntimeException('No valid email for the Paystack charge. Set users.email or SLC_PAY_FALLBACK_EMAIL.');
    }

    $expires = gmdate('Y-m-d\TH:i:s\Z', time() + pay_expiry_minutes() * 60);
    $resp = paystack('POST', '/charge', [
        'email'         => $email,
        'amount'        => (string) ($amount * 100),          // Paystack counts in kobo
        'bank_transfer' => ['account_expires_at' => $expires],
        'metadata'      => ['ad_id' => $adId, 'user_id' => $userId],
    ]);
    $d = $resp['data'] ?? [];
    if (empty($resp['status']) || ($d['status'] ?? '') !== 'pending_bank_transfer' || empty($d['account_number']) || empty($d['reference'])) {
        error_log('[SLC API] Paystack did not return a transfer account: ' . json_encode($resp));
        json_out(['error' => 'We could not create a payment account right now. Please try again in a moment.'], 502);
    }

    $pdo->beginTransaction();
    $pdo->prepare("UPDATE payments SET status = 'expired' WHERE ad_id = ? AND status = 'awaiting'")->execute([$adId]);
    $pdo->prepare(
        "INSERT INTO payments (ad_id, reference, amount_naira, account_bank, account_number, account_name, expires_at, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'awaiting')"
    )->execute([$adId, (string) $d['reference'], $amount, (string) ($d['bank']['name'] ?? ''), (string) $d['account_number'],
                (string) ($d['account_name'] ?? ''), (string) ($d['account_expires_at'] ?? $expires)]);
    $pdo->commit();

    json_out(['ok' => true, 'reference' => (string) $d['reference'], 'bank' => (string) ($d['bank']['name'] ?? ''),
              'account_number' => (string) $d['account_number'], 'account_name' => (string) ($d['account_name'] ?? ''),
              'amount' => $amount, 'expires_at' => (string) ($d['account_expires_at'] ?? $expires)]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    fail($e);
}
