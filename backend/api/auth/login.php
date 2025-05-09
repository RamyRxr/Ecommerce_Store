<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['username']) || !isset($data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Username and password are required']);
    exit;
}

try {
    $db = new Database();
    $conn = $db->getConnection();

    $stmt = $conn->prepare("SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1");
    $stmt->execute([$data['username'], $data['username']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        if ($data['password'] === $user['password']) {
            $isAdmin = (bool)$user['is_admin'];
            
            $_SESSION['user'] = [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'first_name' => $user['first_name'],
                'last_name' => $user['last_name'],
                'is_admin' => $isAdmin 
            ];

            unset($user['password']);
            $user['is_admin'] = $isAdmin; 
            
            echo json_encode([
                'success' => true, 
                'user' => $user,
                'message' => 'Login successful'
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>