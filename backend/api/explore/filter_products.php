<?php
header('Content-Type: application/json');
require_once '../../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    $data = json_decode(file_get_contents('php://input'), true);
    
    // Basic query to get product IDs that match filters
    $sql = "SELECT p.id, p.title, p.price, p.description, GROUP_CONCAT(pi.image_url) as images 
            FROM products p 
            LEFT JOIN product_images pi ON p.id = pi.product_id 
            WHERE 1=1";
    
    $params = [];

    // Add filter conditions
    if (!empty($data['categories'])) {
        $placeholders = str_repeat('?,', count($data['categories']) - 1) . '?';
        $sql .= " AND category IN ($placeholders)";
        $params = array_merge($params, $data['categories']);
    }

    if (!empty($data['brands'])) {
        $placeholders = str_repeat('?,', count($data['brands']) - 1) . '?';
        $sql .= " AND brand IN ($placeholders)";
        $params = array_merge($params, $data['brands']);
    }

    if (!empty($data['price']['min'])) {
        $sql .= " AND price >= ?";
        $params[] = $data['price']['min'];
    }

    if (!empty($data['price']['max']) && $data['price']['max'] !== 'unlimited') {
        $sql .= " AND price <= ?";
        $params[] = $data['price']['max'];
    }

    $sql .= " GROUP BY p.id";

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format the products
    $filteredProducts = array_map(function($product) {
        return [
            'id' => $product['id'],
            'title' => $product['title'],
            'price' => floatval($product['price']),
            'description' => $product['description'],
            'images' => $product['images'] ? explode(',', $product['images']) : []
        ];
    }, $products);

    echo json_encode([
        'success' => true,
        'data' => [
            'listings' => $filteredProducts
        ]
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false, 
        'message' => $e->getMessage()
    ]);
}