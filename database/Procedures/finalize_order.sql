DELIMITER //

CREATE PROCEDURE finalize_order(
    IN p_user_id INT,
    IN p_shipping_address TEXT,
    IN p_shipping_city VARCHAR(50),
    IN p_shipping_postal_code VARCHAR(20),
    IN p_shipping_country VARCHAR(50),
    IN p_payment_method VARCHAR(50),
    OUT p_order_id INT,
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE total DECIMAL(10, 2) DEFAULT 0;
    DECLARE pending_status_id INT;
    
    -- Démarrer une transaction
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_success = FALSE;
        SET p_message = 'Une erreur est survenue lors de la création de la commande';
    END;
    
    START TRANSACTION;
    
    -- Vérifier si le panier n'est pas vide
    SELECT COUNT(*) INTO @cart_count FROM cart_items WHERE user_id = p_user_id;
    IF @cart_count = 0 THEN
        SET p_success = FALSE;
        SET p_message = 'Le panier est vide';
        ROLLBACK;
    ELSE
        -- Récupérer l'ID du statut "En attente"
        SELECT status_id INTO pending_status_id FROM order_statuses WHERE name = 'En attente' LIMIT 1;
        
        -- Calculer le montant total
        SELECT SUM(c.quantity * p.price) INTO total
        FROM cart_items c
        JOIN products p ON c.product_id = p.product_id
        WHERE c.user_id = p_user_id;
        
        -- Créer la commande
        INSERT INTO orders (
            user_id, status_id, total_amount, 
            shipping_address, shipping_city, shipping_postal_code, 
            shipping_country, payment_method
        ) VALUES (
            p_user_id, pending_status_id, total,
            p_shipping_address, p_shipping_city, p_shipping_postal_code,
            p_shipping_country, p_payment_method
        );
        
        SET p_order_id = LAST_INSERT_ID();
        
        -- Transférer les articles du panier vers la commande
        INSERT INTO order_items (order_id, product_id, quantity, price)
        SELECT p_order_id, p.product_id, c.quantity, p.price
        FROM cart_items c
        JOIN products p ON c.product_id = p.product_id
        WHERE c.user_id = p_user_id;
        
        -- Vider le panier
        DELETE FROM cart_items WHERE user_id = p_user_id;
        
        -- La mise à jour du stock sera gérée par un trigger
        
        COMMIT;
        
        SET p_success = TRUE;
        SET p_message = CONCAT('Commande #', p_order_id, ' créée avec succès');
    END IF;
END //

DELIMITER ;