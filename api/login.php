<?php
declare(strict_types=1);
require __DIR__ . '/config.php';
require __DIR__ . '/auth_lib.php';

/* POST api/login.php  {"email","password"} */
require_method('POST');
require_same_origin();
require_json_request();
rate_limit('login-ip', client_ip(), 20, 600);          // 20 tries per 10 minutes from one place

try {
    $in = read_json();
    $email = mb_strtolower(trim((string) ($in['email'] ?? '')));
    $password = (string) ($in['password'] ?? '');
    if ($email === '' || $password === '' || mb_strlen($password) > 128) {
        json_out(['error' => 'Enter your email and password.'], 422);
    }
    rate_limit('login-email', $email, 6, 900);         // 6 tries per 15 minutes for one email (stops password guessing)

    $st = db()->prepare('SELECT id, username, full_name, school, department, verification, password_hash FROM users WHERE lower(email) = ?');
    $st->execute([$email]);
    $user = $st->fetch();

    if (!$user || !$user['password_hash']) {
        fake_password_check();
        json_out(['error' => 'Email or password is not right.'], 401);   // same message either way
    }
    if (!password_verify($password, $user['password_hash'])) {
        json_out(['error' => 'Email or password is not right.'], 401);
    }
    if (password_needs_rehash($user['password_hash'], defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_BCRYPT)) {
        db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([hash_password($password), $user['id']]);
    }
    log_in_user((int) $user['id']);
    json_out(['ok' => true, 'user' => public_user($user)]);
} catch (Throwable $e) {
    fail($e);
}
