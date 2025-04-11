export default class Settings {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.activeTab = 'account'; // Default tab
        this.paymentMethods = [
            { id: 1, type: 'visa', last4: '4224', expiryMonth: '04', expiryYear: '25', cardHolder: 'John Doe' },
            { id: 2, type: 'mastercard', last4: '8821', expiryMonth: '12', expiryYear: '24', cardHolder: 'John Doe' }
        ];
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
        this.setupNotificationContainer();
    }

    setupNotificationContainer() {
        if (!document.querySelector('.notification-container')) {
            const container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
    }

    render() {
        const settingsContentHTML = `
            <div class="settings-content">
                <div class="main-content-container">
                    <div class="settings-header">
                        <h1>Settings</h1>
                    </div>
                    
                    <div class="settings-tabs">
                        <button class="tab-button ${this.activeTab === 'account' ? 'active' : ''}" data-tab="account">
                            <i class='bx bx-user'></i>
                            <span>Account</span>
                        </button>
                        <button class="tab-button ${this.activeTab === 'payment' ? 'active' : ''}" data-tab="payment">
                            <i class='bx bx-credit-card'></i>
                            <span>Payment Methods</span>
                        </button>
                        <button class="tab-button ${this.activeTab === 'notifications' ? 'active' : ''}" data-tab="notifications">
                            <i class='bx bx-bell'></i>
                            <span>Notifications</span>
                        </button>
                        <button class="tab-button ${this.activeTab === 'security' ? 'active' : ''}" data-tab="security">
                            <i class='bx bx-lock'></i>
                            <span>Security</span>
                        </button>
                        <button class="tab-button ${this.activeTab === 'language' ? 'active' : ''}" data-tab="language">
                            <i class='bx bx-globe'></i>
                            <span>Language</span>
                        </button>
                    </div>
                    
                    <div class="settings-content-body">
                        ${this.renderTabContent()}
                    </div>
                </div>
            </div>
        `;

        const settingsContentContainer = document.createElement('div');
        settingsContentContainer.innerHTML = settingsContentHTML;

        const existingSettingsContent = document.querySelector('.settings-content');
        if (existingSettingsContent) {
            existingSettingsContent.replaceWith(settingsContentContainer.firstElementChild);
        } else {
            this.container.appendChild(settingsContentContainer.firstElementChild);
        }
    }

    renderTabContent() {
        switch (this.activeTab) {
            case 'account':
                return this.renderAccountTab();
            case 'payment':
                return this.renderPaymentTab();
            case 'notifications':
                return this.renderNotificationsTab();
            case 'security':
                return this.renderSecurityTab();
            case 'language':
                return this.renderLanguageTab();
            default:
                return this.renderAccountTab();
        }
    }

    renderAccountTab() {
        return `
            <div class="account-settings">
                <div class="settings-section">
                    <h2>Personal Information</h2>
                    <p>Update your personal details here.</p>
                    
                    <form class="settings-form personal-info-form" id="personal-info-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="first-name">First Name</label>
                                <input type="text" id="first-name" value="John" required>
                                <div class="error-message hidden">This field is required</div>
                            </div>
                            <div class="form-group">
                                <label for="last-name">Last Name</label>
                                <input type="text" id="last-name" value="Doe" required>
                                <div class="error-message hidden">This field is required</div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="email">Email Address</label>
                                <input type="email" id="email" value="john.doe@example.com" required>
                                <div class="error-message hidden">Please enter a valid email address</div>
                            </div>
                            <div class="form-group">
                                <label for="phone">Phone Number</label>
                                <input type="tel" id="phone" value="+1 (555) 123-4567" required>
                                <div class="error-message hidden">Please enter a valid phone number</div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="save-button btn-animate">
                                <i class='bx bx-save'></i>
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>

                <div class="settings-section">
                    <h2>Shipping Address</h2>
                    <p>Update your shipping information.</p>
                    
                    <form class="settings-form" id="shipping-address-form">
                        <div class="form-group">
                            <label for="street-address">Street Address</label>
                            <input type="text" id="street-address" value="123 Main Street" required>
                            <div class="error-message hidden">This field is required</div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="city">City</label>
                                <input type="text" id="city" value="New York" required>
                                <div class="error-message hidden">This field is required</div>
                            </div>
                            <div class="form-group">
                                <label for="state">State/Province</label>
                                <input type="text" id="state" value="NY" required>
                                <div class="error-message hidden">This field is required</div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="zip">ZIP/Postal Code</label>
                                <input type="text" id="zip" value="10001" required>
                                <div class="error-message hidden">This field is required</div>
                            </div>
                            <div class="form-group">
                                <label for="country">Country</label>
                                <select id="country" required>
                                    <option value="us" selected>United States</option>
                                    <option value="ca">Canada</option>
                                    <option value="uk">United Kingdom</option>
                                    <option value="au">Australia</option>
                                    <option value="jp">Japan</option>
                                </select>
                                <div class="error-message hidden">Please select a country</div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="save-button btn-animate">
                                <i class='bx bx-save'></i>
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    renderPaymentTab() {
        const paymentCards = this.paymentMethods.map(card => {
            const cardType = card.type;
            const iconClass = cardType === 'visa' ? 'bxl-visa' : 'bxl-mastercard';
            
            return `
                <div class="payment-method-card" data-id="${card.id}">
                    <div class="card-icon">
                        <i class='bx ${iconClass}'></i>
                    </div>
                    <div class="card-details">
                        <div class="card-name">${cardType.charAt(0).toUpperCase() + cardType.slice(1)} ending in ${card.last4}</div>
                        <div class="card-expiry">Expires ${card.expiryMonth}/${card.expiryYear}</div>
                    </div>
                    <div class="card-actions">
                        <button class="edit-btn" title="Edit card">
                            <i class='bx bx-edit'></i>
                        </button>
                        <button class="delete-btn" title="Remove card">
                            <i class='bx bx-trash'></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="payment-settings">
                <div class="settings-section">
                    <h2>Payment Methods</h2>
                    <p>Manage your payment methods.</p>
                    
                    <div class="payment-methods-list">
                        ${paymentCards.length ? paymentCards : '<p>No payment methods added yet.</p>'}
                    </div>
                    
                    <button class="add-payment-method btn-animate">
                        <i class='bx bx-plus'></i>
                        Add Payment Method
                    </button>
                </div>
            </div>
        `;
    }

    renderNotificationsTab() {
        return `
            <div class="notification-settings">
                <div class="settings-section">
                    <h2>Notification Preferences</h2>
                    <p>Manage how you receive notifications.</p>
                    
                    <form class="settings-form" id="notifications-form">
                        <div class="notification-options">
                            <div class="notification-option">
                                <div class="option-details">
                                    <div class="option-name">Order Updates</div>
                                    <div class="option-description">Receive updates about your orders.</div>
                                </div>
                                <div class="toggle-switch">
                                    <input type="checkbox" id="order-updates" class="toggle-input" checked>
                                    <label for="order-updates" class="toggle-label"></label>
                                </div>
                            </div>
                            
                            <div class="notification-option">
                                <div class="option-details">
                                    <div class="option-name">Promotions</div>
                                    <div class="option-description">Receive emails about new promotions and deals.</div>
                                </div>
                                <div class="toggle-switch">
                                    <input type="checkbox" id="promotions" class="toggle-input" checked>
                                    <label for="promotions" class="toggle-label"></label>
                                </div>
                            </div>
                            
                            <div class="notification-option">
                                <div class="option-details">
                                    <div class="option-name">Newsletter</div>
                                    <div class="option-description">Subscribe to our monthly newsletter.</div>
                                </div>
                                <div class="toggle-switch">
                                    <input type="checkbox" id="newsletter" class="toggle-input">
                                    <label for="newsletter" class="toggle-label"></label>
                                </div>
                            </div>
                            
                            <div class="notification-option">
                                <div class="option-details">
                                    <div class="option-name">Product Updates</div>
                                    <div class="option-description">Get notified when products you've viewed are on sale.</div>
                                </div>
                                <div class="toggle-switch">
                                    <input type="checkbox" id="product-updates" class="toggle-input" checked>
                                    <label for="product-updates" class="toggle-label"></label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="save-button btn-animate">
                                <i class='bx bx-save'></i>
                                Save Preferences
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    renderSecurityTab() {
        return `
            <div class="security-settings">
                <div class="settings-section">
                    <h2>Change Password</h2>
                    <p>Update your password to keep your account secure.</p>
                    
                    <form class="settings-form" id="password-form">
                        <div class="form-group">
                            <label for="current-password">Current Password</label>
                            <div class="password-input-container">
                                <input type="password" id="current-password" placeholder="Enter current password" required>
                                <button type="button" class="toggle-password">
                                    <i class='bx bx-show'></i>
                                </button>
                            </div>
                            <div class="error-message hidden">This field is required</div>
                        </div>
                        
                        <div class="form-group">
                            <label for="new-password">New Password</label>
                            <div class="password-input-container">
                                <input type="password" id="new-password" placeholder="Enter new password" required>
                                <button type="button" class="toggle-password">
                                    <i class='bx bx-show'></i>
                                </button>
                            </div>
                            <div class="password-strength-meter">
                                <div class="strength-bar" id="password-strength-bar"></div>
                                <span class="strength-text" id="password-strength-text">Password strength</span>
                            </div>
                            <div class="error-message hidden">Password must be at least 8 characters</div>
                        </div>
                        
                        <div class="form-group">
                            <label for="confirm-password">Confirm New Password</label>
                            <div class="password-input-container">
                                <input type="password" id="confirm-password" placeholder="Confirm new password" required>
                                <button type="button" class="toggle-password">
                                    <i class='bx bx-show'></i>
                                </button>
                            </div>
                            <div class="error-message hidden">Passwords do not match</div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="save-button btn-animate">
                                <i class='bx bx-lock'></i>
                                Update Password
                            </button>
                            <button type="button" class="forgot-password-button">
                                Forgot password?
                            </button>
                        </div>
                    </form>
                </div>

                <div class="settings-section">
                    <h2>Two-Factor Authentication</h2>
                    <p>Add an extra layer of security to your account.</p>
                    
                    <div class="tfa-container">
                        <p class="tfa-description">
                            When two-factor authentication is enabled, you'll be required to enter a security code in addition to your password when signing in.
                        </p>
                        <button class="tfa-button btn-animate">
                            <i class='bx bx-shield-quarter'></i>
                            Enable Two-Factor Authentication
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderLanguageTab() {
        return `
            <div class="language-settings">
                <div class="settings-section">
                    <h2>Language & Region</h2>
                    <p>Customize your language and regional preferences.</p>
                    
                    <form class="settings-form" id="language-form">
                        <div class="form-group">
                            <label for="language">Language</label>
                            <select id="language" required>
                                <option value="en" selected>English</option>
                                <option value="es">Español (Spanish)</option>
                                <option value="fr">Français (French)</option>
                                <option value="de">Deutsch (German)</option>
                                <option value="ja">日本語 (Japanese)</option>
                                <option value="zh">中文 (Chinese)</option>
                                <option value="ar">العربية (Arabic)</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="currency">Currency</label>
                            <select id="currency" required>
                                <option value="usd" selected>USD ($) - US Dollar</option>
                                <option value="eur">EUR (€) - Euro</option>
                                <option value="gbp">GBP (£) - British Pound</option>
                                <option value="jpy">JPY (¥) - Japanese Yen</option>
                                <option value="cad">CAD ($) - Canadian Dollar</option>
                                <option value="aud">AUD ($) - Australian Dollar</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="timezone">Time Zone</label>
                            <select id="timezone" required>
                                <option value="utc" selected>UTC+00:00 - Coordinated Universal Time</option>
                                <option value="est">UTC-05:00 - Eastern Standard Time</option>
                                <option value="cst">UTC-06:00 - Central Standard Time</option>
                                <option value="mst">UTC-07:00 - Mountain Standard Time</option>
                                <option value="pst">UTC-08:00 - Pacific Standard Time</option>
                                <option value="cet">UTC+01:00 - Central European Time</option>
                                <option value="jst">UTC+09:00 - Japan Standard Time</option>
                            </select>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="save-button btn-animate">
                                <i class='bx bx-save'></i>
                                Save Preferences
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Tab switching
        document.addEventListener('click', e => {
            const tabButton = e.target.closest('.tab-button');
            if (tabButton) {
                this.activeTab = tabButton.dataset.tab;
                this.render();
                this.setupTabSpecificEventListeners();
            }
        });

        this.setupTabSpecificEventListeners();
    }

    setupTabSpecificEventListeners() {
        // Personal information form validation
        const personalInfoForm = document.getElementById('personal-info-form');
        if (personalInfoForm) {
            personalInfoForm.addEventListener('submit', e => {
                e.preventDefault();
                if (this.validateForm(personalInfoForm)) {
                    this.animateSaveButton(e.submitter);
                    this.showNotification({
                        title: 'Personal information updated',
                        message: 'Your changes have been saved successfully.',
                        type: 'success'
                    });
                }
            });
        }

        // Shipping address form validation
        const shippingForm = document.getElementById('shipping-address-form');
        if (shippingForm) {
            shippingForm.addEventListener('submit', e => {
                e.preventDefault();
                if (this.validateForm(shippingForm)) {
                    this.animateSaveButton(e.submitter);
                    this.showNotification({
                        title: 'Shipping address updated',
                        message: 'Your changes have been saved successfully.',
                        type: 'success'
                    });
                }
            });
        }

        // Notification preferences form
        const notificationsForm = document.getElementById('notifications-form');
        if (notificationsForm) {
            notificationsForm.addEventListener('submit', e => {
                e.preventDefault();
                this.animateSaveButton(e.submitter);
                this.showNotification({
                    title: 'Notification preferences updated',
                    message: 'Your changes have been saved successfully.',
                    type: 'success'
                });
            });
        }

        // Password form validation
        const passwordForm = document.getElementById('password-form');
        if (passwordForm) {
            const newPassword = passwordForm.querySelector('#new-password');
            const confirmPassword = passwordForm.querySelector('#confirm-password');
            
            if (newPassword) {
                newPassword.addEventListener('input', () => this.updatePasswordStrength(newPassword.value));
            }
            
            if (confirmPassword) {
                confirmPassword.addEventListener('input', () => {
                    const errorElem = confirmPassword.parentElement.nextElementSibling;
                    if (newPassword.value !== confirmPassword.value) {
                        errorElem.textContent = "Passwords do not match";
                        errorElem.classList.remove('hidden');
                    } else {
                        errorElem.classList.add('hidden');
                    }
                });
            }
            
            passwordForm.addEventListener('submit', e => {
                e.preventDefault();
                if (this.validatePasswordForm(passwordForm)) {
                    this.animateSaveButton(e.submitter);
                    this.showNotification({
                        title: 'Password updated',
                        message: 'Your password has been changed successfully.',
                        type: 'success'
                    });
                }
            });
        }

        // Language form
        const languageForm = document.getElementById('language-form');
        if (languageForm) {
            languageForm.addEventListener('submit', e => {
                e.preventDefault();
                this.animateSaveButton(e.submitter);
                this.showNotification({
                    title: 'Language preferences updated',
                    message: 'Your changes have been saved successfully.',
                    type: 'success'
                });
            });
        }

        // Toggle password visibility
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', () => {
                const passwordInput = btn.previousElementSibling;
                const icon = btn.querySelector('i');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.className = 'bx bx-hide';
                } else {
                    passwordInput.type = 'password';
                    icon.className = 'bx bx-show';
                }
            });
        });

        // Forgot password button
        const forgotPasswordButton = document.querySelector('.forgot-password-button');
        if (forgotPasswordButton) {
            forgotPasswordButton.addEventListener('click', () => {
                this.showPasswordResetContainer();
            });
        }

        // TFA button
        const tfaButton = document.querySelector('.tfa-button');
        if (tfaButton) {
            tfaButton.addEventListener('click', () => {
                this.animateSaveButton(tfaButton);
                this.showNotification({
                    title: 'Two-factor authentication',
                    message: 'Setup process has been initiated.',
                    type: 'info'
                });
            });
        }

        // Payment methods
        this.setupPaymentMethodsActions();
    }

    setupPaymentMethodsActions() {
        // Delete payment method
        document.querySelectorAll('.payment-method-card .delete-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const card = btn.closest('.payment-method-card');
                const cardId = parseInt(card.dataset.id);
                
                // Apply fade out animation
                card.classList.add('fade-out');
                
                // Show notification with undo option
                this.showNotification({
                    title: 'Payment method removed',
                    message: 'Your payment method has been deleted.',
                    type: 'success',
                    hasUndo: true,
                    onUndo: () => {
                        // Store the removed method before removing it from the array
                        const removedMethod = this.paymentMethods.find(method => method.id === cardId);
                        
                        // Remove from data only after saving the reference
                        this.paymentMethods = this.paymentMethods.filter(method => method.id !== cardId);
                        
                        // Restore the payment method when undoing
                        const restoreMethod = () => {
                            this.paymentMethods.push(removedMethod);
                            this.render(); // Re-render to show restored card
                        };
                        
                        return restoreMethod; // Return the restore function
                    }
                });
                
                // Remove card after animation
                setTimeout(() => {
                    this.paymentMethods = this.paymentMethods.filter(method => method.id !== cardId);
                    this.render();
                    this.setupTabSpecificEventListeners();
                }, 300);
            });
        });
        
        // Edit payment method
        document.querySelectorAll('.payment-method-card .edit-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const card = btn.closest('.payment-method-card');
                const cardId = parseInt(card.dataset.id);
                const cardData = this.paymentMethods.find(method => method.id === cardId);
                
                if (cardData) {
                    this.showPaymentEditModal(cardData);
                }
            });
        });
        
        // Add payment method button
        const addPaymentButton = document.querySelector('.add-payment-method');
        if (addPaymentButton) {
            addPaymentButton.addEventListener('click', () => {
                this.showPaymentEditModal();
            });
        }
    }
    
    showPaymentEditModal(cardData = null) {
        const isEditing = !!cardData;
        
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content payment-modal">
                <div class="modal-header">
                    <h2>${isEditing ? 'Edit Payment Method' : 'Add Payment Method'}</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="payment-form" class="settings-form">
                        <div class="form-group">
                            <label for="card-type">Card Type</label>
                            <select id="card-type" required>
                                <option value="visa" ${isEditing && cardData.type === 'visa' ? 'selected' : ''}>Visa</option>
                                <option value="mastercard" ${isEditing && cardData.type === 'mastercard' ? 'selected' : ''}>Mastercard</option>
                                <option value="amex">American Express</option>
                                <option value="discover">Discover</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="card-number">Card Number</label>
                            <input type="text" id="card-number" placeholder="1234 5678 9012 3456" 
                                value="${isEditing ? '•••• •••• •••• ' + cardData.last4 : ''}" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="expiry-month">Expiration Month</label>
                                <select id="expiry-month" required>
                                    ${Array.from({length: 12}, (_, i) => {
                                        const month = String(i + 1).padStart(2, '0');
                                        return `<option value="${month}" ${isEditing && cardData.expiryMonth === month ? 'selected' : ''}>${month}</option>`;
                                    }).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="expiry-year">Expiration Year</label>
                                <select id="expiry-year" required>
                                    ${Array.from({length: 10}, (_, i) => {
                                        const year = String(new Date().getFullYear() + i).slice(-2);
                                        return `<option value="${year}" ${isEditing && cardData.expiryYear === year ? 'selected' : ''}>${year}</option>`;
                                    }).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="cvv">CVV</label>
                                <input type="text" id="cvv" placeholder="123" maxlength="4" required>
                            </div>
                            <div class="form-group">
                                <label for="card-holder">Card Holder Name</label>
                                <input type="text" id="card-holder" placeholder="John Doe" 
                                    value="${isEditing ? cardData.cardHolder : ''}" required>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="cancel-btn">Cancel</button>
                    <button class="save-payment-btn btn-animate">${isEditing ? 'Update' : 'Add'} Card</button>
                </div>
            </div>
        `;

        // Add modal to DOM
        document.body.appendChild(modal);

        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);

        // Close modal function
        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        };

        // Modal event listeners
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.querySelector('.cancel-btn').addEventListener('click', closeModal);
        
        modal.querySelector('.save-payment-btn').addEventListener('click', e => {
            const form = modal.querySelector('#payment-form');
            if (this.validateForm(form)) {
                this.animateSaveButton(e.target);
                
                const cardType = form.querySelector('#card-type').value;
                const cardNumber = form.querySelector('#card-number').value;
                const expiryMonth = form.querySelector('#expiry-month').value;
                const expiryYear = form.querySelector('#expiry-year').value;
                const cardHolder = form.querySelector('#card-holder').value;
                
                // Extract last 4 digits of card number or use existing
                const last4 = isEditing ? cardData.last4 : cardNumber.replace(/\D/g, '').slice(-4);
                
                if (isEditing) {
                    // Update existing card
                    const index = this.paymentMethods.findIndex(method => method.id === cardData.id);
                    if (index !== -1) {
                        this.paymentMethods[index] = {
                            ...cardData,
                            type: cardType,
                            expiryMonth,
                            expiryYear,
                            cardHolder
                        };
                    }
                } else {
                    // Add new card
                    const newId = this.paymentMethods.length > 0 
                        ? Math.max(...this.paymentMethods.map(m => m.id)) + 1 
                        : 1;
                        
                    this.paymentMethods.push({
                        id: newId,
                        type: cardType,
                        last4,
                        expiryMonth,
                        expiryYear,
                        cardHolder
                    });
                }
                
                closeModal();
                this.showNotification({
                    title: isEditing ? 'Card updated' : 'Card added',
                    message: isEditing 
                        ? 'Your payment method has been updated successfully.' 
                        : 'Your payment method has been added successfully.',
                    type: 'success'
                });
                
                this.render();
                this.setupTabSpecificEventListeners();
            }
        });
        
        // Close on outside click
        modal.addEventListener('click', e => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    showPasswordResetContainer() {
        // Create container for reset password interface
        const overlay = document.createElement('div');
        overlay.className = 'modal';
        overlay.innerHTML = `
            <div class="password-reset-container">
                <div class="password-reset-icon">
                    <i class='bx bx-lock-open'></i>
                </div>
                <h3>Reset Your Password</h3>
                <p>We'll send a verification code to your email to reset your password.</p>
                
                <form class="reset-form" id="reset-password-form">
                    <div class="form-group">
                        <label for="reset-email">Email Address</label>
                        <input type="email" id="reset-email" placeholder="Enter your email" required>
                        <div class="error-message hidden">Please enter a valid email address</div>
                    </div>
                    
                    <button type="submit" class="reset-password-btn btn-animate">
                        Send Code
                    </button>
                </form>
                
                <!-- Verification code step (initially hidden) -->
                <div class="verification-step" style="display: none;">
                    <p>Enter the 6-digit code sent to your email</p>
                    <div class="verification-code-container">
                        <input type="text" maxlength="1" class="code-input" autofocus>
                        <input type="text" maxlength="1" class="code-input">
                        <input type="text" maxlength="1" class="code-input">
                        <input type="text" maxlength="1" class="code-input">
                        <input type="text" maxlength="1" class="code-input">
                        <input type="text" maxlength="1" class="code-input">
                    </div>
                    <div class="code-timer">Code expires in <span class="countdown">5:00</span></div>
                    <button class="verify-code-btn btn-animate">Verify Code</button>
                    <button class="resend-code-btn">Didn't receive the code? Resend</button>
                </div>
                
                <a href="#" class="back-to-login">
                    <i class='bx bx-arrow-back'></i> Back
                </a>
            </div>
        `;

        // Add to DOM
        document.body.appendChild(overlay);
        
        // Show with animation
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);
        
        // Event listeners
        overlay.querySelector('#back-to-security').addEventListener('click', e => {
            e.preventDefault();
            closeResetForm();
        });
        
        overlay.addEventListener('click', e => {
            if (e.target === overlay) {
                closeResetForm();
            }
        });
        
        overlay.querySelector('.reset-form').addEventListener('submit', e => {
            e.preventDefault();
            const button = e.submitter;
            this.animateSaveButton(button);
            
            // Change content to verification screen
            const container = overlay.querySelector('.password-reset-container');
            container.innerHTML = `
                <div class="password-reset-icon">
                    <i class='bx bx-envelope'></i>
                </div>
                <h3>Check Your Email</h3>
                <p>We've sent a password reset link to <strong>john.doe@example.com</strong>. The link will expire in 30 minutes.</p>
                <p>Didn't receive the email? Check your spam folder or try again.</p>
                
                <button class="reset-password-btn btn-animate" id="resend-btn">
                    Resend Email
                </button>
                
                <a href="#" class="back-to-login" id="close-reset">
                    <i class='bx bx-x'></i> Close
                </a>
            `;
            
            // New event listeners for the changed UI
            container.querySelector('#resend-btn').addEventListener('click', () => {
                this.showNotification({
                    title: 'Email sent again',
                    message: 'Please check your inbox or spam folder.',
                    type: 'info'
                });
            });
            
            container.querySelector('#close-reset').addEventListener('click', e => {
                e.preventDefault();
                closeResetForm();
            });
        });
        
        // Close function
        const closeResetForm = () => {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
            }, 300);
        };
    }
    
    updatePasswordStrength(password) {
        // Simple password strength calculator
        const strengthBar = document.getElementById('password-strength-bar');
        const strengthText = document.getElementById('password-strength-text');
        
        if (!strengthBar || !strengthText) return;
        
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (password.match(/[A-Z]/)) strength += 1;
        if (password.match(/[a-z]/)) strength += 1;
        if (password.match(/[0-9]/)) strength += 1;
        if (password.match(/[^A-Za-z0-9]/)) strength += 1;
        
        const percent = (strength / 5) * 100;
        strengthBar.style.width = `${percent}%`;
        
        let strengthLabel = 'Very Weak';
        let strengthColor = '#e53935';
        
        if (strength === 1) {
            strengthLabel = 'Weak';
            strengthColor = '#ff9800';
        } else if (strength === 2) {
            strengthLabel = 'Fair';
            strengthColor = '#ffc107';
        } else if (strength === 3) {
            strengthLabel = 'Good';
            strengthColor = '#8bc34a';
        } else if (strength >= 4) {
            strengthLabel = 'Strong';
            strengthColor = '#4caf50';
        }
        
        strengthBar.style.backgroundColor = strengthColor;
        strengthText.textContent = `Password strength: ${strengthLabel}`;
        strengthText.style.color = strengthColor;
    }
    
    validateForm(form) {
        const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            // Find the error message element (next sibling or child of parent)
            const errorElem = field.nextElementSibling?.classList?.contains('error-message') 
                ? field.nextElementSibling 
                : field.parentElement.querySelector('.error-message') || 
                  field.parentElement.nextElementSibling?.classList?.contains('error-message') 
                  ? field.parentElement.nextElementSibling : null;
                  
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error-input');
                
                if (errorElem) {
                    errorElem.textContent = 'This field is required';
                    errorElem.classList.remove('hidden');
                }
            } else if (field.type === 'email' && !this.isValidEmail(field.value)) {
                isValid = false;
                field.classList.add('error-input');
                
                if (errorElem) {
                    errorElem.textContent = 'Please enter a valid email address';
                    errorElem.classList.remove('hidden');
                }
            } else {
                field.classList.remove('error-input');
                if (errorElem) {
                    errorElem.classList.add('hidden');
                }
            }
        });
        
        return isValid;
    }
    
    validatePasswordForm(form) {
        // First validate required fields
        if (!this.validateForm(form)) return false;
        
        const newPassword = form.querySelector('#new-password');
        const confirmPassword = form.querySelector('#confirm-password');
        let isValid = true;
        
        // New password validation
        if (newPassword.value.length < 8) {
            isValid = false;
            newPassword.classList.add('error-input');
            const errorElem = newPassword.parentElement.nextElementSibling.nextElementSibling;
            errorElem.textContent = 'Password must be at least 8 characters';
            errorElem.classList.remove('hidden');
        }
        
        // Password match validation
        if (newPassword.value !== confirmPassword.value) {
            isValid = false;
            confirmPassword.classList.add('error-input');
            const errorElem = confirmPassword.parentElement.nextElementSibling;
            errorElem.textContent = 'Passwords do not match';
            errorElem.classList.remove('hidden');
        }
        
        return isValid;
    }
    
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    animateSaveButton(button) {
        if (!button) return;
        
        // Add ripple effect
        button.classList.add('btn-animate');
        
        // Add success animation
        button.classList.add('save-success');
        
        // Remove animations after they complete
        setTimeout(() => {
            button.classList.remove('save-success');
        }, 600);
    }
    
    // Function to display success animation
    showSuccessAnimation() {
        const animContainer = document.createElement('div');
        animContainer.className = 'success-animation-container';
        animContainer.innerHTML = `
            <div class="success-animation">
                <i class='bx bx-check'></i>
            </div>
        `;
        
        document.body.appendChild(animContainer);
        
        setTimeout(() => {
            animContainer.classList.add('active');
        }, 10);
        
        setTimeout(() => {
            animContainer.classList.remove('active');
            setTimeout(() => {
                animContainer.remove();
            }, 300);
        }, 1500);
    }

    // Call this before showing success notifications
    // For example, in the payment method save function:
    savePaymentMethod() {
        if (this.validateForm(form)) {
            // Process form...
            
            // Show success animation then notification
            this.showSuccessAnimation();
            
            setTimeout(() => {
                this.showNotification({
                    title: 'Payment method added',
                    message: 'Your new card has been added successfully.',
                    type: 'success'
                });
            }, 1000);
            
            closeModal();
            this.render();
        }
    }

    showNotification({ title, message, type = 'success', duration = 5000, hasUndo = false, onUndo = null }) {
        // Create notification container if it doesn't exist
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type} fade-in`;
        const id = Date.now();
        notification.dataset.id = id;
        
        // Icon based on type
        let icon = 'bx-check-circle';
        if (type === 'error') icon = 'bx-error-circle';
        if (type === 'warning') icon = 'bx-error';
        if (type === 'info') icon = 'bx-info-circle';
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class='bx ${icon} notification-icon'></i>
                <div class="notification-text">
                    <p class="notification-title">${title}</p>
                    ${message ? `<p class="notification-message">${message}</p>` : ''}
                    ${hasUndo ? '<button class="undo-btn">Undo</button>' : ''}
                </div>
                <button class="close-notification-btn">
                    <i class='bx bx-x'></i>
                </button>
            </div>
            <div class="notification-progress"></div>
        `;
        
        // Add to container
        container.appendChild(notification);
        
        // Set up progress bar
        const progress = notification.querySelector('.notification-progress');
        progress.style.width = '100%';
        setTimeout(() => {
            progress.style.width = '0';
        }, 10);
        
        // Set up event listeners
        notification.querySelector('.close-notification-btn').addEventListener('click', () => {
            this.removeNotification(id);
        });
        
        if (hasUndo && onUndo) {
            notification.querySelector('.undo-btn').addEventListener('click', () => {
                onUndo();
                this.removeNotification(id);
            });
        }
        
        // Auto-dismiss
        setTimeout(() => {
            this.removeNotification(id);
        }, duration);
    }
    
    removeNotification(id, executeUndo = false) {
        const notification = document.querySelector(`.notification[data-id="${id}"]`);
        if (notification) {
            if (executeUndo && notification.undoFunction) {
                notification.undoFunction();
            }
            
            notification.classList.remove('fade-in');
            notification.classList.add('fade-out');
            
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }
}