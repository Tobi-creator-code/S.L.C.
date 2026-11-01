<?php
declare(strict_types=1);
require __DIR__ . '/config.php';
require __DIR__ . '/auth_lib.php';

/*
 * GET  api/admin_users.php?filter=waiting|verified     accounts to review (waiting = not verified yet)
 * POST api/admin_users.php {"action":"verify"|"decline","user_id":12}
 *
 * verify  marks the account verified.
 * decline signs the student out straight away (their session stops working on the very next request, because
 *         every request checks the account still exists) and deletes the account. Their ads are switched off and
 *         their contact details removed; payment records are kept for your accounts.
 * Admin session only (api/admin_login.php).
 */
try {
    require_admin();
    $pdo = db();

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
        $filter = (string) ($_GET['filter'] ?? 'waiting');
        $where = $filter === 'verified' ? "verification = 'verified'" : "verification <> 'verified'";
        $order = $filter === 'verified' ? 'created_at DESC' : 'created_at ASC';
        $st = $pdo->query(
            "SELECT id, full_name, username, email, school, department, admission_year, admission_no, verification,
                    to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') AS created_at
             FROM users WHERE $where ORDER BY $order LIMIT 100"
        );
        json_out(['users' => $st->fetchAll()]);
    }

    require_method('POST');
    require_same_origin();
    require_json_request();
    $in = read_json();
    $uid = clamp_int($in['user_id'] ?? null, 1, PHP_INT_MAX, 0);
    $action = (string) ($in['action'] ?? '');

    if ($action === 'verify') {
        $st = $pdo->prepare("UPDATE users SET verification = 'verified' WHERE id = ? AND verification <> 'verified'");
        $st->execute([$uid]);
        if ($st->rowCount() === 0) {
            json_out(['error' => 'That account is already verified or no longer exists.'], 409);
        }
        json_out(['ok' => true]);
    }

    if ($action === 'decline') {
        $pdo->beginTransaction();
        $exists = $pdo->prepare('SELECT 1 FROM users WHERE id = ? FOR UPDATE');
        $exists->execute([$uid]);
        if (!$exists->fetchColumn()) {
            $pdo->rollBack();
            json_out(['error' => 'That account no longer exists.'], 409);
        }
        $pdo->prepare(
            "UPDATE ads SET status = 'rejected', reject_reason = 'This account was not verified.', updated_at = now()
             WHERE status IN ('pending', 'live', 'paused') AND seller_id IN (SELECT id FROM sellers WHERE user_id = ?)"
        )->execute([$uid]);
        $pdo->prepare('UPDATE sellers SET is_active = FALSE, phone = NULL, bio = NULL, location = NULL WHERE user_id = ?')->execute([$uid]);
        $pdo->prepare('DELETE FROM users WHERE id = ?')->execute([$uid]);
        $pdo->commit();
        json_out(['ok' => true]);
    }

    json_out(['error' => 'Unknown action'], 400);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    fail($e);
}
