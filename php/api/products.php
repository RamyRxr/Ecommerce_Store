<?php
require_once '../config/database.php';

class ProductAPI {
    private $connection;

    public function __construct($db) {
        $this->connection = $db;
    }

    public function getProducts() {
        $query = "SELECT * FROM products";
        $stmt = $this->connection->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getProduct($id) {
        $query = "SELECT * FROM products WHERE id = :id";
        $stmt = $this->connection->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();
$productAPI = new ProductAPI($db);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        $product = $productAPI->getProduct($_GET['id']);
        echo json_encode($product);
    } else {
        $products = $productAPI->getProducts();
        echo json_encode($products);
    }
} else {
    echo json_encode(['message' => 'Method not allowed']);
}
?>