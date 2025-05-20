<?php
require_once '../../config/database.php';
header('Content-Type: application/json');
try {
    $db = new Database();
    $conn = $db->getConnection();
    $stmt = $conn->prepare("SELECT DISTINCT category FROM products WHERE status = 'active' AND quantity > 0");
    $stmt->execute();
    $categories = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $categories[] = $row['category'];
    }
    echo json_encode(['success' => true, 'categories' => $categories]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'categories' => [], 'message' => $e->getMessage()]);
}