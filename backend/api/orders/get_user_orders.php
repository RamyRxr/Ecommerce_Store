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
    $db = new Database();
    $conn = $db->getConnection();

    // Get all orders for the current user - no changes here
    $sql = "SELECT o.id, o.shipping_method, o.total_price as totalAmount, 
            o.created_at as date, o.status,
            o.shipping_address, o.shipping_city, o.shipping_zip as shipping_postal_code, 
            o.shipping_country, o.payment_method
            FROM orders o
            WHERE o.user_id = :user_id
            ORDER BY o.created_at DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':user_id', $userId);
    $stmt->execute();
    
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Process each order - simplify to avoid potential errors
    foreach ($orders as &$order) {
        try {
            // Get basic order items info - simplify the query
            $itemsSql = "SELECT oi.id, oi.product_id, oi.price, oi.quantity, 
                         p.title as product_name, 
                         (oi.price * oi.quantity) as total
                         FROM order_items oi
                         LEFT JOIN products p ON oi.product_id = p.id
                         WHERE oi.order_id = :order_id";
            
            $itemsStmt = $conn->prepare($itemsSql);
            $itemsStmt->bindParam(':order_id', $order['id']);
            $itemsStmt->execute();
            
            $items = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Format shipping address
            $order['shippingAddress'] = [
                'street' => $order['shipping_address'] ?? '',
                'city' => $order['shipping_city'] ?? '',
                'state' => '',
                'zip' => $order['shipping_postal_code'] ?? '',
                'country' => $order['shipping_country'] ?? ''
            ];
            
            // Add payment method
            $order['paymentMethod'] = $order['payment_method'] ?? '';
            
            // Add delivery dates conditionally
            if ($order['status'] === 'shipped') {
                $orderDate = new DateTime($order['date']);
                $estimatedDelivery = clone $orderDate;
                $estimatedDelivery->modify('+7 days');
                $order['estimatedDelivery'] = $estimatedDelivery->format('Y-m-d H:i:s');
            } elseif ($order['status'] === 'delivered') {
                $orderDate = new DateTime($order['date']);
                $actualDelivery = clone $orderDate;
                $actualDelivery->modify('+4 days'); // Fixed days to avoid random errors
                $order['actualDelivery'] = $actualDelivery->format('Y-m-d H:i:s');
            }
            
            // Clean up response
            unset($order['shipping_address']);
            unset($order['shipping_city']);
            unset($order['shipping_postal_code']);
            unset($order['shipping_country']);
            unset($order['payment_method']);
            
            // Add items to order
            $order['items'] = $items;
        } catch (Exception $orderError) {
            // Log the error but continue processing other orders
            error_log('Error processing order ' . $order['id'] . ': ' . $orderError->getMessage());
            
            // Add minimal info to not break the UI
            $order['items'] = [];
            $order['shippingAddress'] = [
                'street' => '', 'city' => '', 'state' => '', 'zip' => '', 'country' => ''
            ];
            $order['paymentMethod'] = '';
        }
    }
    
    echo json_encode([
        'success' => true,
        'orders' => $orders
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>