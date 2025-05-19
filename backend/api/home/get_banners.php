<?php
require_once '../../config/database.php';
header('Content-Type: application/json');
try {
    $db = new Database();
    $conn = $db->getConnection();
    $stmt = $conn->prepare("SELECT id, image_url as url FROM banners ORDER BY created_at ASC");
    $stmt->execute();
    $banners = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'banners' => $banners]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'banners' => [], 'message' => $e->getMessage()]);
}