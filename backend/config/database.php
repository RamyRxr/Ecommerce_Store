<?php
class Database {
    private $host = "localhost";
    private $db_name = "ecommerce_store";
    private $username = "Ramy";
    private $password = "Ramy2024";
    private $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $this->conn;
        } catch(PDOException $e) {
            throw new PDOException("Connection error: " . $e->getMessage());
        }
    }
}
?>