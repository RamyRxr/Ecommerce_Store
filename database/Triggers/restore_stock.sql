DELIMITER //

CREATE TRIGGER RestoreStockAfterOrderCancellation
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        DECLARE done INT DEFAULT FALSE;
        DECLARE v_product_id INT;
        DECLARE v_quantity INT;
        DECLARE cur_order_items CURSOR FOR 
            SELECT product_id, quantity 
            FROM order_items 
            WHERE order_id = NEW.id;
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

        OPEN cur_order_items;

        read_loop: LOOP
            FETCH cur_order_items INTO v_product_id, v_quantity;
            IF done THEN
                LEAVE read_loop;
            END IF;
            
            UPDATE products
            SET quantity = quantity + v_quantity
            WHERE id = v_product_id;
        END LOOP;

        CLOSE cur_order_items;
    END IF;
END //

DELIMITER ;