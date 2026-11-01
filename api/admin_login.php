<?php
declare(strict_types=1);
require __DIR__ . '/config.php';
require __DIR__ . '/auth_lib.php';

/* POST api/admin_login.php  {"email","password"} */
require_method('POST');
require_same_origin();
require_json_request();
rate_limit('admin-ip', client_ip(), 10, 900);

try {
    $in = read_json();
    $email = mb_strtolower(trim((string) ($in['email'] ?? '')));
    $password = (string) ($in['password'] ?? '');
    rate_limit('admin-email', $email, 5, 900);

    $st = db()->prepare('SELECT id, password_hash FROM admin_users WHERE lower(email) = ?');
    $st->execute([$email]);
    $admin = $st->fetch();

    $fail = static fn () => json_out(['error' => 'Email or password is not right.'], 401);
    if (!$admin) {
        fake_password_check();
        $fail();
    }
    if (!password_verify($password, $admin['password_hash'])) {
        $fail();
    }

    start_session();
    session_regenerate_id(true);
    $_SESSION['admin_id'] = (int) $admin['id'];
    $_SESSION['admin_at'] = time();
    json_out(['ok' => true]);
} catch (Throwable $e) {
    fail($e);
}
