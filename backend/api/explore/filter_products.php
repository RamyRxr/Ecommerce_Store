<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();

require_once '../../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Get filter parameters from POST request
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        throw new Exception('Invalid JSON data received');
    }
    
    // Extract filter parameters
    $categories = array_map('strtolower', $data['categories'] ?? []);
    $brands = array_map('strtolower', $data['brands'] ?? []);
    $rating = floatval($data['rating'] ?? 0);
    $minPrice = floatval($data['price']['min'] ?? 0);
    $maxPrice = $data['price']['max'] !== 'unlimited' ? floatval($data['price']['max']) : null;

    // Build base query
    $sql = "SELECT p.*, 
            GROUP_CONCAT(DISTINCT pi.image_url) as image_urls,
            u.username as seller_name
            FROM products p 
            LEFT JOIN product_images pi ON p.id = pi.product_id 
            LEFT JOIN users u ON p.seller_id = u.id
            WHERE p.status = 'active'";
    
    $params = [];

    // Add category filter
    if (!empty($categories)) {
        $placeholders = str_repeat('?,', count($categories) - 1) . '?';
        $sql .= " AND LOWER(p.category) IN ($placeholders)";
        $params = array_merge($params, $categories);
    }

    // Add brand filter
    if (!empty($brands)) {
        $placeholders = str_repeat('?,', count($brands) - 1) . '?';
        $sql .= " AND LOWER(p.brand) IN ($placeholders)";
        $params = array_merge($params, $brands);
    }

    // Add price filter
    if ($minPrice > 0) {
        $sql .= " AND p.price >= ?";
        $params[] = $minPrice;
    }

    if ($maxPrice !== null) {
        $sql .= " AND p.price <= ?";
        $params[] = $maxPrice;
    }

    // Add rating filter
    if ($rating > 0) {
        $sql .= " AND p.rating >= ?";
        $params[] = $rating;
    }

    // Group by and order
    $sql .= " GROUP BY p.id ORDER BY p.created_at DESC";

    // Execute query
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format products
    foreach ($products as &$product) {
        $product['images'] = $product['image_urls'] ? explode(',', $product['image_urls']) : [];
        unset($product['image_urls']);
        $product['price'] = floatval($product['price']);
        $product['rating'] = floatval($product['rating']);
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'listings' => $products,
            'total' => count($products)
        ]
    ]);

} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}