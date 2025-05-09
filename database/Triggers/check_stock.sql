DELIMITER //

CREATE TRIGGER CheckStockBeforeOrderItemInsert
BEFORE INSERT ON order_items
FOR EACH ROW
BEGIN
    DECLARE available_stock INT;
    SELECT quantity INTO available_stock FROM products WHERE id = NEW.product_id;
    IF available_stock < NEW.quantity THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Quantity requested exceeds available stock for the product.';
    END IF;
END //

DELIMITER ;