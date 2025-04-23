<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json");

require_once '../config/database.php';
require_once '../utils/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(false, 'Invalid request method');
}

try {
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 35;
    $offset = ($page - 1) * $limit;
    
    // Get total count
    $stmt = $conn->query("SELECT COUNT(*) FROM product_listings");
    $total = $stmt->fetchColumn();
    
    // Get listings with user info
    $stmt = $conn->prepare("
        SELECT p.*, u.username as seller_name 
        FROM product_listings p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
    ");
    
    $stmt->execute([$limit, $offset]);
    $listings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    json_response(true, 'Listings retrieved successfully', [
        'listings' => $listings,
        'total' => $total,
        'page' => $page,
        'pages' => ceil($total / $limit)
    ]);

} catch(PDOException $e) {
    json_response(false, 'Database error: ' . $e->getMessage());
}