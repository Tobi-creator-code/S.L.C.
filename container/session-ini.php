<?php
// Prints the PHP session settings. With SLC_REDIS_URL set, logins live in Redis (they survive
// restarts and sleeping). Without it, PHP keeps them in files, which the free host wipes when it sleeps.
$url = getenv('SLC_REDIS_URL') ?: '';
if ($url === '') {
    echo "; no SLC_REDIS_URL: sessions stay in files\n";
    exit(0);
}
$u = parse_url($url);
if ($u === false || empty($u['host'])) {
    fwrite(STDERR, "SLC_REDIS_URL is not a valid redis:// or rediss:// address; using file sessions\n");
    exit(0);
}
$tls  = (($u['scheme'] ?? '') === 'rediss');
$port = $u['port'] ?? 6379;
$path = ($tls ? 'tls://' : 'tcp://') . $u['host'] . ':' . $port;
if (!empty($u['pass'])) {
    $path .= '?auth=' . urlencode(urldecode($u['pass']));
}
echo "session.save_handler = redis\n";
echo 'session.save_path = "' . addcslashes($path, '"\\') . "\"\n";
