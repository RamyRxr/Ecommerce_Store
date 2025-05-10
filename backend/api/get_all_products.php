<?php
header('Content-Type: application/json');
session_start();

require_once '../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    $currentUserId = $_SESSION['user']['id'] ?? null;

    $sql = "SELECT p.*, 
            GROUP_CONCAT(pi.image_url) as images,
            u.username as seller_name,
            u.id as seller_id
            FROM products p 
            LEFT JOIN product_images pi ON p.id = pi.product_id 
            LEFT JOIN users u ON p.seller_id = u.id
            WHERE p.status = 'active'
            GROUP BY p.id
            ORDER BY p.created_at DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($products as &$product) {
        $product['images'] = $product['images'] ? explode(',', $product['images']) : [];
        
        if (!isset($product['rating'])) {
            $product['rating'] = 0;
        }
        if (!isset($product['rating_count'])) {
            $product['rating_count'] = 0;
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'listings' => $products,
            'currentUserId' => $currentUserId
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>