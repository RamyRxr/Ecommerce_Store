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
            // In a real app, this would fetch from a backend API
            // For demonstration, we'll check localStorage first
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
                    
                    <div class="notification-container">
                        <!-- Deleted item notifications will be displayed here -->
                    </div>
                    
                    <div class="cart-items-list">
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

        // Clear existing items
        cartItemsList.innerHTML = '';

        // Add each item to the list with staggered animation
        this.cartItems.forEach((item, index) => {
            const itemRow = document.createElement('div');
            itemRow.className = 'cart-item';
            itemRow.dataset.id = item.id;
            itemRow.style.animationDelay = `${index * 0.1}s`;

            itemRow.innerHTML = `
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-badge">${item.color}</div>
                </div>
                <div class="item-details">
                    <div class="item-info">
                        <h3 class="item-name">${item.name}</h3>
                        <p class="item-color">Color: ${item.color}</p>
                    </div>
                    <div class="item-controls">
                        <div class="quantity-controls">
                            <button class="qty-btn minus-btn" ${item.quantity <= 1 ? 'disabled' : ''}>
                                <i class='bx bx-minus'></i>
                            </button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="qty-btn plus-btn">
                                <i class='bx bx-plus'></i>
                            </button>
                        </div>
                        <div class="item-price-actions">
                            <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                            <button class="remove-btn" data-id="${item.id}">
                                <i class='bx bx-trash'></i>
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
                <div class="delete-timer-container" id="delete-timer-${item.id}"></div>
            `;

            cartItemsList.appendChild(itemRow);
        });
    }

    setupEventListeners() {
        // Quantity control buttons
        document.addEventListener('click', (e) => {
            // Plus button
            if (e.target.closest('.plus-btn')) {
                const itemRow = e.target.closest('.cart-item');
                const itemId = parseInt(itemRow.dataset.id);
                this.updateItemQuantity(itemId, 1);
            }
            
            // Minus button
            if (e.target.closest('.minus-btn')) {
                const itemRow = e.target.closest('.cart-item');
                const itemId = parseInt(itemRow.dataset.id);
                this.updateItemQuantity(itemId, -1);
            }
            
            // Remove button
            if (e.target.closest('.remove-btn')) {
                const itemId = parseInt(e.target.closest('.remove-btn').dataset.id);
                this.initItemRemoval(itemId);
            }
        });

        // Undo button event
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('undo-delete-btn')) {
                const itemId = parseInt(e.target.dataset.id);
                this.undoRemove(itemId);
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
        
        // Add visual feedback with a flash effect
        const priceElement = document.querySelector(`.cart-item[data-id="${itemId}"] .item-price`);
        if (priceElement) {
            priceElement.classList.add('price-updated');
            setTimeout(() => {
                priceElement.classList.remove('price-updated');
            }, 500);
        }
        
        // Update localStorage
        localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
        
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

    initItemRemoval(itemId) {
        // Find the cart item element
        const cartItem = document.querySelector(`.cart-item[data-id="${itemId}"]`);
        if (!cartItem) return;

        // Find the delete timer container
        const timerContainer = document.getElementById(`delete-timer-${itemId}`);
        if (!timerContainer) return;

        // Add deleting class to cart item
        cartItem.classList.add('deleting');

        // Create and show the delete timer UI with improved styling
        let secondsLeft = 5;
        timerContainer.innerHTML = `
            <div class="delete-timer">
                <div class="timer-progress">
                    <div class="timer-bar"></div>
                </div>
                <div class="timer-content">
                    <span class="timer-text">Removing in <span class="seconds-left">${secondsLeft}</span>s</span>
                    <button class="undo-delete-btn" data-id="${itemId}">UNDO</button>
                </div>
            </div>
        `;

        // Make the timer visible with smooth animation
        timerContainer.style.height = `${timerContainer.scrollHeight}px`;

        // Start the timer bar animation
        const timerBar = timerContainer.querySelector('.timer-bar');
        if (timerBar) {
            timerBar.style.width = '100%';
            setTimeout(() => {
                timerBar.style.width = '0%';
                timerBar.style.transition = 'width 5s linear';
            }, 50);
        }

        // Start the countdown timer
        const secondsLeftElement = timerContainer.querySelector('.seconds-left');
        
        // Clear existing timer if any
        if (this.deleteTimers[itemId]) {
            clearInterval(this.deleteTimers[itemId].intervalId);
            clearTimeout(this.deleteTimers[itemId].timeoutId);
        }
        
        // Set up the countdown interval
        const intervalId = setInterval(() => {
            secondsLeft--;
            if (secondsLeftElement) {
                secondsLeftElement.textContent = secondsLeft;
                
                // Add pulse animation when time is running low
                if (secondsLeft <= 2) {
                    secondsLeftElement.classList.add('pulse-animation');
                }
            }
            
            if (secondsLeft <= 0) {
                clearInterval(intervalId);
            }
        }, 1000);
        
        // Set up the final deletion timeout
        const timeoutId = setTimeout(() => {
            this.removeItem(itemId);
            clearInterval(intervalId);
        }, 5000);
        
        // Store the timer IDs for potential cancellation
        this.deleteTimers[itemId] = {
            intervalId,
            timeoutId,
            itemId
        };
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

        // Clean up the timer references
        if (this.deleteTimers[itemId]) {
            clearInterval(this.deleteTimers[itemId].intervalId);
            clearTimeout(this.deleteTimers[itemId].timeoutId);
            delete this.deleteTimers[itemId];
        }

        // Set a timer to permanently delete after 5 seconds
        this.deleteTimers[itemId] = {
            timeoutId: setTimeout(() => {
                this.permanentlyDeleteItem(itemId);
            }, 5000)
        };

        // Update the UI
        this.render();
    }

    undoRemove(itemId) {
        // Check if we're undoing from the delete timer
        const deleteTimerContainer = document.getElementById(`delete-timer-${itemId}`);
        if (deleteTimerContainer) {
            // We're undoing before the item has been removed from the cart
            if (this.deleteTimers[itemId]) {
                clearInterval(this.deleteTimers[itemId].intervalId);
                clearTimeout(this.deleteTimers[itemId].timeoutId);
                delete this.deleteTimers[itemId];
            }

            // Reset the cart item appearance with smooth animation
            const cartItem = document.querySelector(`.cart-item[data-id="${itemId}"]`);
            if (cartItem) {
                // Add recovered class for animation
                cartItem.classList.add('recovering');
                
                setTimeout(() => {
                    cartItem.classList.remove('deleting');
                    
                    // Reset the timer container
                    deleteTimerContainer.style.height = '0';
                    setTimeout(() => {
                        deleteTimerContainer.innerHTML = '';
                        cartItem.classList.remove('recovering');
                    }, 300);
                }, 300);
            }
            return;
        }

        // Otherwise, we're undoing from the notification after removal
        // Check if the item exists in deletedItems
        if (!this.deletedItems[itemId]) return;

        // Clear the delete timer
        if (this.deleteTimers[itemId]) {
            clearTimeout(this.deleteTimers[itemId].timeoutId);
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

        // Remove the notification
        this.removeNotification(itemId);

        // Update the UI
        this.render();
        
        // Highlight the recovered item
        setTimeout(() => {
            const recoveredItem = document.querySelector(`.cart-item[data-id="${itemId}"]`);
            if (recoveredItem) {
                recoveredItem.classList.add('item-recovered');
                setTimeout(() => {
                    recoveredItem.classList.remove('item-recovered');
                }, 1500);
            }
        }, 100);
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

        // Add close button functionality
        const closeBtn = notification.querySelector('.close-notification-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.removeNotification(itemId);
            });
        }

        // Add undo button functionality
        const undoBtn = notification.querySelector('.undo-btn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                this.undoRemove(itemId);
            });
        }
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