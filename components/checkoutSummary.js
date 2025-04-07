export default class CheckoutSummary {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.cartItems = [];
        this.shippingMethod = 'standard'; // Default shipping method
        this.promoCode = '';
        this.promoDiscount = 0;
        this.shippingRates = {
            standard: 12.99, // 3-5 days
            express: 24.99   // 1-2 days
        };
        this.isVisible = false;
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
        // Remove existing summary if it exists
        const existingSummary = document.querySelector('.checkout-summary-container');
        if (existingSummary) {
            existingSummary.remove();
        }

        if (!this.isVisible) {
            return;
        }

        const totals = this.calculateTotals();
        
        // Create the summary container
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
                                <span class="item-name">${item.name}</span>
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
                
                <div class="promo-code-section">
                    <h3>Promo Code</h3>
                    <div class="promo-input-container">
                        <input type="text" id="promo-code" placeholder="Enter promo code">
                        <button id="apply-promo" class="apply-promo-btn">
                            <span>Apply</span>
                            <i class='bx bx-check apply-icon'></i>
                        </button>
                    </div>
                    <div class="promo-message"></div>
                </div>
                
                <div class="summary-totals">
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
                
                <button class="complete-purchase-btn">
                    <i class='bx bx-lock-alt'></i>
                    Complete Purchase
                </button>
            </div>
        `;
        
        summaryContainer.innerHTML = summaryHTML;
        this.container.appendChild(summaryContainer);
        
        // Add animation class after appending to DOM to trigger animation
        setTimeout(() => {
            summaryContainer.classList.add('visible');
        }, 10);
    }

    setupEventListeners() {
        // Listen for showCheckoutSummary event
        document.addEventListener('showCheckoutSummary', (event) => {
            this.cartItems = event.detail.items;
            this.show();
        });

        // Event delegation for all clicks
        document.addEventListener('click', (e) => {
            // Close button
            if (e.target.closest('.close-summary-btn')) {
                this.hide();
            }

            // Shipping option selection
            const shippingOption = e.target.closest('.shipping-option');
            if (shippingOption && this.isVisible) {
                const method = shippingOption.dataset.shipping;
                this.shippingMethod = method;
                this.render();
            }

            // Apply promo code
            if (e.target.closest('#apply-promo') && this.isVisible) {
                this.applyPromoCode();
            }

            // Complete purchase button
            if (e.target.closest('.complete-purchase-btn') && this.isVisible) {
                this.completePurchase();
            }
        });

        // Handle Enter key in promo input
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.id === 'promo-code' && this.isVisible) {
                this.applyPromoCode();
            }
        });
    }

    applyPromoCode() {
        const promoInput = document.getElementById('promo-code');
        const promoMessage = document.querySelector('.promo-message');
        const applyBtn = document.querySelector('.apply-promo-btn');
        
        if (promoInput && promoMessage && applyBtn) {
            const code = promoInput.value.trim();
            
            if (code === '') {
                promoMessage.innerHTML = '<span class="error">Please enter a promo code</span>';
                this.shakeElement(promoInput);
                return;
            }
            
            // Start loading animation
            applyBtn.classList.add('loading');
            
            // Simulate API request with timeout
            setTimeout(() => {
                // For demo purposes, "SAVE10" gives a 10% discount
                if (code.toUpperCase() === 'SAVE10') {
                    const subtotal = parseFloat(this.calculateTotals().subtotal);
                    this.promoCode = code;
                    this.promoDiscount = subtotal * 0.1; // 10% discount
                    promoMessage.innerHTML = '<span class="success">Promo code applied! 10% discount</span>';
                    applyBtn.classList.remove('loading');
                    applyBtn.classList.add('success');
                    
                    // Show success animation
                    this.successAnimation(applyBtn);
                    
                    // Re-render after animation
                    setTimeout(() => {
                        this.render();
                    }, 1500);
                } else {
                    promoMessage.innerHTML = '<span class="error">Invalid promo code</span>';
                    this.promoCode = '';
                    this.promoDiscount = 0;
                    applyBtn.classList.remove('loading');
                    this.shakeElement(promoInput);
                    this.render();
                }
            }, 800);
        }
    }

    successAnimation(element) {
        element.querySelector('.apply-icon').classList.add('animate-success');
    }

    shakeElement(element) {
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
    }

    completePurchase() {
        // In a real app, you would:
        // 1. Validate shipping address, payment details, etc.
        // 2. Submit order to backend
        // 3. Process payment
        // 4. Show confirmation or errors
        
        // For demo purposes, show alert and clear cart
        alert(`Thank you for your purchase of $${this.calculateTotals().total}!`);
        
        // Clear cart
        this.cartItems = [];
        localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
        
        // Update cart badge
        document.dispatchEvent(new CustomEvent('updateCartBadge'));
        
        // Hide summary
        this.hide();
        
        // Refresh cart display
        document.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: {
                items: this.cartItems,
                totals: { subtotal: "0.00", itemCount: 0 }
            }
        }));
    }

    show() {
        this.isVisible = true;
        this.render();
    }

    hide() {
        const summaryContainer = document.querySelector('.checkout-summary-container');
        if (summaryContainer) {
            summaryContainer.classList.remove('visible');
            
            // Remove after animation completes
            setTimeout(() => {
                this.isVisible = false;
                this.render();
            }, 300);
        }
    }
}