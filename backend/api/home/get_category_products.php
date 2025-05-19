<?php
require_once '../../config/database.php';
header('Content-Type: application/json');
$category = $_GET['category'] ?? '';
try {
    $db = new Database();
    $conn = $db->getConnection();
    $stmt = $conn->prepare("SELECT p.*, 
        (SELECT GROUP_CONCAT(image_url) FROM product_images WHERE product_id = p.id) as images 
        FROM products p 
        WHERE p.category = ? AND p.status = 'active'
        ORDER BY p.created_at DESC");
    $stmt->execute([$category]);
    $products = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $row['images'] = $row['images'] ? explode(',', $row['images']) : [];
        $products[] = $row;
    }
    echo json_encode(['success' => true, 'products' => $products]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'products' => [], 'message' => $e->getMessage()]);
}