DELIMITER //

CREATE TRIGGER check_stock_before_order
BEFORE INSERT ON order_items
FOR EACH ROW
BEGIN
    DECLARE available_stock INT;
    
    -- Récupérer le stock disponible
    SELECT stock_quantity INTO available_stock
    FROM products
    WHERE product_id = NEW.product_id;
    
    -- Vérifier si le stock est suffisant
    IF NEW.quantity > available_stock THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Stock insuffisant pour ce produit';
    END IF;
END //

DELIMITER ;