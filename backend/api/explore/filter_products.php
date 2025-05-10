<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    $currentUserId = $_SESSION['user']['id'] ?? null;

    $data = json_decode(file_get_contents('php://input'), true);
    
    $sql = "SELECT p.*, 
            GROUP_CONCAT(pi.image_url) as images,
            u.username as seller_name,
            u.id as seller_id
            FROM products p 
            LEFT JOIN product_images pi ON p.id = pi.product_id 
            LEFT JOIN users u ON p.seller_id = u.id
            WHERE p.status = 'active'";
    
    $params = [];

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

    if (!empty($data['price'])) {
        if (isset($data['price']['min']) && is_numeric($data['price']['min'])) {
            $sql .= " AND p.price >= ?";
            $params[] = $data['price']['min'];
        }
        
        if (isset($data['price']['max']) && $data['price']['max'] !== 'unlimited' && is_numeric($data['price']['max'])) {
            $sql .= " AND p.price <= ?";
            $params[] = $data['price']['max'];
        }
    }

    if (!empty($data['rating']) && is_numeric($data['rating']) && $data['rating'] > 0) {
        $sql .= " AND p.rating >= ?";
        $params[] = $data['rating'];
    }

    $sql .= " GROUP BY p.id ORDER BY p.created_at DESC";

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $savedItems = [];
    if ($currentUserId) {
        $savedStmt = $conn->prepare("SELECT product_id FROM saved_items WHERE user_id = ?");
        $savedStmt->execute([$currentUserId]);
        $savedItems = $savedStmt->fetchAll(PDO::FETCH_COLUMN);
    }

    $filteredProducts = [];
    foreach ($products as $product) {
        $product['images'] = $product['images'] ? explode(',', $product['images']) : [];
        
        if (!isset($product['rating'])) {
            $product['rating'] = 0;
        }
        if (!isset($product['rating_count'])) {
            $product['rating_count'] = 0;
        }
        
        $product['isSaved'] = in_array($product['id'], $savedItems);
        
        $filteredProducts[] = $product;
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'products' => $filteredProducts
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => $e->getMessage()
    ]);
}
?>