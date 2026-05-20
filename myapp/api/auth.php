<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// =============================================
// POST /api/auth.php?action=register
// =============================================
if ($method === 'POST' && $action === 'register') {
    $body = getBody();
    $name     = trim($body['name'] ?? '');
    $email    = trim($body['email'] ?? '');
    $password = $body['password'] ?? '';

    if (empty($name) || empty($email) || empty($password)) {
        sendError('جميع الحقول مطلوبة');
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendError('البريد الإلكتروني غير صالح');
    }

    if (strlen($password) < 6) {
        sendError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    }

    $db = getDB();

    // التحقق من عدم تكرار الإيميل
    $check = $db->prepare("SELECT id FROM users WHERE email = ?");
    $check->bind_param("s", $email);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
        $db->close();
        sendError('البريد الإلكتروني مستخدم بالفعل');
    }

    $hashed = password_hash($password, PASSWORD_BCRYPT);
    $token  = bin2hex(random_bytes(32));

    $stmt = $db->prepare("INSERT INTO users (name, email, password, session_token) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $name, $email, $hashed, $token);

    if ($stmt->execute()) {
        $userId = $db->insert_id;
        $db->close();
        sendSuccess([
            'token' => $token,
            'user'  => ['id' => $userId, 'name' => $name, 'email' => $email, 'role' => 'user']
        ], 201);
    } else {
        $db->close();
        sendError('فشل إنشاء الحساب', 500);
    }
}

// =============================================
// POST /api/auth.php?action=login
// =============================================
if ($method === 'POST' && $action === 'login') {
    $body     = getBody();
    $email    = trim($body['email'] ?? '');
    $password = $body['password'] ?? '';

    if (empty($email) || empty($password)) {
        sendError('البريد الإلكتروني وكلمة المرور مطلوبان');
    }

    $db = getDB();
    $stmt = $db->prepare("SELECT id, name, email, password, role FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();

    if (!$user) {
        $db->close();
        sendError('البريد الإلكتروني أو كلمة المرور غير صحيحة', 401);
    }

    // دعم كلمات المرور القديمة MD5 والحديثة bcrypt
    $validPassword = password_verify($password, $user['password'])
        || $user['password'] === md5($password);

    if (!$validPassword) {
        $db->close();
        sendError('البريد الإلكتروني أو كلمة المرور غير صحيحة', 401);
    }

    $token = bin2hex(random_bytes(32));
    $upd = $db->prepare("UPDATE users SET session_token = ? WHERE id = ?");
    $upd->bind_param("si", $token, $user['id']);
    $upd->execute();
    $db->close();

    sendSuccess([
        'token' => $token,
        'user'  => [
            'id'    => $user['id'],
            'name'  => $user['name'],
            'email' => $user['email'],
            'role'  => $user['role']
        ]
    ]);
}

// =============================================
// POST /api/auth.php?action=logout
// =============================================
if ($method === 'POST' && $action === 'logout') {
    $user = requireAuth();
    $db   = getDB();
    $stmt = $db->prepare("UPDATE users SET session_token = NULL WHERE id = ?");
    $stmt->bind_param("i", $user['id']);
    $stmt->execute();
    $db->close();
    sendSuccess(['message' => 'تم تسجيل الخروج بنجاح']);
}

// =============================================
// GET /api/auth.php?action=me
// =============================================
if ($method === 'GET' && $action === 'me') {
    $user = requireAuth();
    sendSuccess($user);
}

sendError('الطلب غير معروف', 404);
