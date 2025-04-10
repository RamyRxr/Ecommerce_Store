export default class PurchaseHistory {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.activeTab = 'all'; // Default tab
        this.orders = [];
        this.init();
    }

    async init() {
        await this.loadOrders();
        this.render();
        this.setupEventListeners();
    }

    async loadOrders() {
        try {
            // Load orders from localStorage
            const savedOrders = localStorage.getItem('userOrders');
            
            if (savedOrders) {
                this.orders = JSON.parse(savedOrders);
            } else {
                // Demo data if no orders exist
                this.orders = [
                    {
                        id: "ORD-2307-1234",
                        date: "2023-07-15T10:30:00",
                        status: "delivered",
                        totalAmount: 1299.98,
                        estimatedDelivery: "2023-07-20",
                        actualDelivery: "2023-07-19",
                        shippingAddress: {
                            street: "123 Tech Ave",
                            city: "San Francisco",
                            state: "CA",
                            zip: "94107",
                            country: "United States"
                        },
                        paymentMethod: "Credit Card (ending in 4321)",
                        items: [
                            {
                                id: 1,
                                name: "MacBook Air M2",
                                image: "../assets/images/products-images/product-3.svg",
                                price: 1099.99,
                                quantity: 1,
                                total: 1099.99
                            },
                            {
                                id: 2,
                                name: "Wireless Earbuds Pro",
                                image: "../assets/images/products-images/product-4.svg",
                                price: 99.99,
                                quantity: 2,
                                total: 199.98
                            }
                        ],
                        rated: true
                    },
                    {
                        id: "ORD-2310-5678",
                        date: "2023-10-05T14:45:00",
                        status: "shipped",
                        totalAmount: 549.99,
                        estimatedDelivery: "2023-10-12",
                        shippingAddress: {
                            street: "456 Gadget St",
                            city: "New York",
                            state: "NY",
                            zip: "10001",
                            country: "United States"
                        },
                        paymentMethod: "PayPal",
                        items: [
                            {
                                id: 3,
                                name: "Smartphone X Pro",
                                image: "../assets/images/products-images/product-2.svg",
                                price: 549.99,
                                quantity: 1,
                                total: 549.99
                            }
                        ]
                    },
                    {
                        id: "ORD-2311-9012",
                        date: "2023-11-20T09:15:00",
                        status: "processing",
                        totalAmount: 129.99,
                        estimatedDelivery: "2023-11-27",
                        shippingAddress: {
                            street: "789 Electronics Blvd",
                            city: "Chicago",
                            state: "IL",
                            zip: "60601",
                            country: "United States"
                        },
                        paymentMethod: "Credit Card (ending in 8765)",
                        items: [
                            {
                                id: 4,
                                name: "Wireless Headphones",
                                image: "../assets/images/products-images/product-1.svg",
                                price: 129.99,
                                quantity: 1,
                                total: 129.99
                            }
                        ]
                    },
                    {
                        id: "ORD-2312-3456",
                        date: "2023-12-10T16:20:00",
                        status: "cancelled",
                        totalAmount: 899.97,
                        cancellationReason: "Changed mind",
                        cancellationDate: "2023-12-11T10:15:00",
                        shippingAddress: {
                            street: "101 Tech Park",
                            city: "Seattle",
                            state: "WA",
                            zip: "98101",
                            country: "United States"
                        },
                        paymentMethod: "Credit Card (ending in 2345)",
                        items: [
                            {
                                id: 5,
                                name: "Gaming Console Pro",
                                image: "../assets/images/products-images/product-5.svg",
                                price: 499.99,
                                quantity: 1,
                                total: 499.99
                            },
                            {
                                id: 6,
                                name: "Controller",
                                image: "../assets/images/products-images/product-6.svg",
                                price: 79.99,
                                quantity: 5,
                                total: 399.95
                            }
                        ]
                    }
                ];
                localStorage.setItem('userOrders', JSON.stringify(this.orders));
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            this.orders = [];
        }
    }

    render() {
        const historyContentHTML = `
            <div class="purchase-history-content">
                <div class="main-content-container">
                    <div class="purchase-header">
                            <h1>Recent Orders</h1>
                            <p>${this.orders.length} orders placed</p>
                    </div>
                    
                    <div class="purchase-tabs">
                        <button class="tab-button ${this.activeTab === 'all' ? 'active' : ''}" data-tab="all">
                            <i class='bx bx-package'></i>
                            All Orders
                        </button>
                        <button class="tab-button ${this.activeTab === 'processing' ? 'active' : ''}" data-tab="processing">
                            <i class='bx bx-loader-circle'></i>
                            Processing
                        </button>
                        <button class="tab-button ${this.activeTab === 'shipped' ? 'active' : ''}" data-tab="shipped">
                            <i class='bx bx-car'></i>
                            Shipped
                        </button>
                        <button class="tab-button ${this.activeTab === 'delivered' ? 'active' : ''}" data-tab="delivered">
                            <i class='bx bx-check-circle'></i>
                            Delivered
                        </button>
                        <button class="tab-button ${this.activeTab === 'cancelled' ? 'active' : ''}" data-tab="cancelled">
                            <i class='bx bx-x-circle'></i>
                            Cancelled
                        </button>
                    </div>
                    
                    <div class="purchase-content-body">
                        ${this.renderTabContent()}
                    </div>
                </div>
            </div>
        `;

        const historyContentContainer = document.createElement('div');
        historyContentContainer.innerHTML = historyContentHTML;

        // Check if purchase history content already exists
        const existingHistoryContent = document.querySelector('.purchase-history-content');
        if (existingHistoryContent) {
            existingHistoryContent.replaceWith(historyContentContainer.firstElementChild);
        } else {
            this.container.appendChild(historyContentContainer.firstElementChild);
        }
    }

    renderTabContent() {
        const filteredOrders = this.activeTab === 'all' 
            ? this.orders 
            : this.orders.filter(order => order.status === this.activeTab);

        if (filteredOrders.length === 0) {
            return this.renderEmptyState();
        }

        return `
            <div class="orders-container">
                ${filteredOrders.map(order => this.renderOrder(order)).join('')}
            </div>
        `;
    }

    renderEmptyState() {
        let message = '';
        let icon = '';
        
        switch (this.activeTab) {
            case 'processing':
                message = "No orders currently being processed";
                icon = 'bx-loader-circle';
                break;
            case 'shipped':
                message = "No orders currently shipped";
                icon = 'bx-car';
                break;
            case 'delivered':
                message = "No orders have been delivered yet";
                icon = 'bx-check-circle';
                break;
            case 'cancelled':
                message = "No cancelled orders";
                icon = 'bx-x-circle';
                break;
            default:
                message = "You haven't placed any orders yet";
                icon = 'bx-package';
        }
        
        return `
            <div class="no-orders">
                <div class="no-orders-icon">
                    <i class='bx ${icon}'></i>
                </div>
                <h3>${message}</h3>
                <p>Orders you place will appear here.</p>
                <a href="../HTML-Pages/ExplorePage.html" class="browse-products-btn">
                    <i class='bx bx-shopping-bag'></i>
                    Browse Products
                </a>
            </div>
        `;
    }

    renderOrder(order) {
        // Format the date
        const orderDate = new Date(order.date);
        const formattedDate = orderDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Get status display info
        const statusInfo = this.getStatusInfo(order.status);
        
        // Show only first 3 items in the preview
        const visibleItems = order.items.slice(0, 3);
        const hiddenItemCount = Math.max(0, order.items.length - 3);

        // Determine the bottom action based on status
        let bottomAction = '';
        
        switch (order.status) {
            case 'delivered':
                bottomAction = order.rated 
                    ? `<button class="rated-btn" disabled><i class='bx bxs-star'></i> Rated</button>`
                    : `<button class="rate-order-btn" data-id="${order.id}"><i class='bx bx-star'></i> Rate Order</button>`;
                break;
            case 'shipped':
                const estimatedDate = new Date(order.estimatedDelivery);
                const formattedEstimatedDate = estimatedDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });
                bottomAction = `
                    <div class="delivery-estimate">
                        <i class='bx bx-truck'></i>
                        <span>Estimated delivery: ${formattedEstimatedDate}</span>
                    </div>
                `;
                break;
            case 'processing':
                bottomAction = `
                    <button class="cancel-order-btn" data-id="${order.id}">
                        <i class='bx bx-x'></i> Cancel Order
                    </button>
                `;
                break;
            case 'cancelled':
                const cancellationDate = new Date(order.cancellationDate);
                const formattedCancellationDate = cancellationDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });
                bottomAction = `
                    <div class="cancellation-info">
                        <i class='bx bx-info-circle'></i>
                        <span>Cancelled on ${formattedCancellationDate}${order.cancellationReason ? ': ' + order.cancellationReason : ''}</span>
                    </div>
                `;
                break;
        }
        
        return `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-info">
                        <h3 class="order-id">${order.id}</h3>
                        <p class="order-date">Ordered on ${formattedDate}</p>
                    </div>
                    <div class="order-status ${order.status}">
                        <i class='bx ${statusInfo.icon}'></i>
                        <span>${statusInfo.label}</span>
                    </div>
                </div>
                
                <div class="order-items">
                    ${visibleItems.map(item => `
                        <div class="order-item">
                            <div class="item-image">
                                <img src="${item.image}" alt="${item.name}">
                            </div>
                            <div class="item-details">
                                <div class="item-name">${item.name}</div>
                                <div class="item-quantity">Qty: ${item.quantity}</div>
                            </div>
                            <div class="item-price">$${item.total.toFixed(2)}</div>
                        </div>
                    `).join('')}
                    ${hiddenItemCount > 0 ? 
                        `<div class="more-items">+ ${hiddenItemCount} more item${hiddenItemCount > 1 ? 's' : ''}</div>` 
                        : ''}
                </div>
                
                <div class="order-footer">
                    <button class="view-details-btn" data-id="${order.id}">
                        <i class='bx bx-receipt'></i>
                        View Details
                    </button>
                    <div class="order-total">
                        <span>Order Total:</span>
                        <span class="total-amount">$${order.totalAmount.toFixed(2)}</span>
                    </div>
                    <div class="order-action">
                        ${bottomAction}
                    </div>
                </div>
            </div>
        `;
    }

    getStatusInfo(status) {
        switch (status) {
            case 'processing':
                return { label: 'Processing', icon: 'bx-loader-circle' };
            case 'shipped':
                return { label: 'Shipped', icon: 'bx-package' };
            case 'delivered':
                return { label: 'Delivered', icon: 'bx-check-circle' };
            case 'cancelled':
                return { label: 'Cancelled', icon: 'bx-x-circle' };
            default:
                return { label: status, icon: 'bx-question-mark' };
        }
    }

    setupEventListeners() {
        // Tab switching
        document.addEventListener('click', e => {
            const tabButton = e.target.closest('.tab-button');
            if (tabButton) {
                this.activeTab = tabButton.dataset.tab;
                this.render();
            }

            // View order details
            if (e.target.closest('.view-details-btn')) {
                const orderId = e.target.closest('.view-details-btn').dataset.id;
                this.viewOrderDetails(orderId);
            }

            // Rate order
            if (e.target.closest('.rate-order-btn')) {
                const orderId = e.target.closest('.rate-order-btn').dataset.id;
                this.rateOrder(orderId);
            }

            // Cancel order
            if (e.target.closest('.cancel-order-btn')) {
                const orderId = e.target.closest('.cancel-order-btn').dataset.id;
                this.cancelOrder(orderId);
            }
        });
    }

    viewOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        // Format dates
        const orderDate = new Date(order.date);
        const formattedDate = orderDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Build the modal HTML with all order details
        const modalHTML = `
            <div class="modal-backdrop">
                <div class="order-details-modal">
                    <div class="modal-header">
                        <h2>Order Details - ${order.id}</h2>
                        <button class="close-modal-btn">
                            <i class='bx bx-x'></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="order-summary-section">
                            <div class="summary-item">
                                <span class="summary-label">Order Date:</span>
                                <span class="summary-value">${formattedDate}</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">Status:</span>
                                <span class="summary-value status-badge ${order.status}">${this.getStatusInfo(order.status).label}</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">Total Amount:</span>
                                <span class="summary-value">$${order.totalAmount.toFixed(2)}</span>
                            </div>
                            ${order.estimatedDelivery ? `
                                <div class="summary-item">
                                    <span class="summary-label">Estimated Delivery:</span>
                                    <span class="summary-value">${new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}</span>
                                </div>
                            ` : ''}
                            ${order.actualDelivery ? `
                                <div class="summary-item">
                                    <span class="summary-label">Delivered On:</span>
                                    <span class="summary-value">${new Date(order.actualDelivery).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}</span>
                                </div>
                            ` : ''}
                            ${order.cancellationDate ? `
                                <div class="summary-item">
                                    <span class="summary-label">Cancelled On:</span>
                                    <span class="summary-value">${new Date(order.cancellationDate).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">Reason:</span>
                                    <span class="summary-value">${order.cancellationReason || "Not specified"}</span>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="address-payment-section">
                            <div class="shipping-address">
                                <h3>Shipping Address</h3>
                                <p>${order.shippingAddress.street}</p>
                                <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}</p>
                                <p>${order.shippingAddress.country}</p>
                            </div>
                            
                            <div class="payment-method">
                                <h3>Payment Method</h3>
                                <p>${order.paymentMethod}</p>
                            </div>
                        </div>
                        
                        <div class="order-items-section">
                            <h3>Items in Your Order</h3>
                            <div class="order-items-table">
                                <div class="order-items-header">
                                    <div class="item-col">Item</div>
                                    <div class="price-col">Price</div>
                                    <div class="qty-col">Qty</div>
                                    <div class="total-col">Total</div>
                                </div>
                                ${order.items.map(item => `
                                    <div class="order-item-row">
                                        <div class="item-col">
                                            <div class="item-image">
                                                <img src="${item.image}" alt="${item.name}">
                                            </div>
                                            <div class="item-name">${item.name}</div>
                                        </div>
                                        <div class="price-col">$${item.price.toFixed(2)}</div>
                                        <div class="qty-col">${item.quantity}</div>
                                        <div class="total-col">$${item.total.toFixed(2)}</div>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="order-totals">
                                <div class="subtotal">
                                    <span>Subtotal:</span>
                                    <span>$${order.totalAmount.toFixed(2)}</span>
                                </div>
                                <div class="shipping">
                                    <span>Shipping:</span>
                                    <span>Free</span>
                                </div>
                                <div class="tax">
                                    <span>Tax:</span>
                                    <span>Included</span>
                                </div>
                                <div class="grand-total">
                                    <span>Grand Total:</span>
                                    <span>$${order.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        ${order.status === 'processing' ? `
                            <button class="cancel-order-btn" data-id="${order.id}">
                                <i class='bx bx-x'></i> Cancel Order
                            </button>
                        ` : ''}
                        ${order.status === 'delivered' && !order.rated ? `
                            <button class="rate-order-btn" data-id="${order.id}">
                                <i class='bx bx-star'></i> Rate Order
                            </button>
                        ` : ''}
                        <button class="close-details-btn">Close</button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to the DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstElementChild);

        // Add event listeners for modal interactions
        const closeButtons = document.querySelectorAll('.close-modal-btn, .close-details-btn');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelector('.modal-backdrop').remove();
            });
        });

        // Close modal when clicking on backdrop
        document.querySelector('.modal-backdrop').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                document.querySelector('.modal-backdrop').remove();
            }
        });

        // Handle cancel order from modal
        const cancelBtn = document.querySelector('.modal-footer .cancel-order-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                document.querySelector('.modal-backdrop').remove();
                this.cancelOrder(orderId);
            });
        }

        // Handle rate order from modal
        const rateBtn = document.querySelector('.modal-footer .rate-order-btn');
        if (rateBtn) {
            rateBtn.addEventListener('click', () => {
                document.querySelector('.modal-backdrop').remove();
                this.rateOrder(orderId);
            });
        }
    }

    rateOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        // Build rating modal
        const modalHTML = `
            <div class="modal-backdrop">
                <div class="rating-modal">
                    <div class="modal-header">
                        <h2>Rate Your Order</h2>
                        <button class="close-modal-btn">
                            <i class='bx bx-x'></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <p>How was your experience with this order?</p>
                        <div class="star-rating">
                            <i class='bx bx-star star-icon' data-rating="1"></i>
                            <i class='bx bx-star star-icon' data-rating="2"></i>
                            <i class='bx bx-star star-icon' data-rating="3"></i>
                            <i class='bx bx-star star-icon' data-rating="4"></i>
                            <i class='bx bx-star star-icon' data-rating="5"></i>
                        </div>
                        <div class="star-feedback">Select a rating</div>
                        
                        <div class="rating-comments">
                            <label for="rating-comments">Additional Comments (Optional)</label>
                            <textarea id="rating-comments" placeholder="Tell us more about your experience..."></textarea>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="cancel-rating-btn">Cancel</button>
                        <button class="submit-rating-btn" disabled>Submit Rating</button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to the DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstElementChild);

        // Track selected rating
        let selectedRating = 0;

        // Add event listeners for star rating
        const stars = document.querySelectorAll('.star-icon');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                selectedRating = rating;
                
                // Update star display
                stars.forEach((s, index) => {
                    if (index < rating) {
                        s.classList.remove('bx-star');
                        s.classList.add('bxs-star');
                        s.classList.add('selected');
                    } else {
                        s.classList.add('bx-star');
                        s.classList.remove('bxs-star');
                        s.classList.remove('selected');
                    }
                });
                
                // Update feedback text
                const feedbackEl = document.querySelector('.star-feedback');
                if (feedbackEl) {
                    const feedback = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
                    feedbackEl.textContent = feedback[rating];
                }
                
                // Enable submit button
                const submitBtn = document.querySelector('.submit-rating-btn');
                if (submitBtn) {
                    submitBtn.removeAttribute('disabled');
                }
            });
            
            // Add hover effects
            star.addEventListener('mouseover', () => {
                const rating = parseInt(star.dataset.rating);
                stars.forEach((s, index) => {
                    if (index < rating) {
                        s.classList.add('hover');
                    } else {
                        s.classList.remove('hover');
                    }
                });
            });
            
            star.addEventListener('mouseout', () => {
                stars.forEach(s => s.classList.remove('hover'));
            });
        });

        // Close modal when clicking close button or cancel
        const closeButtons = document.querySelectorAll('.close-modal-btn, .cancel-rating-btn');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelector('.modal-backdrop').remove();
            });
        });

        // Close modal when clicking on backdrop
        document.querySelector('.modal-backdrop').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                document.querySelector('.modal-backdrop').remove();
            }
        });

        // Handle rating submission
        const submitBtn = document.querySelector('.submit-rating-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                if (selectedRating > 0) {
                    // Get comments if provided
                    const comments = document.getElementById('rating-comments').value;
                    
                    // Update the order with rating information
                    order.rated = true;
                    order.rating = {
                        score: selectedRating,
                        comments: comments,
                        date: new Date().toISOString()
                    };
                    
                    // Save to localStorage
                    localStorage.setItem('userOrders', JSON.stringify(this.orders));
                    
                    // Close modal
                    document.querySelector('.modal-backdrop').remove();
                    
                    // Show confirmation and refresh
                    alert('Thank you for your rating!');
                    this.render();
                }
            });
        }
    }

    cancelOrder(orderId) {
        if (confirm('Are you sure you want to cancel this order?')) {
            const orderIndex = this.orders.findIndex(o => o.id === orderId);
            if (orderIndex === -1) return;
            
            // Update order status
            this.orders[orderIndex].status = 'cancelled';
            this.orders[orderIndex].cancellationDate = new Date().toISOString();
            this.orders[orderIndex].cancellationReason = 'Cancelled by customer';
            
            // Save to localStorage
            localStorage.setItem('userOrders', JSON.stringify(this.orders));
            
            // Refresh the UI
            alert('Order cancelled successfully');
            this.render();
        }
    }
}