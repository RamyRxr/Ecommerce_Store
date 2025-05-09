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

--Test line
INSERT INTO orders (id, user_id, total_price, shipping_method, shipping_cost, shipping_address, shipping_city, shipping_state, shipping_zip, shipping_country, payment_method, status) 
VALUES ('ORD-0525-301', 3, 10.00, 'test', 0, 'test', 'test', 'ts', '123', 'testland', 'test', 'pending'); 
