<?php
header('Content-Type: application/json');
session_start();

require_once '../config/database.php';

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
            card_type as type,
            last_four as last4,
            expiry_month,
            expiry_year,
            card_holder
        FROM payment_methods 
        WHERE user_id = ?
        ORDER BY created_at DESC
    ");
    
    $stmt->execute([$userId]);
    $paymentMethods = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $paymentMethods
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}