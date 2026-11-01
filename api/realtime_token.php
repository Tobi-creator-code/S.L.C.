<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

/*
 * GET api/realtime_token.php
 * A 5-minute pass the browser shows to the realtime (WebSocket) server.
 * It lists which students this person may message and see online: their accepted friends.
 */
require_method('GET');
rate_limit('rt-token', client_ip(), 30, 60);

try {
    $uid = auth_user_id();
    if ($uid === null) {
        json_out(['error' => 'Not signed in'], 401);
    }
    $secret = env('SLC_REALTIME_SECRET', '');
    if (strlen($secret) < 24) {
        json_out(['error' => 'Realtime is not set up'], 503);
    }
    $pdo = db();
    $me = $pdo->prepare('SELECT full_name FROM users WHERE id = ?');
    $me->execute([$uid]);
    $name = (string) $me->fetchColumn();

    // Friends who have not hidden their online status from this person.
    $fr = $pdo->prepare("SELECT friend_id FROM friendships WHERE user_id = ? AND status = 'accepted' LIMIT 2000");
    $fr->execute([$uid]);
    $peers = array_map('strval', $fr->fetchAll(PDO::FETCH_COLUMN));

    $b64 = static fn (string $s): string => rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
    $body = $b64(json_encode(['uid' => (string) $uid, 'name' => $name, 'exp' => time() + 300, 'peers' => $peers], JSON_UNESCAPED_UNICODE));
    $sig = $b64(hash_hmac('sha256', $body, $secret, true));
    json_out(['token' => $body . '.' . $sig]);
} catch (Throwable $e) {
    fail($e);
}
