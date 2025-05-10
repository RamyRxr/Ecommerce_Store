<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('User not logged in');
    }

    $userId = $_SESSION['user']['id'];
    $db = new Database();
    $conn = $db->getConnection();

    $sql = "SELECT s.id as saved_id, s.product_id, p.*, GROUP_CONCAT(pi.image_url) as images
            FROM saved_items s
            JOIN products p ON s.product_id = p.id
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE s.user_id = ?
            GROUP BY s.id, p.id
            ORDER BY s.created_at DESC";

    $stmt = $conn->prepare($sql);
    $stmt->execute([$userId]);
    $savedItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($savedItems as &$item) {
        $item['images'] = $item['images'] ? explode(',', $item['images']) : [];
        $item['id'] = $item['product_id']; 
        $item['saved_id'] = intval($item['saved_id']); 
        $item['price'] = floatval($item['price']);
        $item['rating'] = floatval($item['rating'] ?? 0);
        $item['rating_count'] = intval($item['rating_count'] ?? 0);
        $item['name'] = $item['title']; 
    }

    echo json_encode([
        'success' => true,
        'data' => $savedItems
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}