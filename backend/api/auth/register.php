<?php
set_error_handler(function($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

header('Content-Type: application/json');
session_start();

try {
    require_once '../../config/database.php';

    $data = json_decode(file_get_contents('php://input'), true);

    $requiredFields = ['username', 'email', 'password', 'first_name', 'last_name'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            echo json_encode([
                'success' => false,
                'message' => "Field '$field' is required"
            ]);
            exit;
        }
    }

    $db = new Database();
    $conn = $db->getConnection();

    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$data['username'], $data['email']]);
    if ($stmt->fetch(PDO::FETCH_ASSOC)) {
        echo json_encode([
            'success' => false,
            'message' => 'Username or email already in use'
        ]);
        exit;
    }

    $stmt = $conn->prepare("
        INSERT INTO users (username, email, password, first_name, last_name, is_admin, phone)
        VALUES (?, ?, ?, ?, ?, 0, ?)
    ");
    
    $stmt->execute([
        $data['username'],
        $data['email'],
        $data['password'], 
        $data['first_name'],
        $data['last_name'],
        $data['phone'] ?? null
    ]);

    $userId = $conn->lastInsertId();

    $stmt = $conn->prepare("
        INSERT INTO user_settings (user_id, order_updates, promotions, newsletter, product_updates)
        VALUES (?, 1, 1, 0, 1)
    ");
    $stmt->execute([$userId]);

    echo json_encode([
        'success' => true,
        'message' => 'Registration successful',
        'user_id' => $userId
    ]);

} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>