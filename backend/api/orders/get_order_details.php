<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    // Check if user is logged in
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('User not logged in');
    }

    $userId = $_SESSION['user']['id'];
    
    // Get order ID from query parameter
    $orderId = isset($_GET['id']) ? $_GET['id'] : null;
    if (!$orderId) {
        throw new Exception('Order ID is required');
    }
    
    $db = new Database();
    $conn = $db->getConnection();

    // Get the order details
    $sql = "SELECT o.id, o.shipping_method, o.total_price as totalAmount, 
            o.created_at as date, o.status,
            o.shipping_address, o.shipping_city, o.shipping_zip as shipping_postal_code, 
            o.shipping_country, o.payment_method
            FROM orders o
            WHERE o.id = :order_id AND o.user_id = :user_id";
    
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':order_id', $orderId);
    $stmt->bindParam(':user_id', $userId);
    $stmt->execute();
    
    $order = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$order) {
        throw new Exception('Order not found or not authorized to view');
    }
    
    // Get items for this order with images (EXACTLY like get_cart.php)
    $itemsSql = "SELECT oi.id, oi.product_id, oi.price, oi.quantity, 
                 p.title as product_name, 
                 (oi.price * oi.quantity) as total,
                 GROUP_CONCAT(pi.image_url) as images
                 FROM order_items oi
                 LEFT JOIN products p ON oi.product_id = p.id
                 LEFT JOIN product_images pi ON oi.product_id = pi.product_id
                 WHERE oi.order_id = :order_id
                 GROUP BY oi.id";
    
    $itemsStmt = $conn->prepare($itemsSql);
    $itemsStmt->bindParam(':order_id', $orderId);
    $itemsStmt->execute();
    
    $items = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Format images (EXACTLY like get_cart.php)
    foreach ($items as &$item) {
        $item['images'] = $item['images'] ? explode(',', $item['images']) : [];
    }
    
    // Format shipping address for display
    $order['shippingAddress'] = [
        'street' => $order['shipping_address'],
        'city' => $order['shipping_city'],
        'state' => '',
        'zip' => $order['shipping_postal_code'],
        'country' => $order['shipping_country']
    ];
    
    // Add payment method
    $order['paymentMethod'] = $order['payment_method'];
    
    // Add estimated or actual delivery date
    if ($order['status'] === 'shipped') {
        $orderDate = new DateTime($order['date']);
        $estimatedDelivery = clone $orderDate;
        $estimatedDelivery->modify('+7 days');
        $order['estimatedDelivery'] = $estimatedDelivery->format('Y-m-d H:i:s');
    } elseif ($order['status'] === 'delivered') {
        $orderDate = new DateTime($order['date']);
        $actualDelivery = clone $orderDate;
        $actualDelivery->modify('+' . rand(3, 6) . ' days');
        $order['actualDelivery'] = $actualDelivery->format('Y-m-d H:i:s');
        
        // Check if order has been rated
        $ratingQuery = "SELECT id FROM order_ratings WHERE order_id = :order_id LIMIT 1";
        $ratingStmt = $conn->prepare($ratingQuery);
        $ratingStmt->bindParam(':order_id', $orderId);
        $ratingStmt->execute();
        $order['rated'] = ($ratingStmt->rowCount() > 0);
    }
    
    // Clean up response
    unset($order['shipping_address']);
    unset($order['shipping_city']);
    unset($order['shipping_postal_code']);
    unset($order['shipping_country']);
    unset($order['payment_method']);
    
    // Add items to order
    $order['items'] = $items;
    
    echo json_encode([
        'success' => true,
        'order' => $order
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>