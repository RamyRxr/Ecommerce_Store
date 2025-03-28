<?php
header('Content-Type: application/json');

include_once '../config/database.php';
include_once '../models/Order.php';

$database = new Database();
$db = $database->getConnection();

$order = new Order($db);

$requestMethod = $_SERVER['REQUEST_METHOD'];

switch ($requestMethod) {
    case 'GET':
        $orders = $order->getAllOrders();
        echo json_encode($orders);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->userId) && !empty($data->productIds)) {
            $order->userId = $data->userId;
            $order->productIds = $data->productIds;

            if ($order->createOrder()) {
                echo json_encode(["message" => "Order created successfully."]);
            } else {
                echo json_encode(["message" => "Unable to create order."]);
            }
        } else {
            echo json_encode(["message" => "Incomplete data."]);
        }
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->orderId)) {
            $order->id = $data->orderId;

            if ($order->deleteOrder()) {
                echo json_encode(["message" => "Order deleted successfully."]);
            } else {
                echo json_encode(["message" => "Unable to delete order."]);
            }
        } else {
            echo json_encode(["message" => "Order ID is required."]);
        }
        break;

    default:
        echo json_encode(["message" => "Invalid request method."]);
        break;
}
?>