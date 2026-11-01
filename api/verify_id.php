<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

/*
 * GET  api/verify_id.php   (warm-up only: wakes the OCR service)
 * POST api/verify_id.php   (multipart form: file, name, school)
 * Sends the picture to the private OCR service, remembers only the verdict in the session,
 * and forgets the picture. The OCR service decides "match" or "review"; it never rejects anyone.
 */
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
    // Warm-up: the sign-up page calls this while the student picks a file, so a sleeping OCR service wakes up early.
    rate_limit('verify-warm', client_ip(), 30, 3600);
    $ch = curl_init(rtrim(env('SLC_OCR_URL', 'http://ocr:8090'), '/') . '/health');
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_CONNECTTIMEOUT => 3, CURLOPT_TIMEOUT => 4]);
    curl_exec($ch);
    curl_close($ch);
    json_out(['ok' => true]);
}
require_method('POST');
require_same_origin();
rate_limit('verify-id', client_ip(), 8, 3600);

try {
    $name = trim((string) ($_POST['name'] ?? ''));
    $school = trim((string) ($_POST['school'] ?? ''));
    $f = $_FILES['file'] ?? null;
    if ($name === '' || !is_array($f) || ($f['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        json_out(['error' => 'Choose a picture of your ID card or admission letter.'], 422);
    }
    if ($f['size'] > 5 * 1024 * 1024) {
        json_out(['error' => 'That picture is too large (5 MB at most).'], 422);
    }
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
    if (!in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) {
        json_out(['error' => 'Use a JPEG, PNG or WEBP picture.'], 422);
    }

    $ch = curl_init(rtrim(env('SLC_OCR_URL', 'http://ocr:8090'), '/') . '/verify');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . env('SLC_INTERNAL_SECRET', '')],
        CURLOPT_POSTFIELDS     => ['file' => new CURLFile($f['tmp_name'], $mime, 'id'), 'name' => $name, 'school' => $school],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT        => 80,
    ]);
    $raw = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    @unlink($f['tmp_name']);

    $res = is_string($raw) ? json_decode($raw, true) : null;
    if ($status === 400 && is_array($res) && isset($res['message'])) {
        json_out(['error' => (string) $res['message']], 422);
    }
    if ($status !== 200 || !is_array($res) || !isset($res['decision'])) {
        json_out(['error' => 'ID checking is not available right now. You can skip it and verify later.', 'unavailable' => true], 503);
    }

    start_session();
    $_SESSION['idcheck'] = [
        'name'     => mb_strtolower($name),
        'decision' => $res['decision'] === 'match' ? 'match' : 'review',
        'number'   => isset($res['found']['number']) ? substr((string) $res['found']['number'], 0, 40) : null,
        'at'       => time(),
    ];
    json_out(['ok' => true, 'decision' => $_SESSION['idcheck']['decision'], 'number' => $_SESSION['idcheck']['number']]);
} catch (Throwable $e) {
    fail($e);
}
