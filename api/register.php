<?php
declare(strict_types=1);
require __DIR__ . '/config.php';
require __DIR__ . '/auth_lib.php';

/*
 * POST api/register.php
 * {"name","email","password","school","department","year","programme"}
 * If the student scanned an ID first (api/verify_id.php), the result is read from their session.
 */
require_method('POST');
require_same_origin();
require_json_request();
rate_limit('register', client_ip(), 6, 3600);

try {
    $in = read_json();
    $name = trim((string) ($in['name'] ?? ''));
    $email = mb_strtolower(trim((string) ($in['email'] ?? '')));
    $password = (string) ($in['password'] ?? '');
    $school = trim((string) ($in['school'] ?? ''));
    $dept = trim((string) ($in['department'] ?? ''));
    $year = clamp_int($in['year'] ?? null, 2000, (int) date('Y') + 1, (int) date('Y'));
    $programme = clamp_int($in['programme'] ?? null, 2, 7, 4);

    $problems = [];
    if (mb_strlen($name) < 2 || mb_strlen($name) > 120) { $problems[] = 'Enter your full name.'; }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 160) { $problems[] = 'Enter a valid email address.'; }
    if ($msg = password_problem($password, $email)) { $problems[] = $msg; }
    if ($school === '' || mb_strlen($school) > 160) { $problems[] = 'Choose your school.'; }
    if ($dept === '' || mb_strlen($dept) > 120) { $problems[] = 'Enter your department.'; }
    if ($problems) {
        json_out(['error' => implode(' ', $problems)], 422);
    }

    // What the ID scan found, if they did one. It only counts if it was for the same name.
    start_session();
    $verification = 'unverified';
    $admission = null;
    $check = $_SESSION['idcheck'] ?? null;
    if (is_array($check) && ($check['name'] ?? '') === mb_strtolower($name) && time() - (int) ($check['at'] ?? 0) < 3600) {
        $verification = $check['decision'] === 'match' ? 'auto_matched' : 'needs_review';
        $admission = $check['number'] ?? null;
    }

    // A username from the name: "Ada Okafor" -> ada.okafor, ada.okafor2, ...
    $base = trim((string) preg_replace('/[^a-z0-9_.]+/', '.', mb_strtolower(iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $name) ?: $name)), '.');
    $base = substr($base !== '' ? $base : 'student', 0, 26);
    if (strlen($base) < 3) { $base .= '.slc'; }

    $pdo = db();
    $exists = $pdo->prepare('SELECT 1 FROM users WHERE lower(email) = ?');
    $exists->execute([$email]);
    if ($exists->fetchColumn()) {
        json_out(['error' => 'That email already has an account. Try logging in.'], 409);
    }
    $taken = $pdo->prepare('SELECT 1 FROM users WHERE username = ?');
    $username = $base;
    for ($i = 2; $i < 200; $i++) {
        $taken->execute([$username]);
        if (!$taken->fetchColumn()) { break; }
        $username = $base . $i;
    }

    $ins = $pdo->prepare(
        'INSERT INTO users (username, full_name, email, password_hash, school, department, admission_year, programme_years, verification, admission_no)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id, username, full_name, school, department, verification'
    );
    $ins->execute([$username, $name, $email, hash_password($password), $school, $dept, $year, $programme, $verification, $admission]);
    $user = $ins->fetch();

    unset($_SESSION['idcheck']);
    log_in_user((int) $user['id']);
    json_out(['ok' => true, 'user' => public_user($user)], 201);
} catch (Throwable $e) {
    fail($e);
}
