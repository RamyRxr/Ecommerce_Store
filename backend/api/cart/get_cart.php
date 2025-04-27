<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    // Check if user is logged in
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('Please login to view your cart');
    }

    $userId = $_SESSION['user']['id'];
    $db = new Database();
    $conn = $db->getConnection();

    // Get cart items with product details
    $sql = "SELECT ci.*, p.title as name, p.price, p.description, 
            GROUP_CONCAT(pi.image_url) as images
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE ci.user_id = ?
            GROUP BY ci.id";

    $stmt = $conn->prepare($sql);
    $stmt->execute([$userId]);
    $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format the response data
    foreach ($cartItems as &$item) {
        $item['images'] = $item['images'] ? explode(',', $item['images']) : [];
        $item['price'] = floatval($item['price']);
        $item['quantity'] = intval($item['quantity']);
        $item['image'] = !empty($item['images']) 
            ? "/Project-Web/backend/uploads/products/{$item['images'][0]}" 
            : "/Project-Web/assets/images/products-images/placeholder.svg";
    }

    echo json_encode([
        'success' => true,
        'data' => $cartItems
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}