<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

/*
 * POST api/track.php   {"ad_id": 12, "type": "view" | "contact" | "save" | "report"}
 * Counts one event per visitor, per ad, per type, per day (so refreshing cannot inflate numbers).
 */
require_method('POST');
require_same_origin();

try {
    $in = read_json();
    $adId = clamp_int($in['ad_id'] ?? null, 1, PHP_INT_MAX, 0);
    $type = (string) ($in['type'] ?? '');
    $column = ['view' => 'views', 'contact' => 'contact_taps', 'save' => 'saves', 'report' => null];

    if ($adId < 1 || !array_key_exists($type, $column)) {
        json_out(['error' => 'Invalid request'], 400);
    }

    $pdo = db();
    $pdo->beginTransaction();

    $exists = $pdo->prepare("SELECT 1 FROM ads WHERE id = ? AND status = 'live'");
    $exists->execute([$adId]);
    if (!$exists->fetchColumn()) {
        $pdo->rollBack();
        json_out(['error' => 'Ad not found'], 404);
    }

    $ins = $pdo->prepare(
        'INSERT INTO ad_events (ad_id, event_type, visitor_hash) VALUES (?, ?, ?)
         ON CONFLICT (ad_id, event_type, visitor_hash, event_day) DO NOTHING
         RETURNING id'
    );
    $ins->execute([$adId, $type, visitor_hash()]);
    $isNew = (bool) $ins->fetchColumn();

    if ($isNew && $column[$type] !== null) {
        // $column comes from the fixed list above, never from the visitor.
        $pdo->prepare('UPDATE ads SET ' . $column[$type] . ' = ' . $column[$type] . ' + 1 WHERE id = ?')->execute([$adId]);
    }
    $pdo->commit();

    json_out(['ok' => true, 'counted' => $isNew]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    fail($e);
}
