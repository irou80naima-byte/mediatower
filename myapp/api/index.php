<?php
// ─── Suppress HTML error output immediately ───────────────────────────────
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
error_reporting(0);

// ─── Global JSON error/exception handlers ─────────────────────────────────
set_error_handler(function ($severity, $message, $file, $line) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'error' => 'Server error: ' . $message]);
    exit();
});
set_exception_handler(function ($e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'error' => 'Exception: ' . $e->getMessage()]);
    exit();
});

/**
 * Mediatower PLAN API - نقطة الدخول الرئيسية
 */

// ─── CORS & JSON headers ──────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// دعم _method override — يُستخدم مع sendBeacon (الذي يرسل POST فقط)
// هذا يسمح بحفظ طوارئ عند إغلاق الصفحة
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_GET['_method'])) {
    $_SERVER['REQUEST_METHOD'] = strtoupper($_GET['_method']);
}

$route = $_GET['route'] ?? '';

switch ($route) {
    case 'auth':
        require __DIR__ . '/auth.php';
        break;
    case 'projects':
        require __DIR__ . '/projects.php';
        break;
    case 'settings':
        require __DIR__ . '/settings.php';
        break;
    default:
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'name'    => 'Mediatower PLAN API',
            'version' => '1.0.0',
            'status'  => 'online',
            'routes'  => ['auth', 'projects', 'settings']
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        break;
}
