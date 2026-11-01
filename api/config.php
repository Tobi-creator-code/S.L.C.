<?php
declare(strict_types=1);

/*
 * Shared settings and helpers for the SLC API (PHP 8.0+ with the pdo_pgsql extension).
 *
 * Set these as environment variables on your server (best), or change the defaults below.
 *   SLC_DB_HOST, SLC_DB_PORT, SLC_DB_NAME, SLC_DB_USER, SLC_DB_PASS, SLC_APP_SALT
 * Never commit real passwords to Git.
 */

function env(string $key, string $default): string
{
    $v = getenv($key);
    return ($v === false || $v === '') ? $default : $v;
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $url = env('SLC_DATABASE_URL', '');   // hosted databases (Neon, Supabase...) give one address like postgres://user:pass@host/db
    if ($url !== '') {
        $u = parse_url($url);
        if ($u === false || empty($u['host'])) {
            throw new RuntimeException('SLC_DATABASE_URL is not a valid postgres:// address');
        }
        parse_str($u['query'] ?? '', $q);
        $host = $u['host'];
        $port = (string) ($u['port'] ?? 5432);
        $name = ltrim($u['path'] ?? '', '/');
        $user = urldecode($u['user'] ?? '');
        $pass = urldecode($u['pass'] ?? '');
        $ssl  = (string) ($q['sslmode'] ?? 'require');
    } else {
        $host = env('SLC_DB_HOST', '127.0.0.1');
        $port = env('SLC_DB_PORT', '5432');
        $name = env('SLC_DB_NAME', 'slc');
        $user = env('SLC_DB_USER', 'slc_app');
        $pass = env('SLC_DB_PASS', '');
        $ssl  = env('SLC_DB_SSLMODE', 'prefer');
    }
    $dsn = sprintf('pgsql:host=%s;port=%s;dbname=%s;sslmode=%s', $host, $port, $name, $ssl);
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
    return $pdo;
}

/** Send a JSON response and stop. */
function json_out(array $data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/** Only allow the HTTP method(s) an endpoint expects. */
function require_method(string ...$allowed): void
{
    if (!in_array($_SERVER['REQUEST_METHOD'] ?? '', $allowed, true)) {
        header('Allow: ' . implode(', ', $allowed));
        json_out(['error' => 'Method not allowed'], 405);
    }
}

/** Read and decode a JSON request body (max 20 KB). */
function read_json(): array
{
    $raw = file_get_contents('php://input', false, null, 0, 20480);
    $data = json_decode($raw === false ? '' : $raw, true);
    if (!is_array($data)) {
        json_out(['error' => 'Send a JSON body'], 400);
    }
    return $data;
}

/** Block cross-site POSTs: the Origin header, when present, must match this site. */
function require_same_origin(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '') {
        return;
    }
    $host = parse_url($origin, PHP_URL_HOST);
    $port = parse_url($origin, PHP_URL_PORT);
    $originHost = $host . ($port ? ':' . $port : '');
    if (!hash_equals((string) ($_SERVER['HTTP_HOST'] ?? ''), $originHost)) {
        json_out(['error' => 'Cross-site request blocked'], 403);
    }
}

/** An anonymous, salted fingerprint so one visitor counts once per ad per day. */
function visitor_hash(): string
{
    return hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|' . ($_SERVER['HTTP_USER_AGENT'] ?? '') . '|' . env('SLC_APP_SALT', 'change-this-salt'));
}

/** Escape LIKE wildcards so a search for "100%" matches the text, not everything. */
function like_term(string $term): string
{
    return '%' . addcslashes($term, "%_\\") . '%';
}

/** Split a search string into at most 5 lowercase words. */
function search_terms(string $q): array
{
    $q = trim(mb_substr($q, 0, 60));
    if ($q === '') {
        return [];
    }
    $parts = preg_split('/\s+/u', mb_strtolower($q), -1, PREG_SPLIT_NO_EMPTY) ?: [];
    return array_slice($parts, 0, 5);
}

function clamp_int($value, int $min, int $max, int $default): int
{
    if ($value === null || $value === '' || !is_numeric($value)) {
        return $default;
    }
    return max($min, min($max, (int) $value));
}

/** Start the visitor's session with safe cookie settings (HTTPS-only when the site is on HTTPS). */
function start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    session_name('slc_sid');
    session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'secure' => $https, 'httponly' => true, 'samesite' => 'Lax']);
    ini_set('session.use_strict_mode', '1');
    session_start();
}

/** The signed-in student's id, or null. Set by api/login.php and api/register.php. */
function auth_user_id(): ?int
{
    start_session();
    if (!isset($_SESSION['user_id'])) {
        return null;
    }
    $id = (int) $_SESSION['user_id'];
    static $alive = [];
    if (!isset($alive[$id])) {
        $st = db()->prepare('SELECT 1 FROM users WHERE id = ?');
        $st->execute([$id]);
        $alive[$id] = (bool) $st->fetchColumn();
    }
    if (!$alive[$id]) {            // the account was deleted (for example declined by an admin): sign out now
        unset($_SESSION['user_id'], $_SESSION['idcheck']);
        $GLOBALS['slc_account_removed'] = true;
        return null;
    }
    return $id;
}

/** Log the real error on the server, show a safe message to the visitor. */
function fail(Throwable $e): void
{
    error_log('[SLC API] ' . get_class($e) . ': ' . $e->getMessage());
    json_out(['error' => 'Something went wrong. Please try again.'], 500);
}

/* ---------- Paystack "Pay with Transfer" (temporary bank accounts) ---------- */

function paystack_secret(): string
{
    $key = env('PAYSTACK_SECRET_KEY', '');
    if ($key === '') {
        throw new RuntimeException('PAYSTACK_SECRET_KEY is not set');
    }
    return $key;
}

/** Minutes a temporary account stays valid. Paystack never goes below 15 or above 480 (8 hours). */
function pay_expiry_minutes(): int
{
    return clamp_int(env('SLC_PAY_EXPIRY_MINUTES', '15'), 15, 480, 15);
}

/** Call the Paystack API. Returns the decoded JSON, or throws. Needs the PHP curl extension. */
function paystack(string $method, string $path, ?array $body = null): array
{
    $ch = curl_init('https://api.paystack.co' . $path);
    $headers = ['Authorization: Bearer ' . paystack_secret(), 'Content-Type: application/json'];
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 8,
        CURLOPT_TIMEOUT        => 20,
    ]);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }
    $raw = curl_exec($ch);
    if ($raw === false) {
        $err = curl_error($ch);
        curl_close($ch);
        throw new RuntimeException('Paystack request failed: ' . $err);
    }
    curl_close($ch);
    $data = json_decode((string) $raw, true);
    if (!is_array($data)) {
        throw new RuntimeException('Paystack sent a reply that is not JSON');
    }
    return $data;
}

/* ---------- Redis (sessions, rate limits). Optional in development. ---------- */

function redis(): ?Redis
{
    static $r = false;
    if ($r !== false) {
        return $r;
    }
    $r = null;
    if (!class_exists('Redis')) {
        return null;
    }
    try {
        $client = new Redis();
        $url = env('SLC_REDIS_URL', '');   // hosted Redis (Upstash...) gives one address like rediss://default:pass@host:6379
        if ($url !== '') {
            $u = parse_url($url);
            if ($u === false || empty($u['host'])) {
                throw new RuntimeException('SLC_REDIS_URL is not a valid redis:// or rediss:// address');
            }
            $tls  = (($u['scheme'] ?? '') === 'rediss');
            $host = ($tls ? 'tls://' : '') . $u['host'];
            $port = (int) ($u['port'] ?? 6379);
            $pass = urldecode($u['pass'] ?? '');
        } else {
            $host = env('SLC_REDIS_HOST', '127.0.0.1');
            $port = (int) env('SLC_REDIS_PORT', '6379');
            $pass = env('SLC_REDIS_PASSWORD', '');
        }
        $client->connect($host, $port, 3.0);
        if ($pass !== '') {
            $client->auth($pass);
        }
        $r = $client;
    } catch (Throwable $e) {
        error_log('[SLC API] Redis not reachable: ' . $e->getMessage());
    }
    return $r;
}

function client_ip(): string
{
    // Behind nginx the real address is passed by the proxy; REMOTE_ADDR is the fallback.
    return (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
}

/**
 * Allow at most $max hits per $windowSec for one visitor and one kind of action,
 * otherwise answer "429 Too many requests". Uses Redis; without Redis it falls back to APCu,
 * and without either it does nothing (fine for local testing, not for a live site).
 */
function rate_limit(string $bucket, string $who, int $max, int $windowSec): void
{
    $key = 'slc:rl:' . $bucket . ':' . hash('sha256', $who);
    $count = null;
    if ($r = redis()) {
        $count = (int) $r->incr($key);
        if ($count === 1) {
            $r->expire($key, $windowSec);
        }
    } elseif (function_exists('apcu_inc')) {
        $ok = false;
        $count = (int) apcu_inc($key, 1, $ok, $windowSec);
        if (!$ok) {
            apcu_store($key, 1, $windowSec);
            $count = 1;
        }
    }
    if ($count !== null && $count > $max) {
        header('Retry-After: ' . $windowSec);
        json_out(['error' => 'Too many tries. Please wait a little and try again.'], 429);
    }
}

/* ---------- Telling the realtime service to pop a notification up ---------- */

/** Best effort: if the realtime service is down, nothing breaks. */
function notify_users(array $userIds, string $title, string $body, string $url = ''): void
{
    $secret = env('SLC_INTERNAL_SECRET', '');
    if ($secret === '' || !$userIds) {
        return;
    }
    $ch = curl_init(rtrim(env('SLC_REALTIME_INTERNAL_URL', 'http://realtime:8081'), '/') . '/internal/notify');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . $secret, 'Content-Type: application/json'],
        CURLOPT_POSTFIELDS     => json_encode(['uids' => array_map('strval', array_values($userIds)), 'title' => $title, 'body' => $body, 'url' => $url]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 2,
        CURLOPT_TIMEOUT        => 3,
    ]);
    curl_exec($ch);
    curl_close($ch);
}
