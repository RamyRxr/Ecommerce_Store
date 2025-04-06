export default class OrderSummary {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.cartItems = [];
        this.shippingMethod = 'standard'; // Default shipping method
        this.promoCode = '';
        this.promoDiscount = 0;
        this.shippingRates = {
            standard: 12.99,
            express: 24.99
        };
        this.init();
    }

    init() {
        this.loadCartItems();
        this.render();
        this.setupEventListeners();
    }

    loadCartItems() {
        try {
            // Get cart items from localStorage
            const cartItemsJson = localStorage.getItem('cartItems');
            if (cartItemsJson) {
                this.cartItems = JSON.parse(cartItemsJson);
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
        
        const shippingCost = this.cartItems.length > 0 ? this.shippingRates[this.shippingMethod] : 0;
        const discount = this.promoDiscount;
        const total = subtotal - discount + shippingCost;
        
        return {
            subtotal: subtotal.toFixed(2),
            shipping: shippingCost.toFixed(2),
            discount: discount.toFixed(2),
            total: total.toFixed(2),
            itemCount
        };
    }

    render() {
        const totals = this.calculateTotals();
        
        const orderSummaryHTML = `
            <div class="order-summary-container">
                <div class="order-summary">
                    <h2>Order Summary</h2>
                    <div class="summary-items">
                        ${this.cartItems.map(item => `
                            <div class="summary-item">
                                <span class="item-name">${item.name} ${item.quantity > 1 ? `(${item.quantity})` : ''}</span>
                                <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="summary-details">
                        <div class="summary-row">
                            <span>Subtotal</span>
                            <span>$${totals.subtotal}</span>
                        </div>
                        <div class="summary-row">
                            <span>Shipping</span>
                            <span>$${totals.shipping}</span>
                        </div>
                        ${totals.discount > 0 ? `
                            <div class="summary-row discount">
                                <span>Discount</span>
                                <span>-$${totals.discount}</span>
                            </div>
                        ` : ''}
                        <div class="summary-row total">
                            <span>Total</span>
                            <span>$${totals.total}</span>
                        </div>
                    </div>
                    <button class="checkout-btn ${this.cartItems.length === 0 ? 'disabled' : ''}" 
                            ${this.cartItems.length === 0 ? 'disabled' : ''}>
                        <i class='bx bx-credit-card'></i>
                        Proceed to Checkout
                    </button>
                </div>
                
                <div class="promo-code">
                    <h2>Promo Code</h2>
                    <div class="promo-input-container">
                        <input type="text" id="promo-code" placeholder="Enter promo code">
                        <button id="apply-promo" class="apply-promo-btn">Apply</button>
                    </div>
                    <div class="promo-message"></div>
                </div>
                
                <div class="shipping-options">
                    <h2>Shipping</h2>
                    <div class="shipping-option ${this.shippingMethod === 'standard' ? 'selected' : ''}" data-shipping="standard">
                        <div class="option-info">
                            <div class="option-radio">
                                <div class="radio-dot ${this.shippingMethod === 'standard' ? 'selected' : ''}"></div>
                            </div>
                            <div class="option-details">
                                <span class="option-name">Standard (3-5 days)</span>
                                <span class="option-price">$12.99</span>
                            </div>
                        </div>
                    </div>
                    <div class="shipping-option ${this.shippingMethod === 'express' ? 'selected' : ''}" data-shipping="express">
                        <div class="option-info">
                            <div class="option-radio">
                                <div class="radio-dot ${this.shippingMethod === 'express' ? 'selected' : ''}"></div>
                            </div>
                            <div class="option-details">
                                <span class="option-name">Express (1-2 days)</span>
                                <span class="option-price">$24.99</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const orderSummaryContainer = document.createElement('div');
        orderSummaryContainer.className = 'order-summary-content';
        orderSummaryContainer.innerHTML = orderSummaryHTML;

        // Check if order summary content already exists
        const existingOrderSummary = document.querySelector('.order-summary-content');
        if (existingOrderSummary) {
            existingOrderSummary.replaceWith(orderSummaryContainer);
        } else {
            this.container.appendChild(orderSummaryContainer);
        }
    }

    setupEventListeners() {
        // Listen for updates from CartItems component
        document.addEventListener('cartUpdated', (event) => {
            this.cartItems = event.detail.items;
            this.render();
        });

        // Handle promo code application
        document.addEventListener('click', (e) => {
            if (e.target.id === 'apply-promo') {
                const promoInput = document.getElementById('promo-code');
                const promoMessage = document.querySelector('.promo-message');
                
                if (promoInput && promoMessage) {
                    const code = promoInput.value.trim();
                    
                    if (code === '') {
                        promoMessage.innerHTML = '<span class="error">Please enter a promo code</span>';
                        return;
                    }
                    
                    // For demo purposes, let's say "SAVE10" gives a 10% discount
                    if (code.toUpperCase() === 'SAVE10') {
                        const subtotal = parseFloat(this.calculateTotals().subtotal);
                        this.promoCode = code;
                        this.promoDiscount = subtotal * 0.1; // 10% discount
                        promoMessage.innerHTML = '<span class="success">Promo code applied! 10% discount</span>';
                        this.render();
                    } else {
                        promoMessage.innerHTML = '<span class="error">Invalid promo code</span>';
                        this.promoCode = '';
                        this.promoDiscount = 0;
                        this.render();
                    }
                }
            }
        });

        // Handle shipping option selection
        document.addEventListener('click', (e) => {
            const shippingOption = e.target.closest('.shipping-option');
            if (shippingOption) {
                const method = shippingOption.dataset.shipping;
                this.shippingMethod = method;
                this.render();
            }
        });

        // Handle checkout button
        document.addEventListener('click', (e) => {
            if (e.target.closest('.checkout-btn') && !e.target.closest('.checkout-btn').classList.contains('disabled')) {
                // In a real app, you would redirect to checkout page or show checkout modal
                alert('Proceeding to checkout with total amount: $' + this.calculateTotals().total);
            }
        });
    }
}