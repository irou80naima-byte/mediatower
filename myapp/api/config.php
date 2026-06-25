<?php
// Suppress HTML error output — always return JSON
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
error_reporting(0);

// =============================================
// إعدادات قاعدة البيانات
// =============================================

$rawHost = getenv('DB_HOST') ?: 'localhost';
$rawPort = getenv('DB_PORT') ?: 3306;
$rawUser = getenv('DB_USER') ?: 'root';
$rawPass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
$rawName = getenv('DB_NAME') ?: 'myapp_db';

// الذكاء الاصطناعي: لو قام المستخدم بلصق رابط الاتصال الكامل (Service URI) بالخطأ في DB_HOST
if (strpos(trim($rawHost), 'mysql://') === 0) {
    $parsed = parse_url(trim($rawHost));
    if ($parsed) {
        $rawHost = $parsed['host'] ?? $rawHost;
        $rawPort = $parsed['port'] ?? $rawPort;
        $rawUser = $parsed['user'] ?? $rawUser;
        $rawPass = $parsed['pass'] ?? $rawPass;
        if (isset($parsed['path']) && trim($parsed['path'], '/') !== '') {
            $rawName = trim($parsed['path'], '/');
        }
    }
}

define('DB_HOST', trim($rawHost));
define('DB_PORT', (int)trim($rawPort));
define('DB_USER', trim($rawUser));
define('DB_PASS', trim($rawPass));
define('DB_NAME', trim($rawName));

// CORS Headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// =============================================
// الاتصال بقاعدة البيانات مع SSL (مطلوب لـ Aiven.io)
// =============================================
function getDB(): mysqli
{
    $conn = mysqli_init();

    if (!$conn) {
        http_response_code(500);
        die(json_encode(['error' => 'فشل تهيئة mysqli']));
    }

    // Aiven يشترط SSL — نُفعّله بدون التحقق من شهادة CA
    @mysqli_ssl_set($conn, null, null, null, null, null);

    $connected = @mysqli_real_connect(
        $conn,
        DB_HOST,
        DB_USER,
        DB_PASS,
        DB_NAME,
        DB_PORT,
        null,
        MYSQLI_CLIENT_SSL
    );

    if (!$connected) {
        http_response_code(500);
        die(json_encode(['error' => 'فشل الاتصال بقاعدة البيانات: ' . mysqli_connect_error()]));
    }

    $conn->set_charset('utf8mb4');
    return $conn;
}

// =============================================
// دوال مساعدة
// =============================================
function sendSuccess($data = [], int $code = 200): void
{
    http_response_code($code);
    echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
    exit();
}

function sendError(string $message, int $code = 400): void
{
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
    exit();
}

function getBody(): array
{
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

function requireAuth(): array
{
    // Apache على Render قد يُجرّد ترويسة Authorization أو يعيد تسميتها
    // نقرأ التوكن من أكثر من مكان لضمان التوافق
    $token = '';

    // 1. getallheaders() — الطريقة القياسية
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    foreach ($headers as $key => $val) {
        if (strtolower($key) === 'authorization') {
            $token = $val;
            break;
        }
    }

    // 2. بديل عبر $_SERVER — مفيد عند استخدام FastCGI أو mod_rewrite
    if (empty($token)) {
        $token = $_SERVER['HTTP_AUTHORIZATION']
              ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
              ?? '';
    }

    $token = str_replace('Bearer ', '', trim($token));

    // 3. بديل طوارئ عبر _token في URL — يُستخدم فقط مع sendBeacon عند إغلاق الصفحة
    if (empty($token) && !empty($_GET['_token'])) {
        $token = trim($_GET['_token']);
    }

    if (empty($token)) {
        sendError('مطلوب تسجيل الدخول', 401);
    }

    $db = getDB();
    $stmt = $db->prepare("SELECT id, name, email, role FROM users WHERE session_token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $db->close();

    if (!$user) {
        sendError('جلسة غير صالحة', 401);
    }

    return $user;
}
