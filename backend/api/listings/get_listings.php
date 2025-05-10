<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('User not logged in');
    }
    
    if (!isset($_SESSION['user']['is_admin']) || !$_SESSION['user']['is_admin']) {
        throw new Exception('Unauthorized access. Admin privileges required.');
    }
    
    $db = new Database();
    $conn = $db->getConnection();
    
    $userId = $_SESSION['user']['id'];
    
    $stmt = $conn->prepare("SELECT * FROM products WHERE seller_id = ? ORDER BY created_at DESC");
    $stmt->execute([$userId]);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $listings = [];
    
    foreach ($products as $product) {
        $imgStmt = $conn->prepare("SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order ASC");
        $imgStmt->execute([$product['id']]);
        $images = $imgStmt->fetchAll(PDO::FETCH_COLUMN);
        
        $product['images'] = $images;
        $listings[] = $product;
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'listings' => $listings
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