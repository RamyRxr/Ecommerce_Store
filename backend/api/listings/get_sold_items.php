<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php'; // Adjust path

$response = ['success' => false, 'data' => [], 'message' => ''];

if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
    $response['message'] = 'User not authenticated.';
    http_response_code(401);
    echo json_encode($response);
    exit;
}

$seller_id = $_SESSION['user']['id'];

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Fetch sold items for the logged-in seller
    // Join with products to get title and other details
    // Join with product_images to get the first image
    $sql = "SELECT 
                si.id as sold_item_id,
                si.product_id,
                si.order_id,
                si.sold_price,
                si.quantity_sold,
                si.sold_at,
                p.title as product_title,
                p.description as product_description,
                u_buyer.username as buyer_username,
                (SELECT GROUP_CONCAT(pi.image_url ORDER BY pi.display_order ASC, pi.id ASC) 
                 FROM product_images pi 
                 WHERE pi.product_id = si.product_id 
                 LIMIT 1) as product_image_url
            FROM sold_items si
            JOIN products p ON si.product_id = p.id
            JOIN users u_buyer ON si.buyer_id = u_buyer.id 
            WHERE si.seller_id = :seller_id
            ORDER BY si.sold_at DESC";
            // Consider adding JOIN users u_buyer ON si.buyer_id = u_buyer.id if you need buyer info

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':seller_id', $seller_id, PDO::PARAM_INT);
    $stmt->execute();

    $soldItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formattedSoldItems = array_map(function($item) {
        // Process image URL similar to how you do in get_listings.php
        $imageUrl = '../assets/images/products-images/placeholder.svg'; // Default
        if (!empty($item['product_image_url'])) {
            // Assuming product_image_url might be a comma-separated list from GROUP_CONCAT, take the first
            $firstImage = explode(',', $item['product_image_url'])[0];
            $imageUrl = $firstImage; // The path is already relative from product_images
             // Adjust path if image_url is not stored with '../backend/' prefix
            if (!str_starts_with($imageUrl, '../backend/')) {
                 $imageUrl = '../backend/' . $imageUrl;
            }
        }
        return [
            'id' => $item['sold_item_id'], // This is sold_items.id
            'productId' => $item['product_id'],
            'orderId' => $item['order_id'],
            'title' => $item['product_title'],
            'description' => $item['product_description'],
            'price' => (float)$item['sold_price'],
            'quantitySold' => (int)$item['quantity_sold'],
            'dateSold' => $item['sold_at'],
            'buyerUsername' => $item['buyer_username'] ?? 'N/A',
            'images' => [$imageUrl] // Present as an array for consistency with other image handling
        ];
    }, $soldItems);

    $response['success'] = true;
    $response['data'] = $formattedSoldItems;

} catch (PDOException $e) {
    $response['message'] = 'Database error: ' . $e->getMessage();
    http_response_code(500);
    error_log("Get Sold Items PDO Error: " . $e->getMessage());
} catch (Exception $e) {
    $response['message'] = 'Server error: ' . $e->getMessage();
    http_response_code(500);
    error_log("Get Sold Items Error: " . $e->getMessage());
}

echo json_encode($response);
?>