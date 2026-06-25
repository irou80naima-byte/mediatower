-- ============================================
-- قاعدة بيانات مشروع MyApp
-- ============================================

CREATE DATABASE IF NOT EXISTS myapp_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE myapp_db;

-- -----------------------------------------------
-- جدول المستخدمين
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100)        NOT NULL,
    email         VARCHAR(150)        NOT NULL UNIQUE,
    password      VARCHAR(255)        NOT NULL,
    session_token VARCHAR(255)        DEFAULT NULL,
    role          ENUM('admin','user') NOT NULL DEFAULT 'user',
    created_at    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------
-- جدول المشاريع (Projects)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id       INT UNSIGNED        NOT NULL,
    name          VARCHAR(200)        NOT NULL DEFAULT 'مشروع جديد',
    nodes_data    LONGTEXT            DEFAULT NULL,
    edges_data    LONGTEXT            DEFAULT NULL,
    thumbnail     VARCHAR(255)        DEFAULT NULL,
    last_modified TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------
-- جدول المحادثات (Conversations)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS conversations (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED        NOT NULL,
    title       VARCHAR(200)        NOT NULL DEFAULT 'محادثة جديدة',
    created_at  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------
-- جدول الرسائل (Messages)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT UNSIGNED        NOT NULL,
    role            ENUM('user','assistant') NOT NULL,
    content         TEXT                NOT NULL,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------
-- جدول الإعدادات (Settings)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED        NOT NULL UNIQUE,
    api_key     VARCHAR(255)        DEFAULT NULL,
    theme       ENUM('light','dark') NOT NULL DEFAULT 'dark',
    language    VARCHAR(10)         NOT NULL DEFAULT 'ar',
    updated_at  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------
-- بيانات تجريبية - مستخدم افتراضي
-- -----------------------------------------------
INSERT IGNORE INTO users (name, email, password, role)
VALUES ('Admin', 'admin@myapp.com', MD5('admin123'), 'admin');

SELECT '✅ تم إنشاء قاعدة البيانات بنجاح!' AS status;
