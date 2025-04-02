DELIMITER //

CREATE TRIGGER restore_stock_on_cancel
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    -- Si la commande passe au statut "Annulée"
    IF NEW.status_id = (SELECT status_id FROM order_statuses WHERE name = 'Annulée')
       AND OLD.status_id != NEW.status_id THEN
        
        -- Restaurer le stock pour chaque article
        UPDATE products p
        JOIN order_items oi ON p.product_id = oi.product_id
        SET p.stock_quantity = p.stock_quantity + oi.quantity
        WHERE oi.order_id = NEW.order_id;
    END IF;
END //

DELIMITER ;