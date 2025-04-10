export default class Settings {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.activeTab = 'account'; // Default tab
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
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
                            Account
                        </button>
                        <button class="tab-button ${this.activeTab === 'payment' ? 'active' : ''}" data-tab="payment">
                            <i class='bx bx-credit-card'></i>
                            Payment Methods
                        </button>
                        <button class="tab-button ${this.activeTab === 'notifications' ? 'active' : ''}" data-tab="notifications">
                            <i class='bx bx-bell'></i>
                            Notifications
                        </button>
                        <button class="tab-button ${this.activeTab === 'security' ? 'active' : ''}" data-tab="security">
                            <i class='bx bx-lock'></i>
                            Security
                        </button>
                        <button class="tab-button ${this.activeTab === 'language' ? 'active' : ''}" data-tab="language">
                            <i class='bx bx-globe'></i>
                            Language
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
                    
                    <form class="settings-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="first-name">First Name</label>
                                <input type="text" id="first-name" value="John">
                            </div>
                            <div class="form-group">
                                <label for="last-name">Last Name</label>
                                <input type="text" id="last-name" value="Doe">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="email">Email Address</label>
                                <input type="email" id="email" value="john.doe@example.com">
                            </div>
                            <div class="form-group">
                                <label for="phone">Phone Number</label>
                                <input type="tel" id="phone" value="+1 (555) 123-4567">
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="save-button">
                                <i class='bx bx-save'></i>
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>

                <div class="settings-section">
                    <h2>Shipping Address</h2>
                    <p>Update your shipping information.</p>
                    
                    <form class="settings-form">
                        <div class="form-group">
                            <label for="street-address">Street Address</label>
                            <input type="text" id="street-address" value="123 Main Street">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="city">City</label>
                                <input type="text" id="city" value="New York">
                            </div>
                            <div class="form-group">
                                <label for="state">State/Province</label>
                                <input type="text" id="state" value="NY">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="zip">ZIP/Postal Code</label>
                                <input type="text" id="zip" value="10001">
                            </div>
                            <div class="form-group">
                                <label for="country">Country</label>
                                <select id="country">
                                    <option value="us" selected>United States</option>
                                    <option value="ca">Canada</option>
                                    <option value="uk">United Kingdom</option>
                                    <option value="au">Australia</option>
                                    <option value="jp">Japan</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="save-button">
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
        return `
            <div class="payment-settings">
                <div class="settings-section">
                    <h2>Payment Methods</h2>
                    <p>Manage your payment methods.</p>
                    
                    <div class="payment-methods-list">
                        <div class="payment-method-card selected">
                            <div class="card-icon">
                                <i class='bx bxl-visa'></i>
                            </div>
                            <div class="card-details">
                                <div class="card-name">Visa ending in 4224</div>
                                <div class="card-expiry">Expires 04/25</div>
                            </div>
                            <div class="card-actions">
                                <button class="edit-btn">
                                    <i class='bx bx-edit'></i>
                                </button>
                                <button class="delete-btn">
                                    <i class='bx bx-trash'></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="payment-method-card">
                            <div class="card-icon">
                                <i class='bx bxl-mastercard'></i>
                            </div>
                            <div class="card-details">
                                <div class="card-name">Mastercard ending in 8821</div>
                                <div class="card-expiry">Expires 12/24</div>
                            </div>
                            <div class="card-actions">
                                <button class="edit-btn">
                                    <i class='bx bx-edit'></i>
                                </button>
                                <button class="delete-btn">
                                    <i class='bx bx-trash'></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <button class="add-payment-method">
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
                        <button class="save-button">
                            <i class='bx bx-save'></i>
                            Save Preferences
                        </button>
                    </div>
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
                    
                    <form class="settings-form">
                        <div class="form-group">
                            <label for="current-password">Current Password</label>
                            <input type="password" id="current-password" placeholder="Enter current password">
                        </div>
                        
                        <div class="form-group">
                            <label for="new-password">New Password</label>
                            <div class="password-input-container">
                                <input type="password" id="new-password" placeholder="Enter new password">
                                <button type="button" class="toggle-password">
                                    <i class='bx bx-show'></i>
                                </button>
                            </div>
                            <div class="password-strength-meter">
                                <div class="strength-bar"></div>
                                <span class="strength-text">Password strength</span>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="confirm-password">Confirm New Password</label>
                            <div class="password-input-container">
                                <input type="password" id="confirm-password" placeholder="Confirm new password">
                                <button type="button" class="toggle-password">
                                    <i class='bx bx-show'></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="save-button">
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
                        <button class="tfa-button">
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
                    
                    <form class="settings-form">
                        <div class="form-group">
                            <label for="language">Language</label>
                            <select id="language">
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
                            <select id="currency">
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
                            <select id="timezone">
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
                            <button type="submit" class="save-button">
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
            }

            // Toggle password visibility
            const togglePasswordBtn = e.target.closest('.toggle-password');
            if (togglePasswordBtn) {
                const passwordInput = togglePasswordBtn.previousElementSibling;
                const icon = togglePasswordBtn.querySelector('i');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.className = 'bx bx-hide';
                } else {
                    passwordInput.type = 'password';
                    icon.className = 'bx bx-show';
                }
            }
        });

        // Prevent form submissions from reloading the page
        document.addEventListener('submit', e => {
            if (e.target.closest('.settings-form')) {
                e.preventDefault();
                alert('Changes saved successfully!');
            }
        });

        // Add payment method button
        document.addEventListener('click', e => {
            if (e.target.closest('.add-payment-method')) {
                alert('Add payment method feature would open a modal here.');
            }
        });

        // Forgot password button
        document.addEventListener('click', e => {
            if (e.target.closest('.forgot-password-button')) {
                this.showForgotPasswordModal();
            }
        });

        // TFA button
        document.addEventListener('click', e => {
            if (e.target.closest('.tfa-button')) {
                alert('Two-factor authentication setup would start here.');
            }
        });
    }

    showForgotPasswordModal() {
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Reset Password</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Enter your email address, and we'll send you a verification code to reset your password.</p>
                    <div class="form-group">
                        <label for="reset-email">Email Address</label>
                        <input type="email" id="reset-email" placeholder="Enter your email" value="john.doe@example.com">
                    </div>
                    <div class="form-actions">
                        <button class="send-code-button">Send Verification Code</button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to the page
        document.body.appendChild(modal);

        // Show modal
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

        // Close button event
        modal.querySelector('.close-modal').addEventListener('click', closeModal);

        // Send code button event
        modal.querySelector('.send-code-button').addEventListener('click', () => {
            this.showVerificationCodeModal();
            closeModal();
        });

        // Close on outside click
        modal.addEventListener('click', e => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    showVerificationCodeModal() {
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Enter Verification Code</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>We've sent a verification code to your email. Enter the code below.</p>
                    <div class="verification-code-container">
                        <input type="text" maxlength="1" class="code-input" autofocus>
                        <input type="text" maxlength="1" class="code-input">
                        <input type="text" maxlength="1" class="code-input">
                        <input type="text" maxlength="1" class="code-input">
                        <input type="text" maxlength="1" class="code-input">
                        <input type="text" maxlength="1" class="code-input">
                    </div>
                    <div class="form-actions">
                        <button class="verify-button">Verify Code</button>
                        <button class="resend-code-button">Resend Code</button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to the page
        document.body.appendChild(modal);

        // Show modal
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);

        // Setup code inputs
        const codeInputs = modal.querySelectorAll('.code-input');
        codeInputs.forEach((input, index) => {
            input.addEventListener('input', () => {
                if (input.value.length === 1 && index < codeInputs.length - 1) {
                    codeInputs[index + 1].focus();
                }
            });

            input.addEventListener('keydown', e => {
                if (e.key === 'Backspace' && !input.value && index > 0) {
                    codeInputs[index - 1].focus();
                }
            });
        });

        // Close modal function
        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        };

        // Close button event
        modal.querySelector('.close-modal').addEventListener('click', closeModal);

        // Verify button event
        modal.querySelector('.verify-button').addEventListener('click', () => {
            this.showNewPasswordModal();
            closeModal();
        });

        // Resend code button
        modal.querySelector('.resend-code-button').addEventListener('click', () => {
            alert('A new verification code has been sent to your email.');
        });

        // Close on outside click
        modal.addEventListener('click', e => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    showNewPasswordModal() {
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Set New Password</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Create a new password for your account.</p>
                    <div class="form-group">
                        <label for="modal-new-password">New Password</label>
                        <div class="password-input-container">
                            <input type="password" id="modal-new-password" placeholder="Enter new password">
                            <button type="button" class="toggle-password">
                                <i class='bx bx-show'></i>
                            </button>
                        </div>
                        <div class="password-strength-meter">
                            <div class="strength-bar"></div>
                            <span class="strength-text">Password strength</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="modal-confirm-password">Confirm New Password</label>
                        <div class="password-input-container">
                            <input type="password" id="modal-confirm-password" placeholder="Confirm new password">
                            <button type="button" class="toggle-password">
                                <i class='bx bx-show'></i>
                            </button>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button class="save-password-button">Save New Password</button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to the page
        document.body.appendChild(modal);

        // Show modal
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

        // Close button event
        modal.querySelector('.close-modal').addEventListener('click', closeModal);

        // Toggle password visibility
        modal.querySelectorAll('.toggle-password').forEach(btn => {
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

        // Save button event
        modal.querySelector('.save-password-button').addEventListener('click', () => {
            alert('Your password has been successfully reset!');
            closeModal();
        });

        // Close on outside click
        modal.addEventListener('click', e => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}