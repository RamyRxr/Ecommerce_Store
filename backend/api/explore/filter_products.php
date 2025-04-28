<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Get current user ID from session
    $currentUserId = $_SESSION['user']['id'] ?? null;

    $data = json_decode(file_get_contents('php://input'), true);
    
    // Basic query to get products
    $sql = "SELECT p.*, 
            GROUP_CONCAT(pi.image_url) as image_urls,
            u.username as seller_name,
            u.id as seller_id
            FROM products p 
            LEFT JOIN product_images pi ON p.id = pi.product_id 
            LEFT JOIN users u ON p.seller_id = u.id
            WHERE p.status = 'active'";
    
    $params = [];

    // Add filter conditions
    if (!empty($data['categories'])) {
        $placeholders = str_repeat('?,', count($data['categories']) - 1) . '?';
        $sql .= " AND p.category IN ($placeholders)";
        $params = array_merge($params, $data['categories']);
    }

    if (!empty($data['brands'])) {
        $placeholders = str_repeat('?,', count($data['brands']) - 1) . '?';
        $sql .= " AND p.brand IN ($placeholders)";
        $params = array_merge($params, $data['brands']);
    }

    if (!empty($data['price']['min'])) {
        $sql .= " AND p.price >= ?";
        $params[] = $data['price']['min'];
    }

    if (!empty($data['price']['max']) && $data['price']['max'] !== 'unlimited') {
        $sql .= " AND p.price <= ?";
        $params[] = $data['price']['max'];
    }

    if (!empty($data['rating'])) {
        $sql .= " AND p.rating >= ?";
        $params[] = $data['rating'];
    }

    $sql .= " GROUP BY p.id ORDER BY p.created_at DESC";

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format the products
    $filteredProducts = [];
    foreach ($products as $product) {
        $filteredProducts[] = [
            'id' => $product['id'],
            'title' => $product['title'],
            'price' => floatval($product['price']),
            'original_price' => $product['original_price'],
            'description' => $product['description'],
            'category' => $product['category'],
            'brand' => $product['brand'],
            'condition' => $product['condition'],
            'rating' => $product['rating'],
            'rating_count' => $product['rating_count'],
            'seller_id' => $product['seller_id'],
            'seller_name' => $product['seller_name'],
            'created_at' => $product['created_at'],
            'images' => $product['image_urls'] ? explode(',', $product['image_urls']) : []
        ];
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'listings' => $filteredProducts,
            'currentUserId' => $currentUserId
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => $e->getMessage()
    ]);
}