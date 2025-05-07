<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php'; // Adjust path as needed

try {
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('User not logged in');
    }
    $user_id = $_SESSION['user']['id'];

    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['item_id']) || !isset($data['quantity_change'])) {
        throw new Exception('Item ID and quantity change are required');
    }

    $item_id = (int)$data['item_id']; // This is cart_item.id
    $quantity_change = (int)$data['quantity_change'];

    $db = new Database();
    $conn = $db->getConnection();

    // Get current cart item and product stock
    $stmt_check = $conn->prepare("
        SELECT ci.quantity AS current_cart_quantity, ci.product_id, p.quantity AS available_stock
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.id = :item_id AND ci.user_id = :user_id
    ");
    $stmt_check->bindParam(':item_id', $item_id);
    $stmt_check->bindParam(':user_id', $user_id);
    $stmt_check->execute();
    $item_details = $stmt_check->fetch(PDO::FETCH_ASSOC);

    if (!$item_details) {
        throw new Exception('Cart item not found');
    }

    $current_cart_quantity = (int)$item_details['current_cart_quantity'];
    $available_stock = (int)$item_details['available_stock'];
    
    $new_quantity = $current_cart_quantity + $quantity_change;

    // Ensure quantity doesn't go below 1
    if ($new_quantity < 1) {
        $new_quantity = 1;
    }

    // Ensure quantity doesn't exceed available stock
    if ($new_quantity > $available_stock) {
        $new_quantity = $available_stock;
        $message = 'Quantity adjusted to available stock.';
    }

    // Update the cart item quantity
    $stmt_update = $conn->prepare("UPDATE cart_items SET quantity = :new_quantity WHERE id = :item_id AND user_id = :user_id");
    $stmt_update->bindParam(':new_quantity', $new_quantity);
    $stmt_update->bindParam(':item_id', $item_id);
    $stmt_update->bindParam(':user_id', $user_id);
    
    if ($stmt_update->execute()) {
        echo json_encode([
            'success' => true, 
            'message' => $message ?? 'Quantity updated successfully',
            'new_quantity' => $new_quantity // Send back the actual new quantity
        ]);
    } else {
        throw new Exception('Failed to update quantity in database');
    }

} catch (Exception $e) {
    http_response_code(400); // Or 500 for server errors
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}