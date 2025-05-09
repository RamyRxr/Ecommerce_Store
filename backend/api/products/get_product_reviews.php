<?php
// filepath: c:\xampp\htdocs\Project-Web\backend\api\products\get_product_reviews.php
session_start();
require_once '../../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

$response = ['success' => false, 'message' => 'An error occurred.', 'reviews' => []];

if (!isset($_GET['product_id']) || empty(trim($_GET['product_id']))) {
    $response['message'] = 'Product ID is required for reviews.';
    echo json_encode($response);
    exit;
}

$productId = filter_var(trim($_GET['product_id']), FILTER_SANITIZE_NUMBER_INT);

if (!$productId) {
    $response['message'] = 'Invalid Product ID for reviews.';
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
                r.id, 
                r.user_id, 
                r.product_id, 
                r.rating, 
                r.review_text, 
                r.created_at,
                u.username,
                u.profile_image AS user_avatar
            FROM 
                reviews r
            JOIN 
                users u ON r.user_id = u.id
            WHERE 
                r.product_id = :product_id
            ORDER BY 
                r.created_at DESC";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':product_id', $productId, PDO::PARAM_INT);
    $stmt->execute();

    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($reviews) {
        $formatted_reviews = array_map(function($review) {
            $review['id'] = (int)$review['id'];
            $review['user_id'] = (int)$review['user_id'];
            $review['product_id'] = (int)$review['product_id'];
            $review['rating'] = (float)$review['rating'];
            return $review;
        }, $reviews);
        $response['success'] = true;
        $response['reviews'] = $formatted_reviews;
        $response['message'] = 'Reviews fetched successfully.';
    } else {
        $response['success'] = true; 
        $response['message'] = 'No reviews found for this product.';
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