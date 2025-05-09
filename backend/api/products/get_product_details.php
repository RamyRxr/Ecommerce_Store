<?php
// filepath: c:\xampp\htdocs\Project-Web\backend\api\products\get_product_details.php
session_start();
require_once '../../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

$response = ['success' => false, 'message' => 'An error occurred.'];

if (!isset($_GET['id']) || empty(trim($_GET['id']))) {
    $response['message'] = 'Product ID is required.';
    echo json_encode($response);
    exit;
}

$productId = filter_var(trim($_GET['id']), FILTER_SANITIZE_NUMBER_INT);

if (!$productId) {
    $response['message'] = 'Invalid Product ID.';
    echo json_encode($response);
    exit;
}

$database = new Database();
$conn = $database->getConnection();

if (!$conn) {
    $response['message'] = 'Database connection failed.';
    echo json_encode($response);
    exit;
}

try {
    $sql = "SELECT 
                p.id, 
                p.title AS name, 
                p.description, 
                p.price, 
                p.original_price, 
                p.category, 
                p.condition, 
                p.brand, 
                p.model, 
                p.quantity AS stock_quantity, 
                p.status, 
                p.shipping, 
                p.local_pickup, 
                p.seller_id, 
                p.views, 
                p.rating AS rating_avg, 
                p.rating_count AS review_count, 
                p.created_at,
                u.username AS seller_name,
                u.profile_image AS seller_avatar,
                (SELECT GROUP_CONCAT(pi.image_url) FROM product_images pi WHERE pi.product_id = p.id) AS images
            FROM 
                products p
            LEFT JOIN 
                users u ON p.seller_id = u.id
            WHERE 
                p.id = :product_id
            LIMIT 1";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':product_id', $productId, PDO::PARAM_INT);
    $stmt->execute();

    $product = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($product) {
        if (!empty($product['images'])) {
            $product['images'] = explode(',', $product['images']);
        } else {
            $product['images'] = [];
        }
        
        // Ensure numeric types are correct
        $product['id'] = (int)$product['id'];
        $product['price'] = (float)$product['price'];
        $product['original_price'] = $product['original_price'] ? (float)$product['original_price'] : null;
        $product['stock_quantity'] = (int)$product['stock_quantity'];
        $product['seller_id'] = (int)$product['seller_id'];
        $product['views'] = (int)$product['views'];
        $product['rating_avg'] = (float)$product['rating_avg'];
        $product['review_count'] = (int)$product['review_count'];

        $response['success'] = true;
        $response['product'] = $product;
        $response['message'] = 'Product details fetched successfully.';
    } else {
        $response['message'] = 'Product not found.';
        http_response_code(404);
    }

} catch (PDOException $e) {
    $response['message'] = 'Database error: ' . $e->getMessage();
    http_response_code(500);
} catch (Exception $e) {
    $response['message'] = 'General error: ' . $e->getMessage();
    http_response_code(500);
} finally {
    $conn = null;
}

echo json_encode($response);
?>