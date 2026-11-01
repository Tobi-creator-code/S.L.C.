<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

/*
 * GET api/search.php?q=hydraulic&type=all|users|posts|videos&limit=20
 * Returns {"users":[...], "posts":[...], "videos":[...]}. Ads are searched with api/ads.php.
 * Only public things are returned: students who allow it, posts and videos set to "everyone".
 */
require_method('GET');
rate_limit('search', client_ip(), 40, 60);

try {
    $q = trim(mb_substr((string) ($_GET['q'] ?? ''), 0, 60));
    $type = (string) ($_GET['type'] ?? 'all');
    $limit = clamp_int($_GET['limit'] ?? null, 1, 30, 20);
    $out = ['users' => [], 'posts' => [], 'videos' => []];
    if (mb_strlen($q) < 2) {
        json_out($out);
    }
    $pdo = db();
    $like = like_term($q);                                   // anywhere in the text
    $prefix = addcslashes(mb_strtolower($q), "%_\\") . '%';  // at the start (ranked first)

    if ($type === 'all' || $type === 'users') {
        $st = $pdo->prepare(
            'SELECT username, full_name AS name, school, department
             FROM users
             WHERE is_searchable AND (username ILIKE ? OR full_name ILIKE ? OR department ILIKE ?)
             ORDER BY (lower(username) LIKE ? OR lower(full_name) LIKE ?) DESC, full_name
             LIMIT ?'
        );
        $st->execute([$like, $like, $like, $prefix, $prefix, $limit]);
        $out['users'] = $st->fetchAll();
    }

    $stamp = "to_char(%s AT TIME ZONE 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"')";

    if ($type === 'all' || $type === 'posts') {
        $st = $pdo->prepare(
            'SELECT p.id, u.full_name AS author, u.username AS author_username, p.body, ' . sprintf($stamp, 'p.created_at') . ' AS created_at
             FROM posts p JOIN users u ON u.id = p.user_id
             WHERE p.visibility = \'everyone\' AND NOT p.is_deleted
               AND (p.search_vec @@ websearch_to_tsquery(\'simple\', ?) OR p.body ILIKE ?)
             ORDER BY ts_rank(p.search_vec, websearch_to_tsquery(\'simple\', ?)) DESC, p.created_at DESC
             LIMIT ?'
        );
        $st->execute([$q, $like, $q, $limit]);
        $out['posts'] = $st->fetchAll();
    }

    if ($type === 'all' || $type === 'videos') {
        $st = $pdo->prepare(
            'SELECT m.id, m.title, m.duration_sec AS duration, m.thumb_key AS thumb, u.full_name AS author, ' . sprintf($stamp, 'm.created_at') . ' AS created_at
             FROM media m JOIN users u ON u.id = m.user_id
             WHERE m.kind = \'video\' AND m.status = \'ready\' AND m.visibility = \'everyone\'
               AND (m.search_vec @@ websearch_to_tsquery(\'simple\', ?) OR m.title ILIKE ?)
             ORDER BY m.created_at DESC
             LIMIT ?'
        );
        $st->execute([$q, $like, $limit]);
        $out['videos'] = array_map(static function (array $v): array {
            $s = (int) $v['duration'];
            $v['duration'] = $s > 0 ? intdiv($s, 60) . ':' . str_pad((string) ($s % 60), 2, '0', STR_PAD_LEFT) : '';
            return $v;
        }, $st->fetchAll());
    }

    json_out($out);
} catch (Throwable $e) {
    fail($e);
}
