<?php
require_once '../config.php';

// Only process GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(false, 'Invalid request method');
}

// Get filter parameters
$category = isset($_GET['category']) ? intval($_GET['category']) : null;
$min_price = isset($_GET['min_price']) ? floatval($_GET['min_price']) : null;
$max_price = isset($_GET['max_price']) ? floatval($_GET['max_price']) : null;
$search = isset($_GET['search']) ? sanitizeInput($_GET['search']) : null;
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 12;

// Validate parameters
if ($page < 1) $page = 1;
if ($limit < 1 || $limit > 50) $limit = 12;

try {
    $conn = getDbConnection();
    
    // Build base query
    $sql = "SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.category_id 
            WHERE 1=1";
    $params = [];
    
    // Add filters to query
    if ($category !== null) {
        $sql .= " AND p.category_id = :category";
        $params[':category'] = $category;
    }
    
    if ($min_price !== null) {
        $sql .= " AND p.price >= :min_price";
        $params[':min_price'] = $min_price;
    }
    
    if ($max_price !== null) {
        $sql .= " AND p.price <= :max_price";
        $params[':max_price'] = $max_price;
    }
    
    if ($search !== null) {
        $sql .= " AND (p.name LIKE :search OR p.description LIKE :search)";
        $params[':search'] = "%{$search}%";
    }
    
    // Add pagination
    $offset = ($page - 1) * $limit;
    $sql .= " ORDER BY p.created_at DESC LIMIT :limit OFFSET :offset";
    $params[':limit'] = $limit;
    $params[':offset'] = $offset;
    
    // Prepare and execute query
    $stmt = $conn->prepare($sql);
    
    // Bind named parameters
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    $stmt->execute();
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get total count for pagination
    $count_sql = "SELECT COUNT(*) FROM products p WHERE 1=1";
    $count_params = [];
    
    if ($category !== null) {
        $count_sql .= " AND p.category_id = :category";
        $count_params[':category'] = $category;
    }
    
    if ($min_price !== null) {
        $count_sql .= " AND p.price >= :min_price";
        $count_params[':min_price'] = $min_price;
    }
    
    if ($max_price !== null) {
        $count_sql .= " AND p.price <= :max_price";
        $count_params[':max_price'] = $max_price;
    }
    
    if ($search !== null) {
        $count_sql .= " AND (p.name LIKE :search OR p.description LIKE :search)";
        $count_params[':search'] = "%{$search}%";
    }
    
    $count_stmt = $conn->prepare($count_sql);
    
    // Bind named parameters for count query
    foreach ($count_params as $key => $value) {
        $count_stmt->bindValue($key, $value);
    }
    
    $count_stmt->execute();
    $total = $count_stmt->fetchColumn();
    
    // Return product data
    sendJsonResponse(true, 'Products retrieved successfully', [
        'products' => $products,
        'pagination' => [
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ]
    ]);
} catch (PDOException $e) {
    sendJsonResponse(false, 'Server error: ' . $e->getMessage());
}
?>