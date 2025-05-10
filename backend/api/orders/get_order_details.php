<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('User not logged in');
    }
    $requesting_user_id = $_SESSION['user']['id'];
    $is_admin = isset($_SESSION['user']['is_admin']) && $_SESSION['user']['is_admin'];

    if (!isset($_GET['id'])) {
        throw new Exception('Order ID is required');
    }
    $order_id = $_GET['id'];

    $db = new Database();
    $conn = $db->getConnection();

    $sql = "SELECT o.*, u.username 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            WHERE o.id = :order_id";

    if (!$is_admin) {
        $sql .= " AND o.user_id = :user_id";
    }

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':order_id', $order_id);
    if (!$is_admin) {
        $stmt->bindParam(':user_id', $requesting_user_id);
    }
    
    $stmt->execute();
    $order = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        throw new Exception('Order not found or you are not authorized to view it.');
    }

    $items_sql = "SELECT oi.id as order_item_id, oi.product_id, oi.quantity, oi.price, 
                            p.title as product_title, 
                            GROUP_CONCAT(pi.image_url) as images
                    FROM order_items oi
                    JOIN products p ON oi.product_id = p.id
                    LEFT JOIN product_images pi ON p.id = pi.product_id
                    WHERE oi.order_id = :order_id
                    GROUP BY oi.id, p.id"; 
    
    $items_stmt = $conn->prepare($items_sql);
    $items_stmt->bindParam(':order_id', $order_id);
    $items_stmt->execute();
    $items = $items_stmt->fetchAll(PDO::FETCH_ASSOC);

    $order['items'] = array_map(function($item) {
        $item_images = $item['images'] ? explode(',', $item['images']) : [];
        return [
            'id' => $item['order_item_id'], 
            'product_id' => $item['product_id'],
            'product_title' => $item['product_title'] ?? 'Product Name Unavailable',
            'price' => (float)$item['price'],
            'quantity' => (int)$item['quantity'],
            'total' => (float)$item['price'] * (int)$item['quantity'],
            'images' => $item_images,
        ];
    }, $items);
    echo json_encode(['success' => true, 'order' => $order]);

} catch (Exception $e) {
    http_response_code(400); // Or 404 for "not found", 403 for "forbidden"
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>