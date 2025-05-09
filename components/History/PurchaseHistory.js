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
                        rated: order.rated || (order.order_rating_value && order.order_rating_value > 0) || false,
                        order_rating_value: order.order_rating_value || null,
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
                        total: parseFloat(item.total || (parseFloat(item.price || 0) * parseInt(item.quantity || 1))),
                        image: this.getFirstValidItemImage(item),
                    })) : [];
                    return processedOrder;
                });
            } else {
                throw new Error(data.message || 'Failed to load orders');
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            this.showError('Failed to load orders. Please try again later.');
            this.orders = [];
        }
    }

    getFirstValidItemImage(item) {
        if (Array.isArray(item.images) && item.images.length > 0 && item.images[0]) {
            const imgPath = item.images[0];
            return imgPath.includes('uploads/') ? `../${imgPath}` : `../backend/uploads/products/${imgPath}`;
        }
        if (item.image) {
            const imgPath = item.image;
            return imgPath.includes('uploads/') ? `../${imgPath}` : `../backend/uploads/products/${imgPath}`;
        }
        return '../assets/images/general-image/DefaultProduct.png';
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class='bx bx-error-circle'></i>
            <span>${message}</span>
        `;

        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        if (this.container.firstChild) {
            this.container.insertBefore(errorDiv, this.container.firstChild);
        } else {
            this.container.appendChild(errorDiv);
        }

        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    render() {
        const historyContentHTML = `
            <div class="purchase-history-content">
                <div class="main-content-container">
                    <div class="purchase-header">
                            <h1>Purchase History</h1>
                            <p>${this.orders.length} order${this.orders.length === 1 ? '' : 's'} placed</p>
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

        const existingHistoryContent = this.container.querySelector('.purchase-history-content');
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

    renderStarDisplay(ratingValue) {
        let starsHTML = '';
        const numericRating = parseInt(ratingValue, 10);
        if (isNaN(numericRating) || numericRating < 1) { // Handle cases where ratingValue might be null or 0
            return '<div class="order-rating-display no-rating">Not Rated</div>';
        }
        for (let i = 1; i <= 5; i++) {
            if (i <= numericRating) {
                starsHTML += `<i class='bx bxs-star'></i>`;
            } else {
                starsHTML += `<i class='bx bx-star'></i>`;
            }
        }
        return `<div class="order-rating-display">${starsHTML}</div>`;
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
        } else {
            switch (order.status) {
                case 'delivered':
                    if (order.rated && order.order_rating_value && order.order_rating_value > 0) {
                        bottomAction = `
                            <div class="rated-action-group">
                                ${this.renderStarDisplay(order.order_rating_value)}
                                <button class="delete-rating-btn" data-id="${order.id}" title="Delete Rating">
                                    <i class='bx bx-trash'></i>
                                </button>
                            </div>`;
                    } else if (order.rated) {
                        bottomAction = `
                            <div class="rated-action-group">
                                <button class="rated-btn" disabled><i class='bx bxs-star'></i> Rated (No value)</button>
                                <button class="delete-rating-btn" data-id="${order.id}" title="Delete Rating">
                                    <i class='bx bx-trash'></i>
                                </button>
                            </div>`;
                    } else {
                        bottomAction = `<button class="rate-order-btn" data-id="${order.id}"><i class='bx bx-star'></i> Rate Order</button>`;
                    }
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
                    const cancellationDate = order.cancellationDate ? new Date(order.cancellationDate) : (order.date ? new Date(order.date) : new Date());
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
        this.container.addEventListener('click', async e => {
            const tabButton = e.target.closest('.tab-button');
            if (tabButton) {
                this.activeTab = tabButton.dataset.tab;
                this.render();
                return;
            }

            if (e.target.closest('.view-details-btn')) {
                const orderId = e.target.closest('.view-details-btn').dataset.id;
                this.viewOrderDetails(orderId);
                return;
            }

            if (!this.isAdmin) {
                if (e.target.closest('.rate-order-btn')) {
                    const orderId = e.target.closest('.rate-order-btn').dataset.id;
                    this.rateOrder(orderId);
                    return;
                }
                if (e.target.closest('.cancel-order-btn')) {
                    const orderId = e.target.closest('.cancel-order-btn').dataset.id;
                    this.cancelOrder(orderId);
                    return;
                }
                if (e.target.closest('.delete-rating-btn')) { // For card view
                    const orderId = e.target.closest('.delete-rating-btn').dataset.id;
                    this.deleteOrderRating(orderId);
                    return;
                }
            }

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
                    if (confirm('Are you sure you want to cancel this order as an admin?')) {
                        const reason = prompt("Please enter a reason for cancellation (optional):", "Cancelled by Admin");
                        await this.adminUpdateOrderStatus(orderId, 'cancelled', reason);
                    }
                    return;
                }
            }
        });

        // Event listener for delete button inside modal (delegated to document.body if modal is added/removed)
        document.body.addEventListener('click', async e => {
            if (e.target.closest('.delete-rating-modal-btn')) {
                const orderId = e.target.closest('.delete-rating-modal-btn').dataset.id;
                const modalElement = e.target.closest('.modal-backdrop');
                if (modalElement) {
                    modalElement.remove();
                }
                this.deleteOrderRating(orderId);
            }
            // Add similar for .rate-order-modal-btn and .cancel-order-modal-btn if not handled inside viewOrderDetails
        });
    }

    async adminUpdateOrderStatus(orderId, newStatus, reason = null) {
        try {
            const payload = { order_id: orderId, status: newStatus };
            if (reason !== null) {
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
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (!data.success || !data.order) {
                throw new Error(data.message || 'Failed to load order details');
            }

            const order = data.order;

            order.shippingAddress = {
                street: order.shipping_address || order.shippingAddress?.street || 'N/A',
                city: order.shipping_city || order.shippingAddress?.city || 'N/A',
                state: order.shipping_state || order.shippingAddress?.state || '',
                zip: order.shipping_zip || order.shipping_postal_code || order.shippingAddress?.zip || 'N/A',
                country: order.shipping_country || order.shippingAddress?.country || 'N/A'
            };

            let paymentMethodDisplay = order.payment_method || 'N/A';
            if (order.payment_details && order.payment_details.card_type && order.payment_details.last_four) {
                paymentMethodDisplay = `${order.payment_details.card_type} ending in ${order.payment_details.last_four}`;
            } else if (String(order.payment_method).toLowerCase().includes('card')) {
                paymentMethodDisplay = "Card (details unavailable)";
            }


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

            const getCountryName = (countryCode) => {
                if (!countryCode) return 'N/A';
                const countries = {
                    'us': 'United States', 'ca': 'Canada', 'gb': 'United Kingdom', 'uk': 'United Kingdom',
                    'au': 'Australia', 'de': 'Germany', 'fr': 'France', 'it': 'Italy', 'es': 'Spain',
                    'jp': 'Japan', 'cn': 'China', 'in': 'India', 'br': 'Brazil', 'mx': 'Mexico',
                };
                return countries[String(countryCode).toLowerCase()] || countryCode;
            };

            order.rated = order.rated || false;

            let rateOrDisplaySection = '';
            if (!this.isAdmin && order.status === 'delivered') {
                if (order.rated && order.order_rating_value && order.order_rating_value > 0) {
                    rateOrDisplaySection = `
                        <div class="display-rating-modal">
                            ${this.renderStarDisplay(order.order_rating_value)}
                        </div>
                        <button class="action-btn delete-rating-modal-btn" data-id="${order.id}" title="Delete Rating">
                            <i class='bx bx-trash'></i> Delete Rating
                        </button>`;
                } else if (order.rated) {
                    rateOrDisplaySection = `
                        <div class="display-rating-modal">
                            <button class="rated-btn" disabled><i class='bx bxs-star'></i> Rated (No value)</button>
                        </div>
                        <button class="action-btn delete-rating-modal-btn" data-id="${order.id}" title="Delete Rating">
                            <i class='bx bx-trash'></i> Delete Rating
                        </button>`;
                } else {
                    rateOrDisplaySection = `<button class="action-btn rate-order-modal-btn" data-id="${order.id}"><i class='bx bx-star'></i> Rate Products</button>`;
                }
            }

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
                            ${rateOrDisplaySection}
                            <button class="action-btn close-details-btn">Close</button>
                        </div>
                    </div>
                </div>
            `;

            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = modalHTML;
            document.body.appendChild(modalContainer.firstElementChild);

            const modalElement = document.body.querySelector('.modal-backdrop:last-child');

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
                    this.rateOrder(orderId);
                });
            }

            const deleteRatingModalBtn = modalElement.querySelector('.delete-rating-modal-btn');
            if (deleteRatingModalBtn) {
                deleteRatingModalBtn.addEventListener('click', () => {
                    modalElement.remove();
                    this.deleteOrderRating(orderId);
                });
            }

        } catch (error) {
            console.error('Error loading order details:', error);
            this.showError(`Failed to load order details. ${error.message}`);
        }
    }

    async rateOrder(orderId) {
        const orderToRate = this.orders.find(o => o.id === orderId);

        if (orderToRate && orderToRate.rated) {
            alert('You have already submitted a rating for this order.');
            const orderIndex = this.orders.findIndex(o => o.id === orderId);
            if (orderIndex !== -1) {
                if (!this.orders[orderIndex].rated) {
                    this.orders[orderIndex].rated = true;
                    this.render();
                }
            }
            return;
        }

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

        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstElementChild);

        const ratingModalElement = document.body.querySelector('.modal-backdrop:last-child .rating-modal');
        const backdropElement = document.body.querySelector('.modal-backdrop:last-child');


        let selectedRating = 0;

        const stars = ratingModalElement.querySelectorAll('.star-icon');
        const submitBtn = ratingModalElement.querySelector('.submit-rating-btn');
        const feedbackEl = ratingModalElement.querySelector('.star-feedback');
        const commentsEl = ratingModalElement.querySelector('#rating-comments');

        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                selectedRating = rating;

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

                if (feedbackEl) {
                    const feedback = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
                    feedbackEl.textContent = feedback[rating];
                }

                if (submitBtn) {
                    submitBtn.removeAttribute('disabled');
                }
            });

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

        const closeButtons = ratingModalElement.querySelectorAll('.close-modal-btn, .cancel-rating-btn');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                backdropElement.remove();
            });
        });

        backdropElement.addEventListener('click', (e) => {
            if (e.target === backdropElement) {
                backdropElement.remove();
            }
        });

        if (submitBtn) {
            submitBtn.addEventListener('click', async () => {
                if (selectedRating > 0) {
                    try {
                        const comments = commentsEl.value;

                        const response = await fetch('../backend/api/orders/add_order_rating.php', {
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

                        let responseData;
                        const responseText = await response.text();
                        try {
                            responseData = JSON.parse(responseText);
                        } catch (e) {
                            throw new Error(`Failed to parse server response. Status: ${response.status}. Response: ${responseText}`);
                        }

                        if (!response.ok) {
                            throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
                        }
                        if (!responseData.success) {
                            throw new Error(responseData.message || 'Failed to submit rating');
                        }


                        const orderIndex = this.orders.findIndex(o => o.id === orderId);
                        if (orderIndex !== -1) {
                            this.orders[orderIndex].rated = true;
                            this.orders[orderIndex].order_rating_value = selectedRating;
                        }

                        backdropElement.remove();

                        alert('Thank you for your rating!');
                        await this.loadOrders();
                        this.render();

                    } catch (error) {
                        console.error('Error submitting rating:', error);
                        this.showError(error.message || 'Failed to submit your rating. Please try again later.');
                        if (backdropElement && backdropElement.parentNode) {
                            backdropElement.remove();
                        }
                    }
                }
            });
        }
    }

    async cancelOrder(orderId) {
        if (confirm('Are you sure you want to cancel this order?')) {
            try {
                const response = await fetch('../backend/api/orders/update_order_status.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        order_id: orderId,
                        status: 'cancelled',
                        reason: 'Cancelled by customer'
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (!data.success) throw new Error(data.message || 'Failed to cancel order');

                alert('Order cancelled successfully');
                await this.loadOrders();
                this.render();

            } catch (error) {
                console.error('Error cancelling order:', error);
                this.showError(error.message || 'Failed to cancel order. Please try again later.');
            }
        }
    }

    async deleteOrderRating(orderId) {
        if (confirm('Are you sure you want to delete your rating for this order? This will also remove associated product reviews from this order.')) {
            try {
                const response = await fetch('../backend/api/orders/delete_order_rating.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ order_id: orderId })
                });

                const responseData = await response.json();

                if (!response.ok || !responseData.success) {
                    throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
                }

                alert(responseData.message || 'Order rating deleted successfully.');

                const orderIndex = this.orders.findIndex(o => o.id === orderId);
                if (orderIndex !== -1) {
                    this.orders[orderIndex].rated = false;
                    this.orders[orderIndex].order_rating_value = null;
                }
                await this.loadOrders(); // Crucial to get fresh state, especially product ratings
                this.render();

            } catch (error) {
                console.error('Error deleting order rating:', error);
                this.showError(error.message || 'Failed to delete order rating. Please try again later.');
            }
        }
    }
}