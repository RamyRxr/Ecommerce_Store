<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php'; // Adjust path as needed

try {
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('User not logged in');
    }
    $user_id = $_SESSION['user']['id'];

    $db = new Database();
    $conn = $db->getConnection();

    // Fetch cart items along with product details including available stock and images
    $sql = "SELECT 
                ci.id, 
                ci.product_id, 
                ci.quantity AS cart_quantity, 
                p.title AS name, 
                p.price, 
                p.quantity AS available_stock, -- This is the product's total available quantity
                GROUP_CONCAT(pi.image_url) as images
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE ci.user_id = :user_id
            GROUP BY ci.id, p.id"; // Ensure grouping is correct for product details

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    
    $cart_data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formatted_cart_data = array_map(function($item) {
        $image_urls = $item['images'] ? explode(',', $item['images']) : [];
        return [
            'id' => (int)$item['id'], // cart_item_id
            'product_id' => (int)$item['product_id'],
            'name' => $item['name'],
            'price' => (float)$item['price'],
            'quantity' => (int)$item['cart_quantity'], // Quantity in cart
            'available_stock' => (int)$item['available_stock'], // Max available stock for this product
            'images' => $image_urls // Array of image URLs
        ];
    }, $cart_data);

    echo json_encode(['success' => true, 'data' => $formatted_cart_data]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>