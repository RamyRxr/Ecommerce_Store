<?php
// filepath: c:\xampp\htdocs\Project-Web\backend\api\products\get_product_sold_count.php
session_start();
require_once '../../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

$response = ['success' => false, 'message' => 'An error occurred.', 'sold_count' => 0];

if (!isset($_GET['product_id']) || empty(trim($_GET['product_id']))) {
    $response['message'] = 'Product ID is required for sold count.';
    echo json_encode($response);
    exit;
}

$productId = filter_var(trim($_GET['product_id']), FILTER_SANITIZE_NUMBER_INT);

if (!$productId) {
    $response['message'] = 'Invalid Product ID for sold count.';
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
                COALESCE(SUM(quantity_sold), 0) AS total_sold 
            FROM 
                sold_items 
            WHERE 
                product_id = :product_id";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':product_id', $productId, PDO::PARAM_INT);
    $stmt->execute();

    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        $response['success'] = true;
        $response['sold_count'] = (int)$result['total_sold'];
        $response['message'] = 'Sold count fetched successfully.';
    } else {
        // This case should ideally not happen with COALESCE, but as a fallback
        $response['message'] = 'Could not retrieve sold count.';
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