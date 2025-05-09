DELIMITER //

CREATE TRIGGER UpdateStockAfterOrderItemInsert
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    UPDATE products
    SET quantity = quantity - NEW.quantity
    WHERE id = NEW.product_id;
END //

DELIMITER ;