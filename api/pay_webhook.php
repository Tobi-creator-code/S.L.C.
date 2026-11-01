<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

/*
 * Paystack calls this address when a transfer arrives.
 * In your Paystack dashboard set the webhook URL to:  https://YOUR-SITE/api/pay_webhook.php
 *
 * Safety checks, in order: (1) the signature proves the message came from Paystack,
 * (2) we ask Paystack again to confirm the payment, (3) the amount must match the package price.
 */
require_method('POST');

try {
    $raw = file_get_contents('php://input') ?: '';
    $sig = $_SERVER['HTTP_X_PAYSTACK_SIGNATURE'] ?? '';
    if ($sig === '' || !hash_equals(hash_hmac('sha512', $raw, paystack_secret()), $sig)) {
        json_out(['error' => 'Bad signature'], 401);
    }

    $event = json_decode($raw, true);
    $type = (string) ($event['event'] ?? '');
    $ref = (string) ($event['data']['reference'] ?? '');
    if ($ref === '' || !preg_match('/^[A-Za-z0-9_-]{6,64}$/', $ref)) {
        json_out(['ok' => true]);                       // nothing we can use; tell Paystack we got it
    }
    $pdo = db();

    if ($type === 'bank.transfer.rejected') {
        $pdo->prepare("UPDATE payments SET status = 'failed', note = 'Transfer rejected by Paystack (wrong amount or flagged)' WHERE reference = ? AND status = 'awaiting'")->execute([$ref]);
        json_out(['ok' => true]);
    }
    if ($type !== 'charge.success') {
        json_out(['ok' => true]);
    }

    // Ask Paystack to confirm, instead of trusting the message alone.
    $v = paystack('GET', '/transaction/verify/' . rawurlencode($ref));
    $d = $v['data'] ?? [];
    if (empty($v['status']) || ($d['status'] ?? '') !== 'success' || ($d['currency'] ?? '') !== 'NGN') {
        json_out(['ok' => true]);
    }

    $pdo->beginTransaction();
    $q = $pdo->prepare("SELECT id, ad_id, amount_naira, status FROM payments WHERE reference = ? FOR UPDATE");
    $q->execute([$ref]);
    $pay = $q->fetch();
    if (!$pay) {
        $pdo->rollBack();
        json_out(['ok' => true]);
    }
    if ($pay['status'] === 'success') {                 // already handled (Paystack can send twice)
        $pdo->rollBack();
        json_out(['ok' => true]);
    }
    if ((int) ($d['amount'] ?? 0) !== (int) $pay['amount_naira'] * 100) {
        $pdo->prepare("UPDATE payments SET status = 'failed', note = 'Amount did not match the package price' WHERE id = ?")->execute([$pay['id']]);
        $pdo->commit();
        json_out(['ok' => true]);
    }

    $pdo->prepare("UPDATE payments SET status = 'success', paid_at = now() WHERE id = ?")->execute([$pay['id']]);
    if (env('SLC_AUTO_APPROVE', '0') === '1') {
        // Skip the review step: the ad goes live as soon as it is paid.
        $pdo->prepare(
            "UPDATE ads a SET status = 'live', starts_at = now(), ends_at = now() + make_interval(days => k.days), updated_at = now()
             FROM ad_packages k WHERE k.id = a.package_id AND a.id = ? AND a.status = 'pending'"
        )->execute([$pay['ad_id']]);
    }
    $pdo->commit();

    $o = $pdo->prepare('SELECT s.user_id FROM ads a JOIN sellers s ON s.id = a.seller_id WHERE a.id = ?');
    $o->execute([$pay['ad_id']]);
    if ($uid = $o->fetchColumn()) {
        notify_users([$uid], 'Payment received', 'We got your payment. Your ad is waiting for a quick review.', 'market.html');
    }
    json_out(['ok' => true]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    fail($e);
}
