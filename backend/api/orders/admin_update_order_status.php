<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    // Check if user is logged in and is an admin
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('User not logged in');
    }
    if (!isset($_SESSION['user']['is_admin']) || !$_SESSION['user']['is_admin']) {
        throw new Exception('Unauthorized: Admin privileges required');
    }

    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['order_id']) || !isset($data['status'])) {
        throw new Exception('Order ID and new status are required');
    }

    $order_id = $data['order_id'];
    $new_status = $data['status'];
    $reason = $data['reason'] ?? null; // Optional reason, e.g., for cancellation

    $allowed_statuses = ['shipped', 'delivered', 'cancelled'];
    if (!in_array($new_status, $allowed_statuses)) {
        throw new Exception('Invalid status update');
    }

    $db = new Database();
    $conn = $db->getConnection();

    // Prepare SQL statement
    $sql = "UPDATE orders SET status = :status, updated_at = NOW()";
    $params = [':status' => $new_status, ':order_id' => $order_id];

    // Add cancellation specific fields if status is 'cancelled'
    // Assuming you might add dedicated columns like 'cancellation_reason', 'cancelled_at'
    // For now, we'll just update the status and updated_at.
    // If you have specific columns:
    // if ($new_status === 'cancelled') {
    //     $sql .= ", cancellation_reason = :reason, cancelled_at = NOW()";
    //     $params[':reason'] = $reason ?: 'Cancelled by admin';
    // }
    
    $sql .= " WHERE id = :order_id";

    $stmt = $conn->prepare($sql);
    
    if ($stmt->execute($params)) {
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Order status updated successfully']);
        } else {
            throw new Exception('Order not found or status already set');
        }
    } else {
        throw new Exception('Failed to update order status');
    }

} catch (Exception $e) {
    http_response_code(400); // Bad Request or other appropriate error code
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>