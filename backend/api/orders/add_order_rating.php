<?php
// filepath: backend/api/orders/add_order_rating.php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

$response = ['success' => false, 'message' => 'An error occurred.'];
$conn = null; // Initialize connection variable

try {
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        http_response_code(401);
        throw new Exception('User not logged in.');
    }
    $user_id = $_SESSION['user']['id'];

    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['order_id']) || !isset($data['rating'])) {
        http_response_code(400);
        throw new Exception('Order ID and rating are required.');
    }

    $order_id = trim($data['order_id']);
    $rating = intval($data['rating']);
    $comments = isset($data['comments']) ? trim($data['comments']) : null;

    if (empty($order_id)) {
        http_response_code(400);
        throw new Exception('Order ID cannot be empty.');
    }

    if ($rating < 1 || $rating > 5) {
        http_response_code(400);
        throw new Exception('Rating must be between 1 and 5.');
    }

    $db = new Database();
    $conn = $db->getConnection();
    $conn->beginTransaction();

    // 1. Verify the order belongs to the user and is in a rateable state (e.g., 'delivered')
    $orderSql = "SELECT id FROM orders WHERE id = :order_id AND user_id = :user_id AND status = 'delivered'";
    $orderStmt = $conn->prepare($orderSql);
    $orderStmt->bindParam(':order_id', $order_id);
    $orderStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $orderStmt->execute();

    if ($orderStmt->rowCount() === 0) {
        http_response_code(403);
        throw new Exception('Order not found, does not belong to you, or is not yet delivered.');
    }

    // 2. Check if this order has already been rated by this user
    $checkSql = "SELECT id FROM order_ratings WHERE order_id = :order_id AND user_id = :user_id";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bindParam(':order_id', $order_id);
    $checkStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $checkStmt->execute();

    if ($checkStmt->rowCount() > 0) {
        http_response_code(409);
        throw new Exception('This order has already been rated.');
    }

    // 3. Insert the order rating
    $insertOrderRatingSql = "INSERT INTO order_ratings (order_id, user_id, rating, comments, created_at, updated_at) 
                             VALUES (:order_id, :user_id, :rating, :comments, NOW(), NOW())";
    $insertOrderRatingStmt = $conn->prepare($insertOrderRatingSql);
    $insertOrderRatingStmt->bindParam(':order_id', $order_id);
    $insertOrderRatingStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $insertOrderRatingStmt->bindParam(':rating', $rating, PDO::PARAM_INT);
    $insertOrderRatingStmt->bindParam(':comments', $comments, PDO::PARAM_STR);
    
    if (!$insertOrderRatingStmt->execute()) {
        // No need to set $response here, the catch block will handle it
        throw new Exception('Failed to submit order rating. Database error on order_ratings.');
    }

    // 4. Fetch products from the order
    $orderItemsSql = "SELECT product_id FROM order_items WHERE order_id = :order_id";
    $orderItemsStmt = $conn->prepare($orderItemsSql);
    $orderItemsStmt->bindParam(':order_id', $order_id);
    $orderItemsStmt->execute();
    $items = $orderItemsStmt->fetchAll(PDO::FETCH_ASSOC);

    $productReviewText = "Rated as part of order " . htmlspecialchars($order_id) . ".";
    if (!empty($comments)) {
        $productReviewText .= " User's order comment: " . htmlspecialchars($comments);
    }
    // Ensure review text does not exceed TEXT column limits (typically 65535 bytes)
    if (strlen($productReviewText) > 65535) {
        $productReviewText = substr($productReviewText, 0, 65532) . "...";
    }


    foreach ($items as $item) {
        if (empty($item['product_id'])) {
            error_log("Skipping product review for order_id {$order_id} due to NULL product_id in order_items.");
            continue; 
        }
        $product_id = $item['product_id'];

        // 5. Insert product review
        // Note: This assumes your 'reviews' table allows multiple reviews from the same user for the same product
        // if they come from different orders. If not, you might need an ON DUPLICATE KEY UPDATE or similar logic.
        $insertProductReviewSql = "INSERT INTO reviews (user_id, product_id, rating, review_text, created_at, updated_at)
                                   VALUES (:user_id, :product_id, :rating, :review_text, NOW(), NOW())";
        $insertProductReviewStmt = $conn->prepare($insertProductReviewSql);
        $insertProductReviewStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $insertProductReviewStmt->bindParam(':product_id', $product_id, PDO::PARAM_INT);
        $insertProductReviewStmt->bindParam(':rating', $rating, PDO::PARAM_INT);
        $insertProductReviewStmt->bindParam(':review_text', $productReviewText, PDO::PARAM_STR);
        
        if (!$insertProductReviewStmt->execute()) {
            error_log("Failed to insert product review for product_id {$product_id} from order {$order_id}: " . implode(";", $insertProductReviewStmt->errorInfo()));
            // Decide if one failure should stop all: throw new Exception(...) here to rollback.
            // For now, log and continue.
        }

        // 6. Update product's average rating and rating count
        // This ensures the product's rating is always based on all its reviews.
        $updateProductRatingSql = "
            UPDATE products p
            SET 
                rating = (SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.id),
                rating_count = (SELECT COUNT(r.id) FROM reviews r WHERE r.product_id = p.id)
            WHERE p.id = :product_id
        ";
        $updateProductRatingStmt = $conn->prepare($updateProductRatingSql);
        $updateProductRatingStmt->bindParam(':product_id', $product_id, PDO::PARAM_INT);
        
        if (!$updateProductRatingStmt->execute()) {
            error_log("Failed to update product rating for product_id {$product_id}: " . implode(";", $updateProductRatingStmt->errorInfo()));
            // Decide if one failure should stop all: throw new Exception(...) here to rollback.
        }
    }

    $conn->commit();
    $response['success'] = true;
    $response['message'] = 'Order rating submitted and product reviews updated successfully.';

} catch (PDOException $e) {
    if ($conn && $conn->inTransaction()) {
        $conn->rollBack();
    }
    http_response_code(500);
    $response['message'] = 'Database error: ' . $e->getMessage();
    error_log("Order Rating PDOException: " . $e->getMessage() . " Trace: " . $e->getTraceAsString());
} catch (Exception $e) {
    if ($conn && $conn->inTransaction()) {
        $conn->rollBack();
    }
    if (http_response_code() === 200) { 
        http_response_code(500); 
    }
    $response['message'] = $e->getMessage();
    error_log("Order Rating Exception: " . $e->getMessage() . " Trace: " . $e->getTraceAsString());
}

echo json_encode($response);
?>