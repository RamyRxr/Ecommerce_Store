<?php
class Order {
    private $orderId;
    private $userId;
    private $productIds;
    private $orderDate;
    private $status;

    public function __construct($orderId, $userId, $productIds, $orderDate, $status) {
        $this->orderId = $orderId;
        $this->userId = $userId;
        $this->productIds = $productIds;
        $this->orderDate = $orderDate;
        $this->status = $status;
    }

    public function getOrderId() {
        return $this->orderId;
    }

    public function getUserId() {
        return $this->userId;
    }

    public function getProductIds() {
        return $this->productIds;
    }

    public function getOrderDate() {
        return $this->orderDate;
    }

    public function getStatus() {
        return $this->status;
    }

    public function setStatus($status) {
        $this->status = $status;
    }

    public function save() {
        // Code to save the order to the database
    }

    public function fetchOrderDetails($orderId) {
        // Code to fetch order details from the database
    }

    public function fetchUserOrders($userId) {
        // Code to fetch all orders for a specific user
    }
}
?>