<?php
declare(strict_types=1);

/*
 * Login, password and two-factor helpers. Included by the endpoints; not an endpoint itself.
 * Needs config.php to be loaded first.
 */

/* ---------- passwords ---------- */

function hash_password(string $plain): string
{
    if (defined('PASSWORD_ARGON2ID')) {
        return password_hash($plain, PASSWORD_ARGON2ID, ['memory_cost' => 65536, 'time_cost' => 3, 'threads' => 1]);
    }
    return password_hash($plain, PASSWORD_BCRYPT, ['cost' => 12]);
}

/** Do the same amount of work when the email does not exist, so timing does not reveal which emails are registered. */
function fake_password_check(): void
{
    static $hash = null;
    if ($hash === null) {
        $hash = hash_password('not-a-real-password');
    }
    password_verify('wrong-password', $hash);
}

/** Returns a message for the student if the password is too weak, otherwise null. */
function password_problem(string $plain, string $email = ''): ?string
{
    $len = mb_strlen($plain);
    if ($len < 8) {
        return 'Use at least 8 characters for your password.';
    }
    if ($len > 128) {
        return 'That password is too long (128 characters at most).';
    }
    $common = ['password', 'password1', '12345678', '123456789', '1234567890', 'qwertyuiop', 'iloveyou1', '11111111', 'abcd1234'];
    if (in_array(mb_strtolower($plain), $common, true)) {
        return 'That password is too easy to guess. Try something longer.';
    }
    $local = mb_strtolower(explode('@', $email)[0] ?? '');
    if ($local !== '' && mb_strtolower($plain) === $local) {
        return 'Your password should not be the same as your email.';
    }
    return null;
}

/** POST bodies must be JSON. Browsers cannot send that cross-site without permission, which blocks forged forms. */
function require_json_request(): void
{
    if (stripos((string) ($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json') !== 0) {
        json_out(['error' => 'Send JSON'], 415);
    }
}

/** Log a student in: new session id (stops session fixation) and remember who they are. */
function log_in_user(int $userId): void
{
    start_session();
    session_regenerate_id(true);
    $_SESSION['user_id'] = $userId;
}

function public_user(array $u): array
{
    return [
        'id'           => (int) $u['id'],
        'name'         => $u['full_name'],
        'username'     => $u['username'],
        'department'   => $u['department'] ?? '',
        'school'       => $u['school'] ?? '',
        'verification' => $u['verification'] ?? 'unverified',
    ];
}

/* ---------- admin: encrypted secrets and 6-digit codes ---------- */

function app_key(): string
{
    $key = base64_decode(env('SLC_APP_KEY', ''), true);
    if ($key === false || strlen($key) !== SODIUM_CRYPTO_SECRETBOX_KEYBYTES) {
        throw new RuntimeException('SLC_APP_KEY must be 32 random bytes, base64 encoded (see README).');
    }
    return $key;
}

function encrypt_secret(string $plain): string
{
    $nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
    return base64_encode($nonce . sodium_crypto_secretbox($plain, $nonce, app_key()));
}

function decrypt_secret(string $stored): string
{
    $raw = base64_decode($stored, true);
    if ($raw === false || strlen($raw) <= SODIUM_CRYPTO_SECRETBOX_NONCEBYTES) {
        throw new RuntimeException('Bad stored secret');
    }
    $nonce = substr($raw, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
    $plain = sodium_crypto_secretbox_open(substr($raw, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES), $nonce, app_key());
    if ($plain === false) {
        throw new RuntimeException('Could not decrypt the stored secret (wrong SLC_APP_KEY?)');
    }
    return $plain;
}

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32_encode(string $raw): string
{
    $bits = '';
    foreach (str_split($raw) as $ch) {
        $bits .= str_pad(decbin(ord($ch)), 8, '0', STR_PAD_LEFT);
    }
    $out = '';
    foreach (str_split($bits, 5) as $chunk) {
        $out .= BASE32_ALPHABET[bindec(str_pad($chunk, 5, '0'))];
    }
    return $out;
}

function base32_decode(string $text): string
{
    $bits = '';
    foreach (str_split(strtoupper(rtrim($text, '='))) as $ch) {
        $pos = strpos(BASE32_ALPHABET, $ch);
        if ($pos === false) {
            continue;
        }
        $bits .= str_pad(decbin($pos), 5, '0', STR_PAD_LEFT);
    }
    $out = '';
    foreach (str_split($bits, 8) as $byte) {
        if (strlen($byte) === 8) {
            $out .= chr(bindec($byte));
        }
    }
    return $out;
}

/** The 6-digit code for a given 30-second step (RFC 6238, as used by Google Authenticator and similar apps). */
function totp_code(string $rawSecret, int $step, int $digits = 6): string
{
    $hash = hash_hmac('sha1', pack('J', $step), $rawSecret, true);
    $offset = ord($hash[19]) & 0x0F;
    $value = ((ord($hash[$offset]) & 0x7F) << 24) | ((ord($hash[$offset + 1]) & 0xFF) << 16)
           | ((ord($hash[$offset + 2]) & 0xFF) << 8) | (ord($hash[$offset + 3]) & 0xFF);
    return str_pad((string) ($value % (10 ** $digits)), $digits, '0', STR_PAD_LEFT);
}

/**
 * Checks a typed code, allowing one step either side for clock drift.
 * Returns the step that matched (so the caller can refuse the same code twice), or null.
 */
function totp_match(string $rawSecret, string $typed, ?int $lastUsedStep = null, ?int $nowStep = null): ?int
{
    $typed = preg_replace('/\s+/', '', $typed) ?? '';
    if (!preg_match('/^\d{6}$/', $typed)) {
        return null;
    }
    $now = $nowStep ?? intdiv(time(), 30);
    for ($s = $now - 1; $s <= $now + 1; $s++) {
        if ($lastUsedStep !== null && $s <= $lastUsedStep) {
            continue;
        }
        if (hash_equals(totp_code($rawSecret, $s), $typed)) {
            return $s;
        }
    }
    return null;
}

/** The admin must have logged in with a password AND a code, recently. */
function require_admin(): int
{
    start_session();
    $id = $_SESSION['admin_id'] ?? null;
    $at = $_SESSION['admin_at'] ?? 0;
    if (!$id || time() - (int) $at > 1800) {            // 30 minutes without activity logs the admin out
        unset($_SESSION['admin_id'], $_SESSION['admin_at']);
        json_out(['error' => 'Admin login required'], 401);
    }
    $_SESSION['admin_at'] = time();
    return (int) $id;
}
