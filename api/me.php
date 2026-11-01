<?php
declare(strict_types=1);
require __DIR__ . '/config.php';
require __DIR__ . '/auth_lib.php';

/* GET api/me.php  ->  the signed-in student, or 401 */
require_method('GET');

try {
    $id = auth_user_id();
    if ($id === null) {
        json_out(['error' => 'Not signed in', 'removed' => !empty($GLOBALS['slc_account_removed'])], 401);
    }
    $st = db()->prepare('SELECT id, username, full_name, school, department, verification FROM users WHERE id = ?');
    $st->execute([$id]);
    $u = $st->fetch();
    if (!$u) {
        json_out(['error' => 'Not signed in'], 401);
    }
    json_out(['user' => public_user($u)]);
} catch (Throwable $e) {
    fail($e);
}
