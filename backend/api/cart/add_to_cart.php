<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('Please login to add items to cart');
    }

    $userId = $_SESSION['user']['id'];
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['product_id'])) {
        throw new Exception('Product ID is required');
    }

    $productId = $data['product_id'];
    $quantity = $data['quantity'] ?? 1;

    $db = new Database();
    $conn = $db->getConnection();

    // Check if product already exists in cart
    $stmt = $conn->prepare("SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?");
    $stmt->execute([$userId, $productId]);
    $existingItem = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existingItem) {
        // Update quantity if item exists
        $stmt = $conn->prepare("UPDATE cart_items SET quantity = quantity + ? WHERE id = ?");
        $stmt->execute([$quantity, $existingItem['id']]);
    } else {
        // Insert new item
        $stmt = $conn->prepare("INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)");
        $stmt->execute([$userId, $productId, $quantity]);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Item added to cart successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}