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

-- Testing line --> this must add new item to order
INSERT INTO order_items (order_id, product_id, product_title, quantity, price, created_at) 
VALUES ('ORD-0525-201', 2, 'test2', 1,120, NOW());