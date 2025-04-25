<?php
header('Content-Type: application/json');
session_start();

require_once '../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Get current user ID from session
    $currentUserId = $_SESSION['user']['id'] ?? null;

    // Fetch all products except current user's listings
    $sql = "SELECT p.*, 
            GROUP_CONCAT(pi.image_url) as image_urls,
            u.username as seller_name
            FROM products p 
            LEFT JOIN product_images pi ON p.id = pi.product_id 
            LEFT JOIN users u ON p.seller_id = u.id
            WHERE p.seller_id != :current_user_id 
            AND p.status = 'active'
            GROUP BY p.id 
            ORDER BY p.created_at DESC";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':current_user_id', $currentUserId);
    $stmt->execute();

    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format the data
    foreach ($products as &$product) {
        $product['images'] = $product['image_urls'] ? explode(',', $product['image_urls']) : [];
        unset($product['image_urls']);
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'listings' => $products
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}