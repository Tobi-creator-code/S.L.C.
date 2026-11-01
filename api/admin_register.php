<?php
declare(strict_types=1);
require __DIR__ . '/config.php';
require __DIR__ . '/auth_lib.php';

/* POST api/admin_register.php  {"email","password","code"}
 * Creates an admin account. It only works while the SLC_ADMIN_CODE setting exists (at least 12 characters)
 * and the code typed matches it. Delete SLC_ADMIN_CODE from the hosting settings to switch this off. */
require_method('POST');
require_same_origin();
require_json_request();
rate_limit('admin-reg-ip', client_ip(), 5, 3600);
rate_limit('admin-reg-all', 'everyone', 30, 3600);

try {
    $secret = env('SLC_ADMIN_CODE', '');
    if (strlen($secret) < 12) {
        json_out(['error' => 'Admin sign-up is switched off.'], 403);
    }
    $in = read_json();
    $email = mb_strtolower(trim((string) ($in['email'] ?? '')));
    $password = (string) ($in['password'] ?? '');
    $code = (string) ($in['code'] ?? '');

    if (!hash_equals($secret, $code)) {
        json_out(['error' => 'That admin sign-up code is not right.'], 403);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 160) {
        json_out(['error' => 'Enter a valid email address.'], 422);
    }
    if (mb_strlen($password) < 12 || strlen($password) > 200) {
        json_out(['error' => 'Use a password of 12 to 200 characters.'], 422);
    }

    $ins = db()->prepare("INSERT INTO admin_users (email, password_hash, totp_secret) VALUES (?, ?, '') ON CONFLICT (email) DO NOTHING RETURNING id");
    $ins->execute([$email, hash_password($password)]);
    $id = $ins->fetchColumn();
    if ($id === false) {
        json_out(['error' => 'That email is already an admin. Sign in instead.'], 409);
    }

    start_session();
    session_regenerate_id(true);
    $_SESSION['admin_id'] = (int) $id;
    $_SESSION['admin_at'] = time();
    json_out(['ok' => true]);
} catch (Throwable $e) {
    fail($e);
}
