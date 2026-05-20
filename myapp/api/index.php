<?php
/**
 * Mediatower PLAN API - نقطة الدخول الرئيسية
 * 
 * المسارات المتاحة:
 *   POST   /api/?route=auth&action=register   → تسجيل حساب جديد
 *   POST   /api/?route=auth&action=login      → تسجيل الدخول
 *   POST   /api/?route=auth&action=logout     → تسجيل الخروج
 *   GET    /api/?route=auth&action=me         → بيانات المستخدم الحالي
 *   
 *   GET    /api/?route=projects               → قائمة المشاريع
 *   GET    /api/?route=projects&id=X          → مشروع واحد
 *   POST   /api/?route=projects               → إنشاء مشروع
 *   PUT    /api/?route=projects&id=X          → تحديث مشروع
 *   DELETE /api/?route=projects&id=X          → حذف مشروع
 *   
 *   GET    /api/?route=settings               → جلب الإعدادات
 *   PUT    /api/?route=settings               → حفظ الإعدادات
 */

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
