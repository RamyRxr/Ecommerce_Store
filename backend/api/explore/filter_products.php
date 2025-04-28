
<?php
header('Content-Type: application/json');
require_once '../../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Get filter parameters
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Start building the query
    $sql = "SELECT p.*, GROUP_CONCAT(pi.image_url) as images, u.username as seller_name
            FROM products p 
            LEFT JOIN product_images pi ON p.id = pi.product_id 
            LEFT JOIN users u ON p.seller_id = u.id
            WHERE 1=1";
    
    $params = array();

    // Add filters
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

    if (isset($data['price']['min'])) {
        $sql .= " AND price >= ?";
        $params[] = $data['price']['min'];
    }

    if (isset($data['price']['max']) && $data['price']['max'] !== 'unlimited') {
        $sql .= " AND price <= ?";
        $params[] = $data['price']['max'];
    }

    if (!empty($data['rating'])) {
        $sql .= " AND rating >= ?";
        $params[] = $data['rating'];
    }

    $sql .= " GROUP BY p.id";

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format the response
    $formattedProducts = array_map(function($product) {
        return [
            'id' => $product['id'],
            'title' => $product['title'],
            'price' => floatval($product['price']),
            'description' => $product['description'],
            'images' => $product['images'] ? explode(',', $product['images']) : [],
            'rating' => floatval($product['rating']),
            'category' => $product['category'],
            'brand' => $product['brand'],
            'seller_name' => $product['seller_name']
        ];
    }, $products);

    echo json_encode([
        'success' => true,
        'data' => [
            'listings' => $formattedProducts
        ]
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Error: ' . $e->getMessage()
    ]);
}