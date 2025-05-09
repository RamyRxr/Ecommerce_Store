<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

$response = ['success' => false, 'message' => 'An error occurred.'];
$conn = null;

try {
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        http_response_code(401);
        throw new Exception('User not logged in.');
    }
    $user_id = $_SESSION['user']['id'];

    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || !isset($data['order_id'])) {
        http_response_code(400);
        throw new Exception('Order ID is required.');
    }
    $order_id = trim($data['order_id']);

    if (empty($order_id)) {
        http_response_code(400);
        throw new Exception('Order ID cannot be empty.');
    }

    $db = new Database();
    $conn = $db->getConnection();
    $conn->beginTransaction();

    $checkOrderRatingSql = "SELECT id FROM order_ratings WHERE order_id = :order_id AND user_id = :user_id";
    $checkOrderRatingStmt = $conn->prepare($checkOrderRatingSql);
    $checkOrderRatingStmt->bindParam(':order_id', $order_id);
    $checkOrderRatingStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $checkOrderRatingStmt->execute();

    if ($checkOrderRatingStmt->rowCount() === 0) {
        http_response_code(404);
        throw new Exception('Order rating not found for this user and order.');
    }

    $orderItemsSql = "SELECT DISTINCT product_id FROM order_items WHERE order_id = :order_id";
    $orderItemsStmt = $conn->prepare($orderItemsSql);
    $orderItemsStmt->bindParam(':order_id', $order_id);
    $orderItemsStmt->execute();
    $order_product_ids = $orderItemsStmt->fetchAll(PDO::FETCH_COLUMN);

    $deleteOrderRatingSql = "DELETE FROM order_ratings WHERE order_id = :order_id AND user_id = :user_id";
    $deleteOrderRatingStmt = $conn->prepare($deleteOrderRatingSql);
    $deleteOrderRatingStmt->bindParam(':order_id', $order_id);
    $deleteOrderRatingStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    if (!$deleteOrderRatingStmt->execute()) {
        throw new Exception('Failed to delete order rating.');
    }

    $affected_product_ids_for_rating_update = [];
    if (!empty($order_product_ids)) {
        $review_text_pattern = "Rated as part of order " . htmlspecialchars($order_id) . ".%";
        
        $placeholders = implode(',', array_fill(0, count($order_product_ids), '?'));
        $deleteProductReviewsSql = "DELETE FROM reviews 
                                    WHERE user_id = ? 
                                    AND product_id IN ($placeholders)
                                    AND review_text LIKE ?";
        
        $deleteProductReviewsStmt = $conn->prepare($deleteProductReviewsSql);
        
        $params = array_merge([$user_id], $order_product_ids, [$review_text_pattern]);
        
        if ($deleteProductReviewsStmt->execute($params)) {
            $affected_product_ids_for_rating_update = $order_product_ids;
        } else {
             error_log("Failed to delete associated product reviews for order_id {$order_id}. Error: " . implode(";", $deleteProductReviewsStmt->errorInfo()));
        }
    }

    foreach ($affected_product_ids_for_rating_update as $product_id_to_update) {
        if (empty($product_id_to_update)) continue;

        $updateProductRatingSql = "
            UPDATE products p
            SET 
                rating = (SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.id),
                rating_count = (SELECT COUNT(r.id) FROM reviews r WHERE r.product_id = p.id)
            WHERE p.id = :product_id
        ";
        $updateProductRatingStmt = $conn->prepare($updateProductRatingSql);
        $updateProductRatingStmt->bindParam(':product_id', $product_id_to_update, PDO::PARAM_INT);
        if (!$updateProductRatingStmt->execute()) {
            error_log("Failed to update product rating for product_id {$product_id_to_update}. Error: " . implode(";", $updateProductRatingStmt->errorInfo()));
        }
        
        $stmtCheckNullRating = $conn->prepare("UPDATE products SET rating = 0 WHERE id = :product_id AND rating IS NULL");
        $stmtCheckNullRating->bindParam(':product_id', $product_id_to_update, PDO::PARAM_INT);
        $stmtCheckNullRating->execute();
    }

    $conn->commit();
    $response['success'] = true;
    $response['message'] = 'Order rating and associated product reviews deleted. Product ratings updated.';

} catch (PDOException $e) {
    if ($conn && $conn->inTransaction()) $conn->rollBack();
    http_response_code(500);
    $response['message'] = 'Database error: ' . $e->getMessage();
    error_log("Delete Order Rating PDOException: " . $e->getMessage() . " Trace: " . $e->getTraceAsString());
} catch (Exception $e) {
    if ($conn && $conn->inTransaction()) $conn->rollBack();
    $http_code = http_response_code();
    if ($http_code === 200 || $http_code === false) { // Check if false, which means not set
        http_response_code(500); 
    }
    $response['message'] = $e->getMessage();
    error_log("Delete Order Rating Exception: " . $e->getMessage() . " Trace: " . $e->getTraceAsString());
}

echo json_encode($response);
?>