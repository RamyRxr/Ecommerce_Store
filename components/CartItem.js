export default class CartItem2 {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.cartItems = [];
        this.deletedItems = {}; // Track deleted items for undo functionality
        this.deleteTimers = {}; // Track deletion timers
        this.progressIntervals = {}; // Track progress bar intervals
        this.createNotificationContainer();
        this.init();
    }

    async init() {
        await this.loadCartItems();
        this.render();
        this.setupEventListeners();
    }

    async loadCartItems() {
        try {
            const response = await fetch('../backend/api/cart/get_cart.php');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            if (data.success) {
                // Format cart items with proper image paths
                this.cartItems = data.data.map(item => ({
                    ...item,
                    image: item.images[0] 
                        ? `${item.images[0].includes('uploads/') 
                            ? '../' + item.images[0] 
                            : '../backend/uploads/products/' + item.images[0]}`
                        : '/Project-Web/assets/images/products-images/placeholder.svg',
                    images: item.images.map(img =>
                        `${img.includes('uploads/') 
                            ? '../' + img 
                            : '../backend/uploads/products/' + img}`
                    )
                }));
            } else {
                throw new Error(data.message || 'Failed to load cart items');
            }
        } catch (error) {
            console.error('Error loading cart items:', error);
            this.cartItems = [];
            // Optionally show error to user
            this.showErrorMessage(error.message);
        }
   }

    // Add this helper method
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class='bx bx-error-circle'></i>
            <span>${message}</span>
        `;
        
        // Remove any existing error message
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add the new error message
        const cartHeader = document.querySelector('.cart-header');
        if (cartHeader) {
            cartHeader.after(errorDiv);
        }
    }

    calculateTotals() {
        let subtotal = 0;
        let itemCount = 0;

        this.cartItems.forEach(item => {
            subtotal += item.price * item.quantity;
            itemCount += item.quantity;
        });

        return {
            subtotal: subtotal.toFixed(2),
            itemCount
        };
    }

    render() {
        const { subtotal, itemCount } = this.calculateTotals();

        const cartHTML = `
            <div class="cart-content-v2">
                <div class="cart-main-container">
                    <div class="cart-header">
                        <h1>Your Cart</h1>
                        <p>${itemCount} item${itemCount !== 1 ? 's' : ''} added</p>
                    </div>
                    
                    <div class="cart-items-list">
                        <div class="notification-container">
                            <!-- Deleted item notifications will be displayed here -->
                        </div>
                        
                        ${this.cartItems.length > 0 ? '' : `
                            <div class="empty-cart">
                                <div class="empty-cart-icon">
                                    <i class='bx bx-cart-alt'></i>
                                </div>
                                <h3>Your Cart is Empty</h3>
                                <p>Looks like you haven't added anything to your cart yet.</p>
                                <a href="ExplorePage.html" class="continue-shopping-btn">
                                    <i class='bx bx-shopping-bag'></i>
                                    Continue Shopping
                                </a>
                            </div>
                        `}
                        <!-- Cart item rows will be inserted here -->
                    </div>
                    
                    ${this.cartItems.length > 0 ? `
                        <div class="cart-footer">
                            <div class="cart-actions">
                                <a href="ExplorePage.html" class="continue-shopping-btn">
                                    <i class='bx bx-left-arrow-alt'></i>
                                    Continue Shopping
                                </a>
                                <button class="checkout-btn" id="proceed-btn" ${this.cartItems.length === 0 ? 'disabled' : ''}>
                                    <i class='bx bx-credit-card'></i>
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        const cartContainer = document.createElement('div');
        cartContainer.innerHTML = cartHTML;

        // Check if cart content already exists
        const existingCartContent = document.querySelector('.cart-content-v2');
        if (existingCartContent) {
            existingCartContent.replaceWith(cartContainer.firstElementChild);
        } else {
            this.container.appendChild(cartContainer.firstElementChild);
        }

        this.updateCartItemsList();
    }

    updateCartItemsList() {
        const cartItemsList = document.querySelector('.cart-items-list');
        if (!cartItemsList) return;

        // If there are no cart items, show the empty cart message (already handled in render)
        if (this.cartItems.length === 0) {
            return;
        }

        // Keep the notification container but clear other content
        const notificationContainer = cartItemsList.querySelector('.notification-container');
        cartItemsList.innerHTML = '';
        if (notificationContainer) {
            cartItemsList.appendChild(notificationContainer);
        } else {
            const newNotificationContainer = document.createElement('div');
            newNotificationContainer.className = 'notification-container';
            cartItemsList.appendChild(newNotificationContainer);
        }

        // Add each item to the list
        this.cartItems.forEach(item => {
            const itemRow = document.createElement('div');
            itemRow.className = 'cart-item';
            itemRow.dataset.id = item.id;

            itemRow.innerHTML = `
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="item-details">
                    <h3 class="item-name">${item.name}</h3>
                    <div class="quantity-controls">
                        <button class="qty-btn decrease-qty" ${item.quantity <= 1 ? 'disabled' : ''}>
                            <i class='bx bx-minus'></i>
                        </button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="qty-btn increase-qty">
                            <i class='bx bx-plus'></i>
                        </button>
                    </div>
                </div>
                <div class="item-price-actions">
                    <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="remove-btn">
                        <i class='bx bx-trash'></i>
                    </button>
                </div>
            `;

            cartItemsList.appendChild(itemRow);
        });
    }

    setupEventListeners() {
        // Quantity change buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.increase-qty') || e.target.closest('.decrease-qty')) {
                const itemRow = e.target.closest('.cart-item');
                if (!itemRow) return;

                const itemId = parseInt(itemRow.dataset.id);
                const change = e.target.closest('.increase-qty') ? 1 : -1;

                this.updateItemQuantity(itemId, change);
            }
        });

        // Remove item button
        document.addEventListener('click', (e) => {
            if (e.target.closest('.remove-btn')) {
                const itemRow = e.target.closest('.cart-item');
                if (!itemRow) return;

                const itemId = parseInt(itemRow.dataset.id);
                this.removeItem(itemId);
            }
        });

        // Undo button in notification
        document.addEventListener('click', (e) => {
            if (e.target.closest('.undo-btn')) {
                const itemId = parseInt(e.target.closest('.undo-btn').dataset.id);
                this.undoRemove(itemId);
            }
        });

        // Close notification button
        document.addEventListener('click', (e) => {
            if (e.target.closest('.close-notification-btn')) {
                const notification = e.target.closest('.notification');
                if (notification) {
                    const itemId = parseInt(notification.dataset.id);
                    // Clear the delete timer when manually closed
                    if (this.deleteTimers[itemId]) {
                        clearTimeout(this.deleteTimers[itemId]);
                        this.permanentlyDeleteItem(itemId);
                    }
                    this.removeNotification(itemId);
                }
            }
        });

        // Proceed to checkout button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#proceed-btn')) {
                if (this.cartItems.length > 0) {
                    // Dispatch event to show checkout summary
                    document.dispatchEvent(new CustomEvent('showCheckoutSummary', {
                        detail: {
                            items: this.cartItems
                        }
                    }));
                }
            }
        });
    }

    // Update updateItemQuantity method
    async updateItemQuantity(itemId, change) {
        try {
            const response = await fetch('../backend/api/cart/update_quantity.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    item_id: itemId,
                    quantity_change: change
                })
            });

            if (!response.ok) throw new Error('Failed to update quantity');
            
            const data = await response.json();
            if (data.success) {
                await this.loadCartItems();
                this.render();
                document.dispatchEvent(new CustomEvent('updateCartBadge'));
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            this.showErrorMessage('Failed to update quantity');
        }
    }

    // Update removeItem method
    async removeItem(itemId) {
        try {
            const response = await fetch('../backend/api/cart/remove_item.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    item_id: itemId
                })
            });

            if (!response.ok) throw new Error('Failed to remove item');

            const data = await response.json();
            if (data.success) {
                await this.loadCartItems();
                this.render();
                document.dispatchEvent(new CustomEvent('updateCartBadge'));
            }
        } catch (error) {
            console.error('Error removing item:', error);
            this.showErrorMessage('Failed to remove item');
        }
    }

    undoRemove(itemId) {
        // Check if the item exists in deletedItems
        if (!this.deletedItems[itemId]) return;

        // Clear the delete timer
        if (this.deleteTimers[itemId]) {
            clearTimeout(this.deleteTimers[itemId]);
            delete this.deleteTimers[itemId];
        }

        // Clear the progress interval if it exists
        if (this.progressIntervals[itemId]) {
            clearInterval(this.progressIntervals[itemId]);
            delete this.progressIntervals[itemId];
        }

        // Get the deleted item info
        const { item, index } = this.deletedItems[itemId];

        // Re-insert the item at the original position if possible, or at the beginning
        if (index < this.cartItems.length) {
            this.cartItems.splice(index, 0, item);
        } else {
            this.cartItems.push(item);
        }

        // Remove from deletedItems
        delete this.deletedItems[itemId];

        // Update localStorage
        localStorage.setItem('cartItems', JSON.stringify(this.cartItems));

        // Dispatch event to update cart badge
        document.dispatchEvent(new CustomEvent('updateCartBadge'));

        // Remove the notification
        this.removeNotification(itemId);

        // Update the UI
        this.render();
    }

    permanentlyDeleteItem(itemId) {
        // Clear the progress interval if it exists
        if (this.progressIntervals[itemId]) {
            clearInterval(this.progressIntervals[itemId]);
            delete this.progressIntervals[itemId];
        }

        // Remove from deletedItems
        delete this.deletedItems[itemId];
        delete this.deleteTimers[itemId];

        // Remove the notification
        this.removeNotification(itemId);
    }

    showNotification(itemId) {
        const notificationContainer = document.querySelector('.global-notification-container');
        if (!notificationContainer) {
            console.error('Notification container not found');
            return;
        }

        const item = this.deletedItems[itemId].item;
        const notification = document.createElement('div');
        notification.className = 'notification fade-in';
        notification.dataset.id = itemId;

        // Calculate time remaining
        const secondsRemaining = 5; // Changed from 10 to 5

        notification.innerHTML = `
            <div class="notification-content">
                <i class='bx bx-check-circle notification-icon'></i>
                <div class="notification-text">
                    <p>"${item.name}" removed from cart</p>
                    <button class="undo-btn" data-id="${itemId}">Undo</button>
                    <span class="notification-time">${secondsRemaining}s</span>
                </div>
                <button class="close-notification-btn">
                    <i class='bx bx-x'></i>
                </button>
            </div>
            <div class="notification-progress"></div>
        `;

        notificationContainer.appendChild(notification);

        // Initialize timer display and progress bar
        const timeDisplay = notification.querySelector('.notification-time');
        const progressBar = notification.querySelector('.notification-progress');

        if (progressBar) {
            // Use CSS transition for smooth progress bar animation
            progressBar.style.transition = 'width 5s linear'; // Changed from 10s to 5s

            // Force a reflow before changing the width to ensure the transition works
            void progressBar.offsetWidth;

            // Start with full width
            progressBar.style.width = '100%';

            // After a tiny delay, set width to 0 to start the animation
            setTimeout(() => {
                progressBar.style.width = '0%';
            }, 50);
        }

        // Create a countdown timer that updates every second
        let timeLeft = secondsRemaining;

        this.progressIntervals[itemId] = setInterval(() => {
            timeLeft--;

            if (timeDisplay) {
                timeDisplay.textContent = `${timeLeft}s`;
            }

            if (timeLeft <= 0) {
                clearInterval(this.progressIntervals[itemId]);
                delete this.progressIntervals[itemId];
            }
        }, 1000);

        // Add event listeners for this specific notification
        notification.querySelector('.close-notification-btn').addEventListener('click', () => {
            if (this.deleteTimers[itemId]) {
                clearTimeout(this.deleteTimers[itemId]);
            }
            if (this.progressIntervals[itemId]) {
                clearInterval(this.progressIntervals[itemId]);
                delete this.progressIntervals[itemId];
            }
            this.permanentlyDeleteItem(itemId);
            this.removeNotification(itemId);
        });

        notification.querySelector('.undo-btn').addEventListener('click', () => {
            this.undoRemove(itemId);
        });
    }

    removeNotification(itemId) {
        const notification = document.querySelector(`.notification[data-id="${itemId}"]`);
        if (notification) {
            notification.classList.remove('fade-in');
            notification.classList.add('fade-out');

            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }

    createNotificationContainer() {
        // Remove any existing notification container
        const existingContainer = document.querySelector('.global-notification-container');
        if (existingContainer) return;
        
        // Create a new container appended to body
        const container = document.createElement('div');
        container.className = 'notification-container global-notification-container';
        document.body.appendChild(container);
    }

    async addToCart(product) {
        try {
            const response = await fetch('../backend/api/cart/add_to_cart.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productId: product.id,
                    quantity: 1
                })
            });

            const data = await response.json();
            
            if (data.success) {
                await this.loadCartItems();
                this.render();
                this.showAddedToCartConfirmation(product.id);
                document.dispatchEvent(new CustomEvent('updateCartBadge'));
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    }
}