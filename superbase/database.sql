-- Database Schema for Smart Task Management App

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
);

-- Tasks Table
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    due_date DATETIME NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at DATETIME,
    user_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_due_date (user_id, due_date),
    INDEX idx_user_completed (user_id, completed),
    INDEX idx_category (category)
);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    old_values TEXT,
    new_values TEXT,
    user_id INT,
    ip_address VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_action (action),
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_user (user_id)
);

-- Trigger for Task Audit Logging
DELIMITER //
CREATE TRIGGER task_audit_insert
AFTER INSERT ON tasks
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action, table_name, record_id, new_values, user_id)
    VALUES ('INSERT', 'tasks', NEW.id, JSON_OBJECT(
        'title', NEW.title,
        'description', NEW.description,
        'category', NEW.category,
        'due_date', NEW.due_date,
        'completed', NEW.completed,
        'user_id', NEW.user_id
    ), NEW.user_id);
END //

CREATE TRIGGER task_audit_update
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action, table_name, record_id, old_values, new_values, user_id)
    VALUES ('UPDATE', 'tasks', NEW.id, 
    JSON_OBJECT(
        'title', OLD.title,
        'description', OLD.description,
        'category', OLD.category,
        'due_date', OLD.due_date,
        'completed', OLD.completed
    ),
    JSON_OBJECT(
        'title', NEW.title,
        'description', NEW.description,
        'category', NEW.category,
        'due_date', NEW.due_date,
        'completed', NEW.completed
    ), 
    NEW.user_id);
END //

CREATE TRIGGER task_audit_delete
BEFORE DELETE ON tasks
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action, table_name, record_id, old_values, user_id)
    VALUES ('DELETE', 'tasks', OLD.id, JSON_OBJECT(
        'title', OLD.title,
        'description', OLD.description,
        'category', OLD.category,
        'due_date', OLD.due_date,
        'completed', OLD.completed,
        'user_id', OLD.user_id
    ), OLD.user_id);
END //
DELIMITER ;

-- Trigger for User Audit Logging
DELIMITER //
CREATE TRIGGER user_audit_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action, table_name, record_id, new_values)
    VALUES ('INSERT', 'users', NEW.id, JSON_OBJECT(
        'username', NEW.username,
        'email', NEW.email,
        'role', NEW.role,
        'active', NEW.active
    ));
END //

CREATE TRIGGER user_audit_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action, table_name, record_id, old_values, new_values, user_id)
    VALUES ('UPDATE', 'users', NEW.id, 
    JSON_OBJECT(
        'username', OLD.username,
        'email', OLD.email,
        'role', OLD.role,
        'active', OLD.active
    ),
    JSON_OBJECT(
        'username', NEW.username,
        'email', NEW.email,
        'role', NEW.role,
        'active', NEW.active
    ), 
    NULL);
END //
DELIMITER ;

-- Create initial admin user (password: admin123)
INSERT INTO users (username, email, password, role) 
VALUES ('admin', 'admin@example.com', '$2a$10$uR4S.SZYpyTL2N0Ro5VJkuCf4YQ1AzXY17MCvpckK6RwX.YVVXhPS', 'admin');