export default class Settings {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.activeTab = 'account';
        this.editModes = {
            personalInfo: false,
            shippingAddress: false
        };
        this.userData = null;
        this.paymentMethods = [];
        this.init();
    }

    async init() {
        await this.loadUserData();
        await this.loadPaymentMethods();
        this.render();
        this.setupEventListeners();
        this.setupNotificationContainer();
    }

    async loadUserData() {
        try {
            const response = await fetch('../backend/api/get_user_settings.php');
            const data = await response.json();
            
            if (data.success) {
                this.userData = data.data.user;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            this.showNotification({
                title: 'Error',
                message: 'Failed to load user data',
                type: 'error'
            });
        }
    }

    async loadPaymentMethods() {
        try {
            const response = await fetch('../backend/api/get_payment_methods.php');
            const data = await response.json();
            
            if (data.success) {
                this.paymentMethods = data.data;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error loading payment methods:', error);
            this.showNotification({
                title: 'Error',
                message: 'Failed to load payment methods',
                type: 'error'
            });
        }
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
            case 'account': return this.renderAccountTab();
            case 'payment': return this.renderPaymentTab();
            case 'notifications': return this.renderNotificationsTab();
            case 'security': return this.renderSecurityTab();
            case 'language': return this.renderLanguageTab();
            default: return this.renderAccountTab();
        }
    }

    renderAccountTab() {
        if (!this.userData) return '<div>Loading...</div>';

        return `
            <div class="account-settings">
                <div class="settings-section">
                    <!-- Personal Information Section -->
                    <div class="section-header">
                        <h2>Personal Information</h2>
                    </div>
                    <p>Update your personal details here.</p>
                    
                    <form class="settings-form" id="personal-info-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="username">Username</label>
                                <input type="text" 
                                    id="username" 
                                    value="${this.userData.username || ''}"
                                    placeholder="Enter username" 
                                    required
                                    ${!this.editModes.personalInfo ? 'disabled' : ''}>
                                <div class="error-message hidden">This field is required</div>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="first-name">First Name</label>
                                <input type="text" 
                                    id="first-name" 
                                    value="${this.userData.first_name || ''}"
                                    placeholder="Enter first name" 
                                    required
                                    ${!this.editModes.personalInfo ? 'disabled' : ''}>
                                <div class="error-message hidden">This field is required</div>
                            </div>
                            <div class="form-group">
                                <label for="last-name">Last Name</label>
                                <input type="text" 
                                    id="last-name"  
                                    value="${this.userData.last_name || ''}"
                                    placeholder="Enter last name" 
                                    required
                                    ${!this.editModes.personalInfo ? 'disabled' : ''}>
                                <div class="error-message hidden">This field is required</div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="email">Email Address</label>
                                <input type="email" 
                                    id="email" 
                                    value="${this.userData.email || ''}"
                                    placeholder="Enter email address" 
                                    required
                                    ${!this.editModes.personalInfo ? 'disabled' : ''}>
                                <div class="error-message hidden">Please enter a valid email address</div>
                            </div>
                            <div class="form-group">
                                <label for="phone">Phone Number</label>
                                <input type="tel" 
                                    id="phone"  
                                    value="${this.userData.phone || ''}"
                                    placeholder="Enter phone number" 
                                    required
                                    ${!this.editModes.personalInfo ? 'disabled' : ''}>
                                <div class="error-message hidden">Please enter a valid phone number</div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            ${this.editModes.personalInfo ? `
                                <button type="button" class="cancel-button btn-animate">
                                    <i class='bx bx-x'></i>
                                    Cancel
                                </button>
                                <button type="submit" class="save-button btn-animate">
                                    <i class='bx bx-save'></i>
                                    Save Changes
                                </button>
                            ` : `
                                <button type="button" class="edit-button btn-animate">
                                    <i class='bx bx-edit'></i>
                                    Edit
                                </button>
                            `}
                        </div>
                    </form>
                </div>

                <div class="settings-section">
                    <!-- Shipping Address Section -->
                    <div class="section-header">
                        <h2>Shipping Address</h2>
                    </div>
                    <p>Update your shipping information.</p>
                    
                    <form class="settings-form" id="shipping-address-form">
                        <div class="form-group">
                            <label for="street-address">Street Address</label>
                            <input type="text" 
                                id="street-address" 
                                value="${this.userData.address || ''}"
                                placeholder="Enter street address" 
                                required
                                ${!this.editModes.shippingAddress ? 'disabled' : ''}>
                            <div class="error-message hidden">This field is required</div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="city">City</label>
                                <input type="text" 
                                    id="city" 
                                    value="${this.userData.city || ''}"
                                    placeholder="Enter city" 
                                    required
                                    ${!this.editModes.shippingAddress ? 'disabled' : ''}>
                            <div class="error-message hidden">This field is required</div>
                            </div>
                            <div class="form-group">
                                <label for="state">State/Province</label>
                                <input type="text" 
                                    id="state" 
                                    value="${this.userData.state || ''}"
                                    placeholder="Enter state/province" 
                                    required
                                    ${!this.editModes.shippingAddress ? 'disabled' : ''}>
                            <div class="error-message hidden">This field is required</div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="zip">ZIP/Postal Code</label>
                                <input type="text" 
                                    id="zip" 
                                    value="${this.userData.zip_code || ''}"
                                    placeholder="Enter ZIP/Postal code" 
                                    required
                                    ${!this.editModes.shippingAddress ? 'disabled' : ''}>
                            <div class="error-message hidden">This field is required</div>
                            </div>
                            <div class="form-group">
                                <label for="country">Country</label>
                                <select id="country" required ${!this.editModes.shippingAddress ? 'disabled' : ''}>
                                    <option value="us" ${this.userData.country === 'us' ? 'selected' : ''}>United States</option>
                                    <option value="ca" ${this.userData.country === 'ca' ? 'selected' : ''}>Canada</option>
                                    <option value="uk" ${this.userData.country === 'uk' ? 'selected' : ''}>United Kingdom</option>
                                    <option value="au" ${this.userData.country === 'au' ? 'selected' : ''}>Australia</option>
                                    <option value="jp" ${this.userData.country === 'jp' ? 'selected' : ''}>Japan</option>
                                </select>
                                <div class="error-message hidden">Please select a country</div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            ${this.editModes.shippingAddress ? `
                                <button type="button" class="cancel-button btn-animate">
                                    <i class='bx bx-x'></i>
                                    Cancel
                                </button>
                                <button type="submit" class="save-button btn-animate">
                                    <i class='bx bx-save'></i>
                                    Save Changes
                                </button>
                            ` : `
                                <button type="button" class="edit-button btn-animate">
                                    <i class='bx bx-edit'></i>
                                    Edit
                                </button>
                            `}
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    renderPaymentTab() {
        if (this.paymentMethods.length === 0) {
            return `
                <div class="payment-settings">
                    <div class="settings-section">
                        <h2>Payment Methods</h2>
                        <p>Manage your payment methods.</p>
                        
                        <div class="empty-state">
                            <i class='bx bx-credit-card-alt'></i>
                            <h3>No Payment Methods Added</h3>
                            <p>You haven't added any payment methods yet.</p>
                        </div>
                        
                        <button class="add-payment-method btn-animate">
                            <i class='bx bx-plus'></i>
                            Add Payment Method
                        </button>
                    </div>
                </div>
            `;
        }

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
        // Tab switching - use event delegation for better performance
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
        if (this.activeTab === 'account') {
            // Personal Info Edit Button
            const personalInfoEditBtn = document.querySelector('#personal-info-form .edit-button');
            if (personalInfoEditBtn) {
                personalInfoEditBtn.addEventListener('click', () => {
                    this.editModes.personalInfo = true;
                    this.render();
                    this.setupTabSpecificEventListeners();
                });
            }

            // Shipping Address Edit Button
            const shippingEditBtn = document.querySelector('#shipping-address-form .edit-button');
            if (shippingEditBtn) {
                shippingEditBtn.addEventListener('click', () => {
                    this.editModes.shippingAddress = true;
                    this.render();
                    this.setupTabSpecificEventListeners();
                });
            }

            // Cancel Buttons
            document.querySelectorAll('.cancel-button').forEach(btn => {
                btn.addEventListener('click', () => {
                    const form = btn.closest('form');
                    if (form.id === 'personal-info-form') {
                        this.editModes.personalInfo = false;
                    } else if (form.id === 'shipping-address-form') {
                        this.editModes.shippingAddress = false;
                    }
                    this.render();
                    this.setupTabSpecificEventListeners();
                });
            });

            // Personal info form submission
            const personalInfoForm = document.getElementById('personal-info-form');
            if (personalInfoForm) {
                personalInfoForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    if (this.validateForm(personalInfoForm)) {
                        await this.savePersonalInfo();
                    }
                });
            }

            // Shipping address form submission
            const shippingForm = document.getElementById('shipping-address-form');
            if (shippingForm) {
                shippingForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    if (this.validateForm(shippingForm)) {
                        await this.saveShippingAddress();
                    }
                });
            }
        }
        
        // Personal information form validation
        this.setupFormSubmitHandler('personal-info-form', 'Personal information updated');

        // Shipping address form validation
        this.setupFormSubmitHandler('shipping-address-form', 'Shipping address updated');

        // Notification preferences form
        this.setupFormSubmitHandler('notifications-form', 'Notification preferences updated');

        // Language form
        this.setupFormSubmitHandler('language-form', 'Language preferences updated');

        // Password form validation
        const passwordForm = document.getElementById('password-form');
        if (passwordForm) {
            this.setupPasswordFormHandlers(passwordForm);
        }

        // Toggle password visibility
        this.setupPasswordToggles();

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
                this.showSuccessAnimation();
                setTimeout(() => {
                    this.showNotification({
                        title: 'Two-factor authentication',
                        message: 'Setup process has been initiated.',
                        type: 'info'
                    });
                }, 1000);
            });
        }

        // Payment methods
        if (this.activeTab === 'payment') {
            this.setupPaymentMethodsActions();
        }
    }

    async savePersonalInfo() {
        if (!confirm('Are you sure you want to save these changes?')) {
            return;
        }

        const formData = new FormData();
        formData.append('username', document.getElementById('username').value);
        formData.append('first_name', document.getElementById('first-name').value);
        formData.append('last_name', document.getElementById('last-name').value);
        formData.append('email', document.getElementById('email').value);
        formData.append('phone', document.getElementById('phone').value);
        formData.append('action', 'update_personal');

        try {
            const response = await fetch('../backend/api/update_account.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                // Show success animation
                this.showSuccessAnimation();
                
                // Show notification
                setTimeout(() => {
                    this.showNotification({
                        title: 'Success',
                        message: 'Personal information updated successfully',
                        type: 'success'
                    });
                }, 1500);

                // Reset edit mode and reload data
                this.editModes.personalInfo = false;
                await this.loadUserData();
                this.render();
                this.setupTabSpecificEventListeners();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            this.showNotification({
                title: 'Error',
                message: error.message || 'Failed to update personal information',
                type: 'error'
            });
        }
    }

    async saveShippingAddress() {
        if (!confirm('Are you sure you want to save these changes?')) {
            return;
        }

        const formData = new FormData();
        formData.append('address', document.getElementById('street-address').value);
        formData.append('city', document.getElementById('city').value);
        formData.append('state', document.getElementById('state').value);
        formData.append('zip_code', document.getElementById('zip').value);
        formData.append('country', document.getElementById('country').value);
        formData.append('action', 'update_shipping');

        try {
            const response = await fetch('../backend/api/update_account.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                // Show success animation
                this.showSuccessAnimation();
                
                // Show notification
                setTimeout(() => {
                    this.showNotification({
                        title: 'Success',
                        message: 'Shipping address updated successfully',
                        type: 'success'
                    });
                }, 1500);

                // Reset edit mode and reload data
                this.editModes.shippingAddress = false;
                await this.loadUserData();
                this.render();
                this.setupTabSpecificEventListeners();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            this.showNotification({
                title: 'Error',
                message: error.message || 'Failed to update shipping address',
                type: 'error'
            });
        }
    }

    async savePaymentMethod(formData, isEditing = false) {
        try {
            const response = await fetch('../backend/api/manage_payment_method.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification({
                    title: isEditing ? 'Card updated' : 'Card added',
                    message: data.message,
                    type: 'success'
                });
                return true;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            this.showNotification({
                title: 'Error',
                message: error.message || 'Failed to save payment method',
                type: 'error'
            });
            return false;
        }
    }

    async deletePaymentMethod(paymentId) {
        const formData = new FormData();
        formData.append('action', 'delete');
        formData.append('payment_id', paymentId);

        try {
            const response = await fetch('../backend/api/manage_payment_method.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                await this.loadPaymentMethods();
                this.showNotification({
                    title: 'Payment method removed',
                    message: data.message,
                    type: 'success'
                });
                return true;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            this.showNotification({
                title: 'Error',
                message: error.message,
                type: 'error'
            });
            return false;
        }
    }

    setupFormSubmitHandler(formId, successTitle) {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', e => {
                e.preventDefault();
                if (this.validateForm(form)) {
                    this.animateSaveButton(e.submitter);
                    this.showSuccessAnimation();
                    
                    setTimeout(() => {
                        this.showNotification({
                            title: successTitle,
                            message: 'Your changes have been saved successfully.',
                            type: 'success'
                        });
                    }, 1000);
                }
            });
        }
    }

    setupPasswordFormHandlers(form) {
        const currentPassword = form.querySelector('#current-password');
        const newPassword = form.querySelector('#new-password');
        const confirmPassword = form.querySelector('#confirm-password');
        
        // Live password strength update
        if (newPassword) {
            newPassword.addEventListener('input', () => this.updatePasswordStrength(newPassword.value));
        }
        
        // Live password match validation
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
        
        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (this.validatePasswordForm(form)) {
                if (!confirm('Are you sure you want to change your password?')) {
                    return;
                }

                const formData = new FormData();
                formData.append('current_password', currentPassword.value);
                formData.append('new_password', newPassword.value);

                try {
                    const response = await fetch('../backend/api/update_password.php', {
                        method: 'POST',
                        body: formData
                    });

                    const data = await response.json();

                    if (data.success) {
                        this.animateSaveButton(e.submitter);
                        this.showSuccessAnimation();
                        
                        setTimeout(() => {
                            this.showNotification({
                                title: 'Password updated',
                                message: 'Your password has been changed successfully.',
                                type: 'success'
                            });
                        }, 1000);

                        // Clear the form
                        form.reset();
                    } else {
                        throw new Error(data.message);
                    }
                } catch (error) {
                    this.showNotification({
                        title: 'Error',
                        message: error.message || 'Failed to update password',
                        type: 'error'
                    });
                }
            }
        });
    }

    setupPasswordToggles() {
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
    }

    setupPaymentMethodsActions() {
        // Delete payment method
        document.querySelectorAll('.payment-method-card .delete-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const card = btn.closest('.payment-method-card');
                const cardId = parseInt(card.dataset.id);
                
                // Store the card before removing it
                const removedCard = this.paymentMethods.find(card => card.id === cardId);
                
                // Apply fade out animation
                card.classList.add('fade-out');
                
                setTimeout(() => {
                    // Remove from payment methods array - this is the key line that needs to work
                    this.paymentMethods = this.paymentMethods.filter(card => card.id !== cardId);
                    
                    // Store the removed card for potential undo
                    const deletedCard = {...removedCard};
                    this.deletedPaymentMethods.push(deletedCard);
                    
                    card.remove();
                    
                    this.showNotification({
                        title: 'Payment method removed',
                        message: 'Your payment method has been deleted.',
                        type: 'success',
                        hasUndo: true,
                        onUndo: () => {
                            // Return a function that will restore the deleted card
                            return () => {
                                // We need to push the exact same card (with the same ID) back
                                this.paymentMethods.push(deletedCard);
                                
                                // Re-render to show restored card
                                this.render();
                                this.setupTabSpecificEventListeners();
                            };
                        }
                    });
                }, 300);
            });
        });
        
        // Edit payment method
        document.querySelectorAll('.payment-method-card .edit-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const card = btn.closest('.payment-method-card');
                const cardId = parseInt(card.dataset.id);
                const cardData = this.paymentMethods.find(card => card.id === cardId);
                
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
        
        // Handle outside click to close
        modal.addEventListener('click', e => {
            if (e.target === modal) closeModal();
        });
        
        // Update the save button click handler
        modal.querySelector('.save-payment-btn').addEventListener('click', async (e) => {
            const form = modal.querySelector('#payment-form');
            if (this.validateForm(form)) {
                const formData = new FormData();
                formData.append('action', isEditing ? 'update' : 'add');
                formData.append('card_type', form.querySelector('#card-type').value);
                formData.append('card_number', form.querySelector('#card-number').value);
                formData.append('expiry_month', form.querySelector('#expiry-month').value);
                formData.append('expiry_year', form.querySelector('#expiry-year').value);
                formData.append('card_holder', form.querySelector('#card-holder').value);
                
                if (isEditing) {
                    formData.append('payment_id', cardData.id);
                }

                this.animateSaveButton(e.target);
                
                const success = await this.savePaymentMethod(formData, isEditing);
                
                if (success) {
                    this.showSuccessAnimation();
                    closeModal();
                    await this.loadPaymentMethods(); // Reload payment methods
                    this.render();
                    this.setupTabSpecificEventListeners();
                }
            }
        });
    }
    
    showPasswordResetContainer() {
        // Create container for reset password interface
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        const resetContainerHTML = `
            <div class="password-reset-container">
                <div class="password-reset-icon">
                    <i class='bx bx-lock-open'></i>
                </div>
                <h3>Reset Your Password</h3>
                <p>We'll send a verification code to your email to reset your password.</p>
                
                <form class="reset-form" id="reset-email-form">
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
                        <input type="text" maxlength="1" class="code-input" data-index="1" autofocus>
                        <input type="text" maxlength="1" class="code-input" data-index="2">
                        <input type="text" maxlength="1" class="code-input" data-index="3">
                        <input type="text" maxlength="1" class="code-input" data-index="4">
                        <input type="text" maxlength="1" class="code-input" data-index="5">
                        <input type="text" maxlength="1" class="code-input" data-index="6">
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
        
        modal.innerHTML = resetContainerHTML;
        document.body.appendChild(modal);
        
        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Close function
        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        };
        
        // Back button
        modal.querySelector('.back-to-login').addEventListener('click', e => {
            e.preventDefault();
            closeModal();
        });
        
        // Close on outside click
        modal.addEventListener('click', e => {
            if (e.target === modal) closeModal();
        });
        
        // Email form submission - show verification code inputs
        const emailForm = modal.querySelector('#reset-email-form');
        emailForm.addEventListener('submit', e => {
            e.preventDefault();
            const emailInput = modal.querySelector('#reset-email');
            
            if (this.isValidEmail(emailInput.value)) {
                emailForm.style.display = 'none';
                const verificationStep = modal.querySelector('.verification-step');
                verificationStep.style.display = 'block';
                
                // Setup verification code input behavior
                this.setupVerificationCodeInputs(modal);
                
                // Start countdown timer
                this.startCountdownTimer(modal.querySelector('.countdown'));
                
                this.showNotification({
                    title: 'Verification code sent',
                    message: `Please check your email ${emailInput.value} for the verification code.`,
                    type: 'info'
                });
            } else {
                const errorMsg = emailInput.nextElementSibling;
                errorMsg.classList.remove('hidden');
                emailInput.classList.add('error-input');
            }
        });
        
        // Verify code button
        modal.querySelector('.verify-code-btn').addEventListener('click', () => {
            const inputs = modal.querySelectorAll('.code-input');
            let code = '';
            let isValid = true;
            
            inputs.forEach(input => {
                code += input.value;
                if (!input.value) {
                    isValid = false;
                    input.classList.add('error-input');
                } else {
                    input.classList.remove('error-input');
                }
            });
            
            if (isValid) {
                // Show new password form (this would typically verify with server first)
                modal.querySelector('.password-reset-container').innerHTML = `
                    <div class="password-reset-icon">
                        <i class='bx bx-check-circle'></i>
                    </div>
                    <h3>Create New Password</h3>
                    <p>Please enter a new secure password for your account.</p>
                    
                    <form class="reset-form" id="new-password-form">
                        <div class="form-group">
                            <label for="new-reset-password">New Password</label>
                            <div class="password-input-container">
                                <input type="password" id="new-reset-password" placeholder="Enter new password" required>
                                <button type="button" class="toggle-password">
                                    <i class='bx bx-show'></i>
                                </button>
                            </div>
                            <div class="password-strength-meter">
                                <div class="strength-bar" id="reset-strength-bar"></div>
                                <span class="strength-text" id="reset-strength-text">Password strength</span>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="confirm-reset-password">Confirm Password</label>
                            <div class="password-input-container">
                                <input type="password" id="confirm-reset-password" placeholder="Confirm new password" required>
                                <button type="button" class="toggle-password">
                                    <i class='bx bx-show'></i>
                                </button>
                            </div>
                            <div class="error-message hidden">Passwords do not match</div>
                        </div>
                        
                        <button type="submit" class="reset-password-btn btn-animate">
                            Reset Password
                        </button>
                    </form>
                `;
                
                // Set up password toggle and strength meter
                this.setupPasswordToggles();
                
                const newPasswordInput = document.getElementById('new-reset-password');
                if (newPasswordInput) {
                    newPasswordInput.addEventListener('input', () => {
                        this.updatePasswordStrength(newPasswordInput.value, 'reset-strength-bar', 'reset-strength-text');
                    });
                }
                
                // Set up form submission
                document.getElementById('new-password-form').addEventListener('submit', e => {
                    e.preventDefault();
                    const newPassword = document.getElementById('new-reset-password').value;
                    const confirmPassword = document.getElementById('confirm-reset-password').value;
                    
                    if (newPassword.length < 8) {
                        document.getElementById('new-reset-password').classList.add('error-input');
                        return;
                    }
                    
                    if (newPassword !== confirmPassword) {
                        document.getElementById('confirm-reset-password').classList.add('error-input');
                        document.getElementById('confirm-reset-password').nextElementSibling.nextElementSibling.classList.remove('hidden');
                        return;
                    }
                    
                    // Success - password reset
                    this.showSuccessAnimation();
                    
                    setTimeout(() => {
                        closeModal();
                        this.showNotification({
                            title: 'Password reset successful',
                            message: 'Your password has been reset. You can now log in with your new password.',
                            type: 'success'
                        });
                    }, 1000);
                });
            }
        });
        
        // Resend code button
        modal.querySelector('.resend-code-btn').addEventListener('click', () => {
            this.showNotification({
                title: 'Code resent',
                message: 'A new verification code has been sent to your email.',
                type: 'info'
            });
            
            // Reset timer
            this.startCountdownTimer(modal.querySelector('.countdown'));
        });
    }
    
    setupVerificationCodeInputs(container) {
        const inputs = container.querySelectorAll('.code-input');
        
        inputs.forEach((input, index) => {
            // Auto-focus next input after entry
            input.addEventListener('input', () => {
                if (input.value && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            });
            
            // Handle backspace to go to previous input
            input.addEventListener('keydown', e => {
                if (e.key === 'Backspace' && !input.value && index > 0) {
                    inputs[index - 1].focus();
                }
            });
            
            // Handle paste event to distribute across inputs
            input.addEventListener('paste', e => {
                e.preventDefault();
                const pasteData = e.clipboardData.getData('text').trim();
                if (/^\d+$/.test(pasteData)) {
                    for (let i = 0; i < Math.min(pasteData.length, inputs.length - index); i++) {
                        inputs[index + i].value = pasteData[i];
                    }
                    // Focus on the next empty input or the last one
                    const nextEmptyIndex = [...inputs].findIndex((inp, idx) => idx >= index && !inp.value);
                    if (nextEmptyIndex !== -1) {
                        inputs[nextEmptyIndex].focus();
                    } else {
                        inputs[inputs.length - 1].focus();
                    }
                }
            });
        });
    }
    
    startCountdownTimer(element) {
        if (!element) return;
        
        let minutes = 5;
        let seconds = 0;
        
        const interval = setInterval(() => {
            if (seconds === 0) {
                if (minutes === 0) {
                    clearInterval(interval);
                    element.textContent = "Expired";
                    return;
                }
                minutes--;
                seconds = 59;
            } else {
                seconds--;
            }
            
            element.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
        
        // Store the interval ID for cleanup if needed
        element.dataset.intervalId = interval;
    }
    
    updatePasswordStrength(password, barId = 'password-strength-bar', textId = 'password-strength-text') {
        const strengthBar = document.getElementById(barId);
        const strengthText = document.getElementById(textId);
        
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
        
        const currentPassword = form.querySelector('#current-password');
        const newPassword = form.querySelector('#new-password');
        const confirmPassword = form.querySelector('#confirm-password');
        let isValid = true;
        
        // Current password validation
        if (!currentPassword.value) {
            isValid = false;
            currentPassword.classList.add('error-input');
            const errorElem = currentPassword.parentElement.nextElementSibling;
            errorElem.textContent = 'Current password is required';
            errorElem.classList.remove('hidden');
        }
        
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
        
        // Make sure new password is different from current
        if (currentPassword.value === newPassword.value) {
            isValid = false;
            newPassword.classList.add('error-input');
            const errorElem = newPassword.parentElement.nextElementSibling.nextElementSibling;
            errorElem.textContent = 'New password must be different from current password';
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
        notification.className = `notification ${type}`;
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
        
        // Store undo function if provided
        if (hasUndo && onUndo) {
            notification.undoFunction = onUndo();
        }
        
        // Set up progress bar
        const progress = notification.querySelector('.notification-progress');
        setTimeout(() => {
            notification.classList.add('fade-in');
            progress.style.width = '0';
        }, 10);
        
        // Set up event listeners
        notification.querySelector('.close-notification-btn').addEventListener('click', () => {
            this.removeNotification(id);
        });
        
        if (hasUndo) {
            notification.querySelector('.undo-btn').addEventListener('click', () => {
                this.removeNotification(id, true);
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
                // Execute the stored undo function
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