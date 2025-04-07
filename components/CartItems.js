export default class CartItems {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.cartItems = [];
        this.deletedItems = {}; // Track deleted items for undo functionality
        this.deleteTimers = {}; // Track deletion timers
        this.init();
    }

    async init() {
        await this.loadCartItems();
        this.render();
        this.setupEventListeners();
    }

    async loadCartItems() {
        try {
            // Get cart items from localStorage
            const cartItemsJson = localStorage.getItem('cartItems');

            if (cartItemsJson) {
                this.cartItems = JSON.parse(cartItemsJson);
            } else {
                // Demo data if no cart items exist
                const demoCartItems = [
                    {
                        id: 1,
                        name: "Sony WH-1000XM5",
                        description: "Premium noise-cancelling headphones with industry-leading sound quality and battery life.",
                        price: 349.99,
                        quantity: 1,
                        color: "Black",
                        image: "../assets/images/products-images/product-1.svg",
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: 2,
                        name: "iPhone 15 Pro",
                        description: "Apple's latest flagship smartphone with A17 Pro chip, titanium design and 48MP camera.",
                        price: 999.99,
                        quantity: 1,
                        color: "Titanium Gray",
                        image: "../assets/images/products-images/product-2.svg",
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: 5,
                        name: "Sony Alpha A7 IV",
                        description: "Full-frame mirrorless camera with 33MP sensor, 4K60p video and advanced autofocus.",
                        price: 2499.99,
                        quantity: 1,
                        color: "Black",
                        image: "../assets/images/products-images/product-5.svg",
                        dateAdded: new Date().toISOString()
                    }
                ];

                this.cartItems = demoCartItems;
                localStorage.setItem('cartItems', JSON.stringify(demoCartItems));
            }
        } catch (error) {
            console.error('Error loading cart items:', error);
            this.cartItems = [];
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
            <div class="cart-content">
                <div class="cart-items-container">
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
                    
                    <div class="cart-footer">
                        <a href="ExplorePage.html" class="continue-shopping-btn">
                            <i class='bx bx-left-arrow-alt'></i>
                            Continue Shopping
                        </a>
                    </div>
                </div>
            </div>
        `;

        const cartContainer = document.createElement('div');
        cartContainer.innerHTML = cartHTML;

        // Check if cart content already exists
        const existingCartContent = document.querySelector('.cart-content');
        if (existingCartContent) {
            existingCartContent.replaceWith(cartContainer.firstElementChild);
        } else {
            this.container.appendChild(cartContainer.firstElementChild);
        }

        this.updateCartItemsList();

        // Trigger a custom event to notify the order summary to update
        document.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: {
                items: this.cartItems,
                totals: this.calculateTotals()
            }
        }));
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
                    <p class="item-color">${item.color}</p>
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
                        Remove
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
    }

    updateItemQuantity(itemId, change) {
        const itemIndex = this.cartItems.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return;

        // Update quantity but ensure it doesn't go below 1
        const newQuantity = this.cartItems[itemIndex].quantity + change;
        if (newQuantity < 1) return;

        this.cartItems[itemIndex].quantity = newQuantity;
        
        // Update localStorage
        localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
        
        // Dispatch event to update cart badge
        document.dispatchEvent(new CustomEvent('updateCartBadge'));
        
        // Update the UI
        this.updateCartItemsList();
        
        // Notify order summary to update
        document.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: {
                items: this.cartItems,
                totals: this.calculateTotals()
            }
        }));
    }

    removeItem(itemId) {
        // Find the item in the cart
        const itemIndex = this.cartItems.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return;

        // Store the item for potential undo
        this.deletedItems[itemId] = {
            item: this.cartItems[itemIndex],
            index: itemIndex
        };

        // Remove the item from the cart
        this.cartItems.splice(itemIndex, 1);

        // Update localStorage
        localStorage.setItem('cartItems', JSON.stringify(this.cartItems));

        // Show notification with undo option
        this.showNotification(itemId);

        // Set a timer to permanently delete after 5 seconds
        if (this.deleteTimers[itemId]) {
            clearTimeout(this.deleteTimers[itemId]);
        }

        this.deleteTimers[itemId] = setTimeout(() => {
            this.permanentlyDeleteItem(itemId);
        }, 5000); // 5 seconds

        // Dispatch event to update cart badge
        document.dispatchEvent(new CustomEvent('updateCartBadge'));

        // Update the UI
        this.render();
    }

    undoRemove(itemId) {
        // Check if the item exists in deletedItems
        if (!this.deletedItems[itemId]) return;

        // Clear the delete timer
        if (this.deleteTimers[itemId]) {
            clearTimeout(this.deleteTimers[itemId]);
            delete this.deleteTimers[itemId];
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
        // Remove from deletedItems
        delete this.deletedItems[itemId];
        delete this.deleteTimers[itemId];

        // Remove the notification
        this.removeNotification(itemId);
    }

    showNotification(itemId) {
        const notificationContainer = document.querySelector('.notification-container');
        if (!notificationContainer) return;

        const item = this.deletedItems[itemId].item;
        const notification = document.createElement('div');
        notification.className = 'notification fade-in';
        notification.dataset.id = itemId;

        notification.innerHTML = `
            <div class="notification-content">
                <i class='bx bx-check-circle notification-icon'></i>
                <div class="notification-text">
                    <p>"${item.name}" removed from cart</p>
                    <button class="undo-btn" data-id="${itemId}">Undo</button>
                </div>
                <button class="close-notification-btn">
                    <i class='bx bx-x'></i>
                </button>
            </div>
            <div class="notification-progress"></div>
        `;

        notificationContainer.appendChild(notification);

        // Start the progress bar animation
        setTimeout(() => {
            const progressBar = notification.querySelector('.notification-progress');
            if (progressBar) {
                progressBar.style.width = '0%';
            }
        }, 50);

        // Make notification temporarily pause progress on hover
        notification.addEventListener('mouseenter', () => {
            if (this.deleteTimers[itemId]) {
                clearTimeout(this.deleteTimers[itemId]);
                const progressBar = notification.querySelector('.notification-progress');
                if (progressBar) {
                    progressBar.style.transition = 'none';
                }
            }
        });

        notification.addEventListener('mouseleave', () => {
            if (this.deletedItems[itemId]) {
                const progressBar = notification.querySelector('.notification-progress');
                if (progressBar) {
                    progressBar.style.transition = 'width 5s linear';
                    progressBar.style.width = '0%';
                }
                
                this.deleteTimers[itemId] = setTimeout(() => {
                    this.permanentlyDeleteItem(itemId);
                }, 5000);
            }
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
}