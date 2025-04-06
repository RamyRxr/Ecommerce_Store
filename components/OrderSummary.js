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
                        ${this.cartItems.map((item, index) => `
                            <div class="summary-item" style="animation-delay: ${index * 0.1}s">
                                <div class="summary-item-info">
                                    <span class="item-name">${item.name}</span>
                                    <span class="item-quantity">×${item.quantity}</span>
                                </div>
                                <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="summary-details">
                        <div class="summary-row">
                            <span>Subtotal</span>
                            <span class="value">$${totals.subtotal}</span>
                        </div>
                        <div class="summary-row">
                            <span>Shipping</span>
                            <span class="value shipping-value">$${totals.shipping}</span>
                        </div>
                        ${totals.discount > 0 ? `
                            <div class="summary-row discount">
                                <span>Discount</span>
                                <span class="value">-$${totals.discount}</span>
                            </div>
                        ` : ''}
                        <div class="summary-row total">
                            <span>Total</span>
                            <span class="total-price">$${totals.total}</span>
                        </div>
                    </div>
                    <button class="checkout-btn ${this.cartItems.length === 0 ? 'disabled' : ''}" 
                            ${this.cartItems.length === 0 ? 'disabled' : ''}>
                        <span>Proceed to Checkout</span>
                        <i class='bx bx-right-arrow-alt'></i>
                    </button>
                </div>
                
                <div class="promo-code">
                    <h2>Promo Code</h2>
                    <div class="promo-input-container">
                        <input type="text" id="promo-code" placeholder="Enter promo code" ${this.promoDiscount > 0 ? 'disabled' : ''}>
                        <button id="apply-promo" class="apply-promo-btn ${this.promoDiscount > 0 ? 'active' : ''}">
                            <span class="btn-text">${this.promoDiscount > 0 ? 'Applied' : 'Apply'}</span>
                            <span class="loading-spinner"></span>
                        </button>
                    </div>
                    <div class="promo-message ${this.promoDiscount > 0 ? 'success' : ''}">
                        ${this.promoDiscount > 0 ? 
                            `<i class='bx bx-check-circle'></i> Promo code applied: <strong>-$${this.promoDiscount.toFixed(2)}</strong>` : ''}
                    </div>
                </div>
                
                <div class="shipping-options">
                    <h2>Shipping</h2>
                    <div class="shipping-option ${this.shippingMethod === 'standard' ? 'selected' : ''}" data-shipping="standard">
                        <div class="option-info">
                            <div class="option-radio">
                                <div class="radio-dot ${this.shippingMethod === 'standard' ? 'selected' : ''}"></div>
                            </div>
                            <div class="option-details">
                                <div class="option-name-wrapper">
                                    <span class="option-name">Standard Delivery</span>
                                    <span class="option-estimate">3-5 business days</span>
                                </div>
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
                                <div class="option-name-wrapper">
                                    <span class="option-name">Express Delivery</span>
                                    <span class="option-estimate">1-2 business days</span>
                                </div>
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
            const applyBtn = e.target.closest('#apply-promo');
            if (!applyBtn) return;
            
            const promoInput = document.getElementById('promo-code');
            const promoMessage = document.querySelector('.promo-message');
            
            if (!promoInput || !promoMessage) return;
            
            const code = promoInput.value.trim();
            
            if (code === '') {
                promoMessage.innerHTML = '<i class="bx bx-error-circle"></i> Please enter a promo code';
                promoMessage.className = 'promo-message error';
                
                // Add shake animation to the input field
                promoInput.classList.add('shake');
                setTimeout(() => promoInput.classList.remove('shake'), 500);
                return;
            }
            
            // Add loading state with improved animation
            applyBtn.classList.add('loading');
            
            // Simulate API call with timeout
            setTimeout(() => {
                // For demo purposes, let's say "SAVE20" gives a 20% discount
                if (code.toUpperCase() === 'SAVE20') {
                    const subtotal = parseFloat(this.calculateTotals().subtotal);
                    this.promoCode = code;
                    this.promoDiscount = subtotal * 0.2; // 20% discount
                    
                    // Update UI for success
                    applyBtn.classList.remove('loading');
                    applyBtn.classList.add('success');
                    promoMessage.innerHTML = `<i class='bx bx-check-circle'></i> Promo code applied: <strong>-$${this.promoDiscount.toFixed(2)}</strong>`;
                    promoMessage.className = 'promo-message success';
                    
                    // Add confetti effect
                    this.createConfettiEffect(applyBtn);
                    
                    // Disable input field
                    promoInput.disabled = true;
                    
                    // Update button text
                    applyBtn.querySelector('.btn-text').textContent = 'Applied';
                    
                    // Show success animation
                    setTimeout(() => {
                        this.render(); // Re-render to update totals
                        
                        // Highlight the total price after render
                        setTimeout(() => {
                            const totalPrice = document.querySelector('.total-price');
                            if (totalPrice) {
                                totalPrice.classList.add('highlight-price');
                                setTimeout(() => totalPrice.classList.remove('highlight-price'), 2000);
                            }
                        }, 100);
                    }, 1000);
                } else {
                    // Update UI for error
                    applyBtn.classList.remove('loading');
                    applyBtn.classList.add('error');
                    promoMessage.innerHTML = '<i class="bx bx-x-circle"></i> Invalid promo code';
                    promoMessage.className = 'promo-message error';
                    
                    // Reset after animation
                    setTimeout(() => {
                        applyBtn.classList.remove('error');
                    }, 1000);
                }
            }, 1500);
        });

        // Handle shipping option selection
        document.addEventListener('click', (e) => {
            const shippingOption = e.target.closest('.shipping-option');
            if (!shippingOption) return;
            
            const method = shippingOption.dataset.shipping;
            
            // Don't do anything if the same option is clicked
            if (this.shippingMethod === method) return;
            
            // Add animation class
            shippingOption.classList.add('selecting');
            
            // Short delay before updating to show animation
            setTimeout(() => {
                this.shippingMethod = method;
                this.render();
                
                // Highlight the shipping amount after render
                setTimeout(() => {
                    const shippingValue = document.querySelector('.shipping-value');
                    if (shippingValue) {
                        shippingValue.classList.add('highlight-value');
                        setTimeout(() => shippingValue.classList.remove('highlight-value'), 1500);
                    }
                    
                    // Also highlight the total since it changed
                    const totalPrice = document.querySelector('.total-price');
                    if (totalPrice) {
                        totalPrice.classList.add('highlight-price');
                        setTimeout(() => totalPrice.classList.remove('highlight-price'), 1500);
                    }
                }, 100);
            }, 300);
        });

        // Handle checkout button
        document.addEventListener('click', (e) => {
            const checkoutBtn = e.target.closest('.checkout-btn');
            if (!checkoutBtn || checkoutBtn.classList.contains('disabled')) return;
            
            // Add click animation
            checkoutBtn.classList.add('clicked');
            
            setTimeout(() => {
                // In a real app, you would redirect to checkout page or show checkout modal
                alert('Proceeding to checkout with total amount: $' + this.calculateTotals().total);
                checkoutBtn.classList.remove('clicked');
            }, 300);
        });
    }

    createConfettiEffect(element) {
        // Create confetti container
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        document.body.appendChild(confettiContainer);
        
        // Position confetti container near the element
        const rect = element.getBoundingClientRect();
        confettiContainer.style.position = 'fixed';
        confettiContainer.style.top = `${rect.top + rect.height / 2}px`;
        confettiContainer.style.left = `${rect.left + rect.width / 2}px`;
        confettiContainer.style.width = '0';
        confettiContainer.style.height = '0';
        confettiContainer.style.zIndex = '9999';
        
        // Create confetti pieces
        const colors = ['#5d5fef', '#4caf50', '#ff9800', '#e91e63', '#2196f3'];
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = '0px';
            confetti.style.top = '0px';
            confetti.style.width = `${Math.random() * 10 + 5}px`;
            confetti.style.height = `${Math.random() * 5 + 3}px`;
            confetti.style.position = 'absolute';
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.opacity = '1';
            confetti.style.transition = `all ${Math.random() * 1 + 1}s ease`;
            
            confettiContainer.appendChild(confetti);
            
            // Animate confetti after a small delay
            setTimeout(() => {
                const spread = 100;
                confetti.style.transform = `translate(${(Math.random() - 0.5) * spread * 2}px, ${(Math.random() - 0.2) * spread}px) rotate(${Math.random() * 360}deg)`;
                confetti.style.opacity = '0';
            }, 10);
        }
        
        // Remove confetti container after animation
        setTimeout(() => {
            confettiContainer.remove();
        }, 2000);
    }
}