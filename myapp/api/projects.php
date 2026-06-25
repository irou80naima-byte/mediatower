<?php
require_once __DIR__ . '/config.php';

$user   = requireAuth();
$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

// =============================================
// حد أقصى لحجم البيانات (10 ميغابايت)
// =============================================
define('MAX_DATA_SIZE', 10 * 1024 * 1024);

// =============================================
// GET /api/projects.php  → جلب كل المشاريع
// =============================================
if ($method === 'GET' && !$id) {
    $db   = getDB();
    $stmt = $db->prepare("SELECT id, name, last_modified, thumbnail FROM projects WHERE user_id = ? ORDER BY last_modified DESC");
    $stmt->bind_param("i", $user['id']);
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $db->close();

    // تحويل التواريخ إلى timestamps
    $rows = array_map(function($row) {
        $row['lastModified'] = strtotime($row['last_modified']) * 1000;
        unset($row['last_modified']);
        return $row;
    }, $rows);

    sendSuccess($rows);
}

// =============================================
// GET /api/projects.php?id=X  → جلب مشروع واحد
// =============================================
if ($method === 'GET' && $id) {
    $db   = getDB();
    $stmt = $db->prepare("SELECT id, name, last_modified, nodes_data, edges_data FROM projects WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $id, $user['id']);
    $stmt->execute();
    $row  = $stmt->get_result()->fetch_assoc();
    $db->close();

    if (!$row) sendError('المشروع غير موجود', 404);

    // فك الترميز مع التحقق من صحة JSON
    $nodes = json_decode($row['nodes_data'] ?? '[]', true);
    $edges = json_decode($row['edges_data'] ?? '[]', true);
    
    // في حالة فشل json_decode
    if ($nodes === null) $nodes = [];
    if ($edges === null) $edges = [];

    $row['data'] = [
        'nodes' => $nodes,
        'edges' => $edges,
    ];
    $row['lastModified'] = strtotime($row['last_modified']) * 1000;
    unset($row['nodes_data'], $row['edges_data'], $row['last_modified']);

    sendSuccess($row);
}

// =============================================
// POST /api/projects.php  → إنشاء مشروع جديد
// =============================================
if ($method === 'POST' && !$id) {
    $body  = getBody();
    $name  = trim($body['name'] ?? 'مشروع جديد');
    $nodes = json_encode($body['nodes'] ?? [], JSON_UNESCAPED_UNICODE);
    $edges = json_encode($body['edges'] ?? [], JSON_UNESCAPED_UNICODE);

    // التحقق من حجم البيانات
    $totalSize = strlen($nodes) + strlen($edges);
    if ($totalSize > MAX_DATA_SIZE) {
        sendError('حجم البيانات كبير جداً (' . round($totalSize / 1024 / 1024, 1) . ' MB). الحد الأقصى هو ' . (MAX_DATA_SIZE / 1024 / 1024) . ' MB.', 413);
    }

    $db   = getDB();
    $stmt = $db->prepare("INSERT INTO projects (user_id, name, nodes_data, edges_data) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("isss", $user['id'], $name, $nodes, $edges);

    if ($stmt->execute()) {
        $newId = $db->insert_id;
        $db->close();
        sendSuccess(['id' => $newId, 'name' => $name], 201);
    } else {
        $db->close();
        sendError('فشل إنشاء المشروع', 500);
    }
}

// =============================================
// PUT /api/projects.php?id=X  → تحديث مشروع
// =============================================
if ($method === 'PUT' && $id) {
    $body  = getBody();
    $name  = trim($body['name'] ?? '');
    
    // التحقق من صحة بيانات nodes و edges
    $nodesRaw = $body['nodes'] ?? [];
    $edgesRaw = $body['edges'] ?? [];
    
    if (!is_array($nodesRaw)) $nodesRaw = [];
    if (!is_array($edgesRaw)) $edgesRaw = [];
    
    $nodes = json_encode($nodesRaw, JSON_UNESCAPED_UNICODE);
    $edges = json_encode($edgesRaw, JSON_UNESCAPED_UNICODE);

    // التحقق من نجاح json_encode
    if ($nodes === false || $edges === false) {
        sendError('البيانات تحتوي على قيم غير صالحة لا يمكن تحويلها إلى JSON.', 400);
    }

    // التحقق من حجم البيانات
    $totalSize = strlen($nodes) + strlen($edges);
    if ($totalSize > MAX_DATA_SIZE) {
        sendError('حجم البيانات كبير جداً (' . round($totalSize / 1024 / 1024, 1) . ' MB). الحد الأقصى هو ' . (MAX_DATA_SIZE / 1024 / 1024) . ' MB. جرّب تقليل حجم الصور المرفوعة.', 413);
    }

    $db   = getDB();

    // التحقق من ملكية المشروع
    $check = $db->prepare("SELECT id FROM projects WHERE id = ? AND user_id = ?");
    $check->bind_param("ii", $id, $user['id']);
    $check->execute();
    if ($check->get_result()->num_rows === 0) {
        $db->close();
        sendError('المشروع غير موجود', 404);
    }

    $fields = "nodes_data = ?, edges_data = ?, last_modified = NOW()";
    $params = [$nodes, $edges];
    $types  = "ss";

    if (!empty($name)) {
        $fields .= ", name = ?";
        $params[] = $name;
        $types   .= "s";
    }

    $params[] = $id;
    $params[] = $user['id'];
    $types   .= "ii";

    $stmt = $db->prepare("UPDATE projects SET $fields WHERE id = ? AND user_id = ?");
    $stmt->bind_param($types, ...$params);
    
    if ($stmt->execute()) {
        $db->close();
        // إرجاع timestamp التحديث للتأكيد
        sendSuccess([
            'message' => 'تم الحفظ بنجاح',
            'savedAt' => round(microtime(true) * 1000),
            'nodesCount' => count($nodesRaw),
            'edgesCount' => count($edgesRaw),
        ]);
    } else {
        $db->close();
        sendError('فشل تحديث المشروع', 500);
    }
}

// =============================================
// DELETE /api/projects.php?id=X  → حذف مشروع
// =============================================
if ($method === 'DELETE' && $id) {
    $db   = getDB();
    $stmt = $db->prepare("DELETE FROM projects WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $id, $user['id']);
    $stmt->execute();

    if ($stmt->affected_rows === 0) {
        $db->close();
        sendError('المشروع غير موجود', 404);
    }

    $db->close();
    sendSuccess(['message' => 'تم الحذف بنجاح']);
}

sendError('الطلب غير معروف', 404);
