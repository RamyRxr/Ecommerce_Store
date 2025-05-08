<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('User not logged in');
    }

    $userId = $_SESSION['user']['id'];
    $db = new Database();
    $conn = $db->getConnection();

    $stmt = $conn->prepare("
        SELECT 
            id,
            username,
            email,
            first_name,
            last_name,
            profile_image, 
            phone,
            address,
            city,
            state,
            zip_code,
            country,
            created_at
        FROM users 
        WHERE id = ?
    ");
    
    $stmt->execute([$userId]);
    $userData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$userData) {
        throw new Exception('User not found');
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'user' => $userData  
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500); 
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>