
<?php
// Database connection configuration
$host = 'localhost';
$dbname = 'ecommerce_store'; // Change this to your actual database name
$username = 'Ramy';       // Change if needed
$password = 'Ramy2024';           // Change if needed

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("SET NAMES utf8");
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    die();
}
?>