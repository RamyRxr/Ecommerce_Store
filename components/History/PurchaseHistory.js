export default class PurchaseHistory {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.activeTab = 'all';
        this.orders = [];
        this.user = JSON.parse(sessionStorage.getItem('user') || '{}');
        this.isAdmin = Boolean(this.user.is_admin);
        this.init();
    }

    async init() {
        await this.loadOrders();
        this.render();
        this.setupEventListeners();
    }

    async loadOrders() {
        try {
            const response = await fetch('../backend/api/orders/get_user_orders.php');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            if (data.success) {
                this.isAdmin = Boolean(data.is_admin);
                this.orders = data.orders.map(order => {
                    const processedOrder = {
                        id: order.id,
                        date: order.date,
                        status: order.status,
                        totalAmount: parseFloat(order.totalAmount || 0),
                        shippingAddress: {
                            street: order.shipping_address || order.shippingAddress?.street || 'N/A',
                            city: order.shipping_city || order.shippingAddress?.city || 'N/A',
                            state: order.shipping_state || order.shippingAddress?.state || '',
                            zip: order.shipping_zip || order.shipping_postal_code || order.shippingAddress?.zip || 'N/A',
                            country: order.shipping_country || order.shippingAddress?.country || 'N/A'
                        },
                        paymentMethod: order.paymentMethod || order.payment_method || '',
                        estimatedDelivery: order.estimatedDelivery,
                        actualDelivery: order.actualDelivery,
                        rated: order.rated || false,
                        cancellationDate: order.cancellationDate,
                        cancellationReason: order.cancellationReason,
                        username: this.isAdmin ? (order.username || 'N/A') : null,
                        user_id: this.isAdmin ? order.user_id : null
                    };

                    processedOrder.items = Array.isArray(order.items) ? order.items.map(item => ({
                        id: item.id,
                        product_id: item.product_id,
                        product_name: item.product_name || 'Product',
                        price: parseFloat(item.price || 0),
                        quantity: parseInt(item.quantity || 1),
                        total: parseFloat(item.total || 0),
                        image: this.getFirstValidItemImage(item), 
                    })) : [];
                    return processedOrder;
                });
                // console.log("Orders loaded:", this.orders, "IsAdmin:", this.isAdmin);
            } else {
                throw new Error(data.message || 'Failed to load orders');
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            this.showError('Failed to load orders. Please try again later.');
            this.orders = [];
        }
    }

    // Helper method to get first valid image for an item
    getFirstValidItemImage(item) {
        // Check if item.images is an array and has content
        if (Array.isArray(item.images) && item.images.length > 0 && item.images[0]) {
            const imgPath = item.images[0];
            return imgPath.includes('uploads/') ? `../${imgPath}` : `../backend/uploads/products/${imgPath}`;
        }
        // Fallback for a single image property if item.images is not as expected
        if (item.image) {
             const imgPath = item.image;
             return imgPath.includes('uploads/') ? `../${imgPath}` : `../backend/uploads/products/${imgPath}`;
        }
    }

    // Remove the old getFirstValidImage method if it's redundant
    // getFirstValidImage(item) { ... } // This one had console.log('rami error 3');

    showError(message) {
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

        // Add the new error message at the top of the container
        if (this.container.firstChild) {
            this.container.insertBefore(errorDiv, this.container.firstChild);
        } else {
            this.container.appendChild(errorDiv);
        }

        // Auto-remove the error after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    render() {
        const historyContentHTML = `
            <div class="purchase-history-content">
                <div class="main-content-container">
                    <div class="purchase-header">
                            <h1>Purchase History</h1>
                            <p>${this.orders.length} orders placed</p>
                    </div>
                    
                    <div class="purchase-tabs">
                        <button class="tab-button ${this.activeTab === 'all' ? 'active' : ''}" data-tab="all">
                            <i class='bx bx-package'></i>
                            All Orders
                        </button>
                        <button class="tab-button ${this.activeTab === 'pending' ? 'active' : ''}" data-tab="pending">
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
            : this.orders.filter(order => order.status === this.activeTab); // Simplified filter

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
            case 'pending':
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
        const orderDate = new Date(order.date);
        const formattedDate = orderDate.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        const statusInfo = this.getStatusInfo(order.status);
        const items = Array.isArray(order.items) ? order.items : [];
        const visibleItems = items.slice(0, 3);
        const hiddenItemCount = Math.max(0, items.length - 3);

        let bottomAction = '';
        let adminActions = '';

        if (this.isAdmin) {
            if (order.status === 'pending') {
                adminActions = `
                    <button class="admin-action-btn mark-shipped-btn" data-id="${order.id}">
                        <i class='bx bx-send'></i> Mark Shipped
                    </button>
                    <button class="admin-action-btn admin-cancel-btn" data-id="${order.id}">
                        <i class='bx bx-x-circle'></i> Cancel Order
                    </button>
                `;
            } else if (order.status === 'shipped') {
                adminActions = `
                    <button class="admin-action-btn mark-delivered-btn" data-id="${order.id}">
                        <i class='bx bx-check-double'></i> Mark Delivered
                    </button>
                `;
            }
            // No specific admin actions for 'delivered' or 'cancelled' in this flow, but can be added.
        } else { // Customer view
            switch (order.status) {
                case 'delivered':
                    bottomAction = order.rated
                        ? `<button class="rated-btn" disabled><i class='bx bxs-star'></i> Rated</button>`
                        : `<button class="rate-order-btn" data-id="${order.id}"><i class='bx bx-star'></i> Rate Order</button>`;
                    break;
                case 'shipped':
                    if (order.estimatedDelivery) {
                        const estimatedDate = new Date(order.estimatedDelivery);
                        const formattedEstimatedDate = estimatedDate.toLocaleDateString('en-US', {
                            month: 'long', day: 'numeric', year: 'numeric'
                        });
                        bottomAction = `<div class="delivery-estimate"><i class='bx bx-truck'></i><span>Est. delivery: ${formattedEstimatedDate}</span></div>`;
                    }
                    break;
                case 'pending':
                    bottomAction = `<button class="cancel-order-btn" data-id="${order.id}"><i class='bx bx-x'></i> Cancel Order</button>`;
                    break;
                case 'cancelled':
                    const cancellationDate = order.cancellationDate ? new Date(order.cancellationDate) : orderDate;
                    const formattedCancellationDate = cancellationDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                    bottomAction = `<div class="cancellation-info"><i class='bx bx-info-circle'></i><span>Cancelled on ${formattedCancellationDate}${order.cancellationReason ? ': ' + order.cancellationReason : ''}</span></div>`;
                    break;
            }
        }

        return `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-info">
                        <h3 class="order-id">Order #${order.id}</h3>
                        ${this.isAdmin && order.username ? `<p class="order-customer">Customer: ${order.username} (User ID: ${order.user_id})</p>` : ''}
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
                            <div class="item-image"><img src="${item.image}" alt="${item.product_name}"></div>
                            <div class="item-details">
                                <div class="item-name">${item.product_name}</div>
                                <div class="item-quantity">Qty: ${item.quantity}</div>
                            </div>
                            <div class="item-price">$${parseFloat(item.total).toFixed(2)}</div>
                        </div>
                    `).join('')}
                    ${hiddenItemCount > 0 ? `<div class="more-items">+ ${hiddenItemCount} more item${hiddenItemCount > 1 ? 's' : ''}</div>` : ''}
                </div>
                <div class="order-footer">
                    <button class="view-details-btn" data-id="${order.id}"><i class='bx bx-receipt'></i> View Details</button>
                    <div class="order-total">
                        <span class="total-label">Order Total:</span>
                        <span class="total-amount">$${parseFloat(order.totalAmount).toFixed(2)}</span>
                    </div>
                    <div class="order-action">
                        ${this.isAdmin ? adminActions : bottomAction}
                    </div>
                </div>
            </div>
        `;
    }

    getStatusInfo(status) {
        switch (status) {
            case 'pending':
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
        document.addEventListener('click', async e => { // Make async if handlers are async
            const tabButton = e.target.closest('.tab-button');
            if (tabButton) {
                this.activeTab = tabButton.dataset.tab;
                this.render(); // Re-render for tab change
                return; // Prevent other handlers on the same click
            }

            if (e.target.closest('.view-details-btn')) {
                const orderId = e.target.closest('.view-details-btn').dataset.id;
                this.viewOrderDetails(orderId);
                return;
            }

            // Customer actions
            if (!this.isAdmin) {
                if (e.target.closest('.rate-order-btn')) {
                    const orderId = e.target.closest('.rate-order-btn').dataset.id;
                    this.rateOrder(orderId);
                    return;
                }
                if (e.target.closest('.cancel-order-btn')) {
                    const orderId = e.target.closest('.cancel-order-btn').dataset.id;
                    this.cancelOrder(orderId); // Customer cancel
                    return;
                }
            }

            // Admin actions
            if (this.isAdmin) {
                if (e.target.closest('.mark-shipped-btn')) {
                    const orderId = e.target.closest('.mark-shipped-btn').dataset.id;
                    await this.adminUpdateOrderStatus(orderId, 'shipped');
                    return;
                }
                if (e.target.closest('.mark-delivered-btn')) {
                    const orderId = e.target.closest('.mark-delivered-btn').dataset.id;
                    await this.adminUpdateOrderStatus(orderId, 'delivered');
                    return;
                }
                if (e.target.closest('.admin-cancel-btn')) {
                    const orderId = e.target.closest('.admin-cancel-btn').dataset.id;
                    // You might want a prompt for reason here
                    if (confirm('Are you sure you want to cancel this order as an admin?')) {
                        await this.adminUpdateOrderStatus(orderId, 'cancelled', 'Cancelled by Admin');
                    }
                    return;
                }
            }
        });
    }

    async adminUpdateOrderStatus(orderId, newStatus, reason = null) {
        try {
            const payload = { order_id: orderId, status: newStatus };
            if (reason) {
                payload.reason = reason;
            }

            const response = await fetch('../backend/api/orders/admin_update_order_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Failed to update order status');
            }

            alert(`Order ${orderId} successfully updated to ${newStatus}.`);
            await this.loadOrders();
            this.render();

        } catch (error) {
            console.error(`Error updating order to ${newStatus}:`, error);
            this.showError(`Failed to update order to ${newStatus}. ${error.message}`);
        }
    }

    async viewOrderDetails(orderId) {
        try {
            const response = await fetch(`../backend/api/orders/get_order_details.php?id=${orderId}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})); // Try to parse error
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (!data.success || !data.order) {
                throw new Error(data.message || 'Failed to load order details');
            }

            const order = data.order;

            // Ensure shippingAddress object is properly formed
            order.shippingAddress = {
                street: order.shipping_address || order.shippingAddress?.street || 'N/A',
                city: order.shipping_city || order.shippingAddress?.city || 'N/A',
                state: order.shipping_state || order.shippingAddress?.state || '',
                zip: order.shipping_zip || order.shipping_postal_code || order.shippingAddress?.zip || 'N/A',
                country: order.shipping_country || order.shippingAddress?.country || 'N/A'
            };
            
            // Standardize payment method display
            let paymentMethodDisplay = order.payment_method || 'N/A';
            if (order.payment_details) {
                 paymentMethodDisplay = `${order.payment_details.card_type || 'Card'} ending in ${order.payment_details.last_four || '****'}`;
            } else if (String(order.payment_method).toLowerCase().includes('card') && (!order.payment_details || !order.payment_details.last_four)) {
                // Fallback if it's a card but no specific details in the order data
                // This previously fetched admin's card details, which is incorrect for an order's payment snapshot.
                // Best practice: `get_order_details.php` should provide a snapshot of payment info used for THAT order.
                // If not available, a generic message is better.
                paymentMethodDisplay = "Card (details unavailable)";
            }


            // Process item images and ensure numeric types
            if (Array.isArray(order.items)) {
                order.items = order.items.map(item => ({
                    ...item,
                    price: parseFloat(item.price || 0),
                    quantity: parseInt(item.quantity || 1),
                    total: parseFloat(item.total || (parseFloat(item.price || 0) * parseInt(item.quantity || 1))),
                    product_name: item.product_title || item.product_name || 'Product Name Unavailable',
                    image: this.getFirstValidItemImage(item)
                }));
            } else {
                order.items = [];
            }

            const orderDate = new Date(order.created_at || order.date);
            const formattedModalDate = orderDate.toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            // Helper function for country name (can be moved to class level if used elsewhere)
            const getCountryName = (countryCode) => {
                if (!countryCode) return 'N/A';
                const countries = {
                    'us': 'United States', 'ca': 'Canada', 'gb': 'United Kingdom', 'uk': 'United Kingdom',
                    'au': 'Australia', 'de': 'Germany', 'fr': 'France', 'it': 'Italy', 'es': 'Spain',
                    'jp': 'Japan', 'cn': 'China', 'in': 'India', 'br': 'Brazil', 'mx': 'Mexico',
                };
                return countries[String(countryCode).toLowerCase()] || countryCode;
            };
            
            // Default order.rated if not provided by backend, to prevent issues with button logic
            order.rated = order.rated || false;

            const modalHTML = `
                <div class="modal-backdrop">
                    <div class="order-details-modal">
                        <div class="modal-header">
                            <h2>Order Details - #${order.id}</h2>
                            <button class="close-modal-btn">
                                <i class='bx bx-x'></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="order-summary-section">
                                <div class="summary-item"><span class="summary-label">Order Date:</span><span class="summary-value">${formattedModalDate}</span></div>
                                <div class="summary-item"><span class="summary-label">Status:</span><span class="summary-value status-badge ${order.status}">${this.getStatusInfo(order.status).label}</span></div>
                                <div class="summary-item"><span class="summary-label">Total Amount:</span><span class="summary-value">$${parseFloat(order.total_price || order.totalAmount || 0).toFixed(2)}</span></div>
                                ${order.estimatedDelivery ? `<div class="summary-item"><span class="summary-label">Estimated Delivery:</span><span class="summary-value">${new Date(order.estimatedDelivery).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div>` : ''}
                                ${order.actualDelivery ? `<div class="summary-item"><span class="summary-label">Delivered On:</span><span class="summary-value">${new Date(order.actualDelivery).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div>` : ''}
                                ${order.status === 'cancelled' && (order.cancellationDate || order.updated_at) ? `
                                    <div class="summary-item"><span class="summary-label">Cancelled On:</span><span class="summary-value">${new Date(order.cancellationDate || order.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
                                    <div class="summary-item"><span class="summary-label">Reason:</span><span class="summary-value">${order.cancellationReason || "Not specified"}</span></div>
                                ` : ''}
                            </div>
                            <div class="address-payment-section">
                                <div class="shipping-address">
                                    <h3>Shipping Address</h3>
                                    <p>${order.shippingAddress.street}</p>
                                    <p>${order.shippingAddress.city}${order.shippingAddress.state ? ', ' + order.shippingAddress.state : ''} ${order.shippingAddress.zip}</p>
                                    <p>${getCountryName(order.shippingAddress.country)}</p>
                                </div>
                                <div class="payment-method">
                                    <h3>Payment Method</h3>
                                    <p>${paymentMethodDisplay}</p>
                                </div>
                            </div>
                            <div class="order-items-section">
                                <h3>Items in Your Order</h3>
                                <div class="order-items-table">
                                    <div class="order-items-header"><div class="item-col">Item</div><div class="price-col">Price</div><div class="qty-col">Qty</div><div class="total-col">Total</div></div>
                                    ${order.items.map(item => `
                                        <div class="order-item-row">
                                            <div class="item-col">
                                                <div class="item-image"><img src="${item.image}" alt="${item.product_name}"></div>
                                                <div class="item-name">${item.product_name}</div>
                                            </div>
                                            <div class="price-col">$${item.price.toFixed(2)}</div>
                                            <div class="qty-col">${item.quantity}</div>
                                            <div class="total-col">$${item.total.toFixed(2)}</div>
                                        </div>
                                    `).join('')}
                                    ${order.items.length === 0 ? '<p class="no-items-message">No items found for this order.</p>' : ''}
                                </div>
                                <div class="order-totals">
                                    <div class="subtotal"><span>Subtotal:</span><span>$${parseFloat(order.subtotal_price || order.total_price || order.totalAmount || 0).toFixed(2)}</span></div>
                                    <div class="shipping"><span>Shipping:</span><span>${parseFloat(order.shipping_cost || 0) > 0 ? '$' + parseFloat(order.shipping_cost).toFixed(2) : 'Free'}</span></div>
                                    <div class="grand-total"><span>Grand Total:</span><span>$${parseFloat(order.total_price || order.totalAmount || 0).toFixed(2)}</span></div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            ${!this.isAdmin && order.status === 'pending' ? `<button class="action-btn cancel-order-modal-btn" data-id="${order.id}"><i class='bx bx-x'></i> Cancel Order</button>` : ''}
                            ${!this.isAdmin && order.status === 'delivered' && !order.rated ? `<button class="action-btn rate-order-modal-btn" data-id="${order.id}"><i class='bx bx-star'></i> Rate Products</button>` : ''}
                            <button class="action-btn close-details-btn">Close</button>
                        </div>
                    </div>
                </div>
            `;
            
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = modalHTML;
            document.body.appendChild(modalContainer.firstElementChild);

            const modalElement = document.querySelector('.modal-backdrop');

            modalElement.querySelector('.close-modal-btn').addEventListener('click', () => modalElement.remove());
            modalElement.querySelector('.close-details-btn').addEventListener('click', () => modalElement.remove());
            
            modalElement.addEventListener('click', (e) => {
                if (e.target === modalElement) {
                     modalElement.remove();
                }
            });

            const cancelBtnModal = modalElement.querySelector('.cancel-order-modal-btn');
            if (cancelBtnModal) {
                cancelBtnModal.addEventListener('click', () => {
                    modalElement.remove();
                    this.cancelOrder(orderId); 
                });
            }

            const rateBtnModal = modalElement.querySelector('.rate-order-modal-btn');
            if (rateBtnModal) {
                rateBtnModal.addEventListener('click', () => {
                    modalElement.remove();
                    // If rating is per product, this should ideally pass item info or redirect
                    // For now, it calls the generic rateOrder which was for the whole order.
                    // You might want to change this to a "Rate Products" flow.
                    this.rateOrder(orderId); // This was for order rating. Adjust if product rating is different.
                });
            }

        } catch (error) {
            console.error('Error loading order details:', error);
            this.showError(`Failed to load order details. ${error.message}`);
        }
    }

    async rateOrder(orderId) {
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
        const submitBtn = document.querySelector('.submit-rating-btn');

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
        if (submitBtn) {
            submitBtn.addEventListener('click', async () => {
                if (selectedRating > 0) {
                    try {
                        // Get comments if provided
                        const comments = document.getElementById('rating-comments').value;

                        // Submit rating via API
                        const response = await fetch('../backend/api/orders/add_rating.php', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                order_id: orderId,
                                rating: selectedRating,
                                comments: comments
                            })
                        });

                        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                        const data = await response.json();
                        if (!data.success) throw new Error(data.message || 'Failed to submit rating');

                        // Update local order data
                        const orderIndex = this.orders.findIndex(o => o.id === orderId);
                        if (orderIndex !== -1) {
                            this.orders[orderIndex].rated = true;
                        }

                        // Close modal
                        document.querySelector('.modal-backdrop').remove();

                        // Show confirmation and refresh
                        alert('Thank you for your rating!');
                        await this.loadOrders(); // Reload orders from server
                        this.render();

                    } catch (error) {
                        console.error('Error submitting rating:', error);
                        this.showError('Failed to submit your rating. Please try again later.');
                        document.querySelector('.modal-backdrop').remove();
                    }
                }
            });
        }
    }

    async cancelOrder(orderId) {
        if (confirm('Are you sure you want to cancel this order?')) {
            try {
                const response = await fetch('../backend/api/orders/update_order_status.php', { // Uses the original endpoint
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        order_id: orderId,
                        status: 'cancelled',
                        reason: 'Cancelled by customer' // Specific reason for customer
                    })
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.json();
                if (!data.success) throw new Error(data.message || 'Failed to cancel order');

                alert('Order cancelled successfully');
                await this.loadOrders();
                this.render();

            } catch (error) {
                console.error('Error cancelling order:', error);
                this.showError('Failed to cancel order. Please try again later.');
            }
        }
    }
}