<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('User not logged in');
    }

    $userId = $_SESSION['user']['id'];
    $isAdmin = isset($_SESSION['user']['is_admin']) && $_SESSION['user']['is_admin'];

    $db = new Database();
    $conn = $db->getConnection();

    if ($isAdmin) {
        $sql = "SELECT o.id, o.user_id, u.username, o.shipping_method, o.total_price as totalAmount, 
                o.created_at as date, o.status,
                o.shipping_address, o.shipping_city, o.shipping_state, o.shipping_zip as shipping_postal_code, 
                o.shipping_country, o.payment_method,
                o.updated_at as cancellationDate, o.status as cancellationReason
                FROM orders o
                JOIN users u ON o.user_id = u.id
                ORDER BY o.created_at DESC";
        $stmt = $conn->prepare($sql);
    } else {
        $sql = "SELECT o.id, o.user_id, o.shipping_method, o.total_price as totalAmount, 
                o.created_at as date, o.status,
                o.shipping_address, o.shipping_city, o.shipping_state, o.shipping_zip as shipping_postal_code, 
                o.shipping_country, o.payment_method,
                o.updated_at as cancellationDate, o.status as cancellationReason
                FROM orders o
                WHERE o.user_id = :user_id
                ORDER BY o.created_at DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':user_id', $userId);
    }
    
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . implode(" ", $conn->errorInfo()));
    }
    
    $stmt->execute();
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($orders as &$order) {
        $order['shippingAddress'] = [
            'street' => $order['shipping_address'] ?? 'N/A',
            'city' => $order['shipping_city'] ?? 'N/A',
            'state' => $order['shipping_state'] ?? '',
            'zip' => $order['shipping_postal_code'] ?? 'N/A',
            'country' => $order['shipping_country'] ?? 'N/A'
        ];
        
        $order['paymentMethod'] = $order['payment_method'] ?? 'N/A';
        
        if ($order['status'] === 'shipped') {
            $orderDate = new DateTime($order['date']);
            $estimatedDelivery = clone $orderDate;
            $estimatedDelivery->modify('+' . rand(3, 7) . ' days');
            $order['estimatedDelivery'] = $estimatedDelivery->format('Y-m-d H:i:s');
        } elseif ($order['status'] === 'delivered') {
            $orderDate = new DateTime($order['date']);
            $actualDelivery = clone $orderDate;
            $actualDelivery->modify('+' . rand(5, 10) . ' days'); 
            $order['actualDelivery'] = $actualDelivery->format('Y-m-d H:i:s');
        }

        if ($order['status'] === 'cancelled') {
             $order['cancellationDate'] = $order['cancellationDate'] ?? $order['updated_at']; 
             $order['cancellationReason'] = $order['cancellationReason'] ?? "Order Cancelled"; 
        }
        
        $itemsSql = "SELECT oi.id, oi.product_id, oi.price, oi.quantity, oi.product_title,
                        (oi.price * oi.quantity) as total,
                        GROUP_CONCAT(pi.image_url) as images
                        FROM order_items oi
                        LEFT JOIN products p ON oi.product_id = p.id
                        LEFT JOIN product_images pi ON oi.product_id = pi.product_id
                        WHERE oi.order_id = :order_id
                        GROUP BY oi.id";
        
        $itemsStmt = $conn->prepare($itemsSql);
        if (!$itemsStmt) {
                throw new Exception("Failed to prepare items statement: " . implode(" ", $conn->errorInfo()));
        }
        $itemsStmt->bindParam(':order_id', $order['id']);
        $itemsStmt->execute();
        $items = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($items as &$item) {
            $item['images'] = $item['images'] ? explode(',', $item['images']) : [];
            $item['product_name'] = $item['product_title'] ?? 'Product Name Unavailable';
        }
        $order['items'] = $items;
        
        unset($order['shipping_address'], $order['shipping_city'], $order['shipping_state'], $order['shipping_postal_code'], $order['shipping_country']);
    }
    
    echo json_encode([
        'success' => true,
        'orders' => $orders,
        'is_admin' => $isAdmin
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error in get_user_orders.php: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString() 
    ]);
}
?>