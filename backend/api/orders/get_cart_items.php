<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    if (!isset($_SESSION['user'])) {
        throw new Exception('User not logged in');
    }

    $user_id = $_SESSION['user']['id'];
    $db = new Database();
    $conn = $db->getConnection();

    // Simple query to get cart items
    $stmt = $conn->prepare("
        SELECT c.id, c.quantity, p.title, p.price, p.id as product_id
        FROM cart_items c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = :user_id
    ");

    $stmt->execute([':user_id' => $user_id]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'items' => $items
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>