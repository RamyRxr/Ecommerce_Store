export default class CheckoutSummary {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.cartItems = []; // Initialize as empty array
        this.shippingMethod = 'standard';
        this.promoCode = '';
        this.promoDiscount = 0;
        this.shippingRates = {
            standard: 12.99,
            express: 24.99
        };
        this.isVisible = false;
        this.init();
    }

    async init() {
        await this.loadCartItems();
        this.render();
        this.setupEventListeners();
    }

    async loadCartItems() {
        try {
            const response = await fetch('../backend/api/orders/get_order_items.php');
            if (!response.ok) {
                throw new Error('Failed to fetch cart items');
            }
            const data = await response.json();
            if (data.success && Array.isArray(data.items)) {
                this.cartItems = data.items;
            } else {
                this.cartItems = [];
                throw new Error(data.message || 'Failed to load cart items');
            }
        } catch (error) {
            console.error('Error loading cart items:', error);
            this.cartItems = [];
        }
    }

    calculateTotals() {
        let subtotal = 0;
        let itemCount = 0;
        
        // Check if cartItems exists and is an array
        if (Array.isArray(this.cartItems)) {
            this.cartItems.forEach(item => {
                if (item && item.price && item.quantity) {
                    subtotal += item.price * item.quantity;
                    itemCount += item.quantity;
                }
            });
        }
        
        const shippingCost = itemCount > 0 ? this.shippingRates[this.shippingMethod] : 0;
        const discount = this.promoDiscount || 0;
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
        const existingSummary = document.querySelector('.checkout-summary-container');
        if (existingSummary) {
            existingSummary.remove();
        }

        if (!this.isVisible) return;

        const totals = this.calculateTotals();
        const summaryContainer = document.createElement('div');
        summaryContainer.className = 'checkout-summary-container';
        
        const summaryHTML = `
            <div class="checkout-summary">
                <div class="summary-header">
                    <h2>Order Summary</h2>
                    <button class="close-summary-btn">
                        <i class='bx bx-x'></i>
                    </button>
                </div>
                
                <div class="summary-items">
                    ${this.cartItems.map(item => `
                        <div class="summary-item">
                            <div class="summary-item-details">
                                <span class="item-name">${item.title}</span>
                                <span class="item-quantity">×${item.quantity}</span>
                            </div>
                            <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="shipping-options">
                    <h3>Shipping Method</h3>
                    <div class="shipping-option ${this.shippingMethod === 'standard' ? 'selected' : ''}" data-shipping="standard">
                        <div class="option-info">
                            <div class="option-radio">
                                <div class="radio-dot"></div>
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
                                <div class="radio-dot"></div>
                            </div>
                            <div class="option-details">
                                <span class="option-name">Express (1-2 days)</span>
                                <span class="option-price">$24.99</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="summary-totals">
                    <div class="summary-row">
                        <span>Subtotal</span>
                        <span class="subtotal-value">$${totals.subtotal}</span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping</span>
                        <span class="shipping-value">$${totals.shipping}</span>
                    </div>
                    ${totals.discount > 0 ? `
                        <div class="summary-row discount">
                            <span>Discount</span>
                            <span class="discount-value">-$${totals.discount}</span>
                        </div>
                    ` : ''}
                    <div class="summary-row total">
                        <span>Total</span>
                        <span class="total-value">$${totals.total}</span>
                    </div>
                </div>
                
                <button class="complete-purchase-btn">
                    <i class='bx bx-lock-alt'></i>
                    Complete Purchase
                </button>
            </div>
        `;
        
        summaryContainer.innerHTML = summaryHTML;
        this.container.appendChild(summaryContainer);
        
        setTimeout(() => {
            summaryContainer.classList.add('visible');
        }, 10);
    }

    setupEventListeners() {
        document.addEventListener('showCheckoutSummary', async (event) => {
            await this.loadCartItems();
            this.show();
        });

        document.addEventListener('click', (e) => {
            if (e.target.closest('.close-summary-btn')) {
                this.hide();
            }

            const shippingOption = e.target.closest('.shipping-option');
            if (shippingOption && this.isVisible) {
                const method = shippingOption.dataset.shipping;
                this.updateShippingMethod(method);
            }

            if (e.target.closest('.complete-purchase-btn') && this.isVisible) {
                this.completePurchase();
            }
        });
    }

    updateShippingMethod(method) {
        if (this.shippingMethod === method) return;
        
        this.shippingMethod = method;
        
        const options = document.querySelectorAll('.shipping-option');
        options.forEach(option => {
            const isSelected = option.dataset.shipping === method;
            option.classList.toggle('selected', isSelected);
            option.querySelector('.radio-dot').classList.toggle('selected', isSelected);
        });
        
        const totals = this.calculateTotals();
        
        document.querySelector('.shipping-value').textContent = `$${totals.shipping}`;
        document.querySelector('.total-value').textContent = `$${totals.total}`;
    }

    async completePurchase() {
        try {
            if (!this.shippingMethod) {
                alert('Please select a shipping method');
                return;
            }

            const totals = this.calculateTotals();
            const orderData = {
                total_price: parseFloat(totals.total),
                shipping_method: this.shippingMethod,
                shipping_cost: this.shippingRates[this.shippingMethod],
                payment_method: 'credit_card',
                items: this.cartItems
            };

            const response = await fetch('../backend/api/orders/create_order.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                // Show success animation
                const animContainer = document.createElement('div');
                animContainer.className = 'success-animation-container';
                animContainer.innerHTML = `
                    <div class="success-animation">
                        <i class='bx bx-check'></i>
                    </div>
                `;
                
                document.body.appendChild(animContainer);
                
                // Add active class after a small delay
                setTimeout(() => {
                    animContainer.classList.add('active');
                }, 10);
                
                // Hide animation and update UI
                setTimeout(() => {
                    animContainer.classList.remove('active');
                    setTimeout(() => {
                        animContainer.remove();
                        
                        // Hide checkout summary
                        this.hide();
                        
                        // Clear cart items locally
                        this.cartItems = [];
                        
                        // Update cart badge to show 0
                        document.dispatchEvent(new CustomEvent('updateCartBadge', {
                            detail: { count: 0 }
                        }));
                        
                        // Update cart page content immediately
                        document.dispatchEvent(new CustomEvent('cartUpdated', {
                            detail: {
                                items: [],
                                totals: {
                                    subtotal: "0.00",
                                    total: "0.00",
                                    itemCount: 0
                            }
                        }
                    }));

                }, 300);
            }, 1500);
            } else {
                throw new Error(data.message || 'Failed to create order');
            }
        } catch (error) {
            console.error('Error completing purchase:', error);
            alert('Failed to complete purchase: ' + error.message);
        }
    }

    show() {
        this.isVisible = true;
        this.render();
    }

    hide() {
        const summaryContainer = document.querySelector('.checkout-summary-container');
        if (summaryContainer) {
            summaryContainer.classList.remove('visible');
            setTimeout(() => {
                this.isVisible = false;
                this.render();
            }, 300);
        }
    }
}