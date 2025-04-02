DELIMITER //

CREATE PROCEDURE get_order_details(IN p_order_id INT, IN p_user_id INT)
BEGIN
    -- Vérifier que l'utilisateur a accès à cette commande (sécurité)
    DECLARE has_access BOOLEAN;
    DECLARE user_role VARCHAR(10);
    
    SELECT role INTO user_role FROM users WHERE user_id = p_user_id;
    
    IF user_role = 'admin' THEN
        SET has_access = TRUE;
    ELSE
        SELECT COUNT(*) > 0 INTO has_access 
        FROM orders 
        WHERE order_id = p_order_id AND user_id = p_user_id;
    END IF;
    
    IF has_access THEN
        -- Informations générales de la commande
        SELECT o.order_id, o.order_date, os.name AS status, o.total_amount,
               o.shipping_address, o.shipping_city, o.shipping_postal_code, 
               o.shipping_country, o.payment_method
        FROM orders o
        JOIN order_statuses os ON o.status_id = os.status_id
        WHERE o.order_id = p_order_id;
        
        -- Détails des produits dans la commande
        SELECT oi.order_item_id, p.product_id, p.name AS product_name, 
               oi.quantity, oi.price AS unit_price, 
               (oi.quantity * oi.price) AS subtotal,
               p.image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        WHERE oi.order_id = p_order_id;
        
        -- Calcul du total (redondant avec total_amount, mais bon pour la vérification)
        SELECT SUM(oi.quantity * oi.price) AS calculated_total
        FROM order_items oi
        WHERE oi.order_id = p_order_id;
    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Accès non autorisé à cette commande';
    END IF;
END //

DELIMITER ;