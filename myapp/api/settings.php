<?php
require_once __DIR__ . '/config.php';

$user   = requireAuth();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// =============================================
// GET /api/settings.php  → جلب الإعدادات
// =============================================
if ($method === 'GET') {
    $db   = getDB();
    $stmt = $db->prepare("SELECT api_key, theme, language FROM settings WHERE user_id = ?");
    $stmt->bind_param("i", $user['id']);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $db->close();

    if (!$row) {
        sendSuccess(['api_key' => null, 'theme' => 'dark', 'language' => 'ar']);
    }

    // إخفاء جزء من مفتاح API للأمان
    if ($row['api_key']) {
        $row['api_key_preview'] = substr($row['api_key'], 0, 8) . '...' . substr($row['api_key'], -4);
    }

    sendSuccess($row);
}

// =============================================
// PUT /api/settings.php  → تحديث الإعدادات
// =============================================
if ($method === 'PUT') {
    $body    = getBody();
    $apiKey  = trim($body['api_key'] ?? '');
    $theme   = in_array($body['theme'] ?? '', ['light', 'dark']) ? $body['theme'] : 'dark';
    $lang    = trim($body['language'] ?? 'ar');

    $db = getDB();

    // INSERT or UPDATE (UPSERT)
    $stmt = $db->prepare("
        INSERT INTO settings (user_id, api_key, theme, language)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            api_key  = VALUES(api_key),
            theme    = VALUES(theme),
            language = VALUES(language)
    ");

    $apiKeyVal = !empty($apiKey) ? $apiKey : null;
    $stmt->bind_param("isss", $user['id'], $apiKeyVal, $theme, $lang);
    $stmt->execute();
    $db->close();

    sendSuccess(['message' => 'تم حفظ الإعدادات']);
}

sendError('الطلب غير معروف', 404);
