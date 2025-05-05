<?php
header('Content-Type: application/json');
session_start();

// Include database connection
require_once '../../config/database.php';

// Get JSON post data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['username']) || !isset($data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Username and password are required']);
    exit;
}

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Prepare query to check for username or email match
    $stmt = $conn->prepare("SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1");
    $stmt->execute([$data['username'], $data['username']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Verify password (in a real app, use password_verify with hashed passwords)
        if ($data['password'] === $user['password']) {
            // Ensure is_admin is properly cast to boolean for clarity
            $isAdmin = (bool)$user['is_admin'];
            
            // Set session data
            $_SESSION['user'] = [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'first_name' => $user['first_name'],
                'last_name' => $user['last_name'],
                'is_admin' => $isAdmin // Cast to boolean
            ];

            // Return success with user data (excluding password)
            unset($user['password']);
            $user['is_admin'] = $isAdmin; // Ensure boolean type for client
            
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