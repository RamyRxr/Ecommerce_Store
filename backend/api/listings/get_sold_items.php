<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php'; 

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

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':seller_id', $seller_id, PDO::PARAM_INT);
    $stmt->execute();

    $soldItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formattedSoldItems = array_map(function($item) {
        $raw_image_path = null;
        if (!empty($item['product_image_url'])) {
            $raw_image_path = explode(',', $item['product_image_url'])[0];
        }

        $final_image_path_for_json = ''; 

        if ($raw_image_path) {
            if (str_starts_with($raw_image_path, 'http://') || str_starts_with($raw_image_path, 'https://') || str_contains($raw_image_path, '/')) {
                $final_image_path_for_json = $raw_image_path;
            } else {
                $final_image_path_for_json = 'uploads/products/' . $raw_image_path;
            }
        }

        return [
            'id' => $item['sold_item_id'],
            'productId' => $item['product_id'],
            'orderId' => $item['order_id'],
            'title' => $item['product_title'],
            'description' => $item['product_description'],
            'price' => (float)$item['sold_price'],
            'quantitySold' => (int)$item['quantity_sold'],
            'dateSold' => $item['sold_at'],
            'buyerUsername' => $item['buyer_username'] ?? 'N/A',
            'images' => [$final_image_path_for_json] 
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