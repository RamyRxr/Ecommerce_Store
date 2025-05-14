export default class SignUp {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.verificationSent = false;
        this.verificationTimer = null;
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
        this.applyTheme();
    }

    render() {
        const signupHTML = `
            <div class="signup-container">
                <div class="signup-card">
                    <div class="signup-header">
                        <div class="logo">
                            <img src="../assets/images/RamyRxr.png" alt="RamyRXR" class="logo-img">
                            <h2>TechBuy</h2>
                        </div>
                        <div class="theme-toggle">
                            <button id="signup-theme-toggle">
                                <i class='bx bx-moon'></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="signup-body">
                        <h1 class="signup-title">Create Account</h1>
                        <p class="signup-subtitle">Sign up to get started</p>
                        
                        <form id="signup-form">
                            <div class="form-row">
                                <div class="form-group half">
                                    <label for="firstName">First Name</label>
                                    <div class="input-with-icon">
                                        <i class='bx bx-user'></i>
                                        <input type="text" id="firstName" class="form-control" placeholder="First name" required>
                                    </div>
                                </div>
                                
                                <div class="form-group half">
                                    <label for="lastName">Last Name</label>
                                    <div class="input-with-icon">
                                        <i class='bx bx-user'></i>
                                        <input type="text" id="lastName" class="form-control" placeholder="Last name" required>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="username">Username</label>
                                <div class="input-with-icon">
                                    <i class='bx bx-user-circle'></i>
                                    <input type="text" id="username" class="form-control" placeholder="Choose a username" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="email">Email Address</label>
                                <div class="input-with-icon">
                                    <i class='bx bx-envelope'></i>
                                    <input type="email" id="email" class="form-control" placeholder="Your email address" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="password">Password</label>
                                <div class="input-with-icon">
                                    <i class='bx bx-lock-alt'></i>
                                    <input type="password" id="password" class="form-control" placeholder="Create a password" required>
                                    <button type="button" id="toggle-password" class="toggle-password">
                                        <i class='bx bx-hide'></i>
                                    </button>
                                </div>
                                <div class="password-strength" id="password-strength">
                                    <div class="strength-meter">
                                        <div class="strength-bar" id="strength-bar"></div>
                                    </div>
                                    <span class="strength-text" id="strength-text">Password strength</span>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="confirmPassword">Confirm Password</label>
                                <div class="input-with-icon">
                                    <i class='bx bx-lock-alt'></i>
                                    <input type="password" id="confirmPassword" class="form-control" placeholder="Confirm your password" required>
                                    <button type="button" id="toggle-confirm-password" class="toggle-password">
                                        <i class='bx bx-hide'></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="phoneNumber">Phone Number</label>
                                <div class="input-with-icon phone-input">
                                    <i class='bx bx-phone'></i>
                                    <input type="tel" id="phoneNumber" class="form-control" placeholder="Your phone number" required>
                                    <button type="button" id="send-code-btn" class="send-code-btn">
                                        Send Code
                                    </button>
                                </div>
                            </div>
                            
                            <div class="form-group verification-group" style="display: none;">
                                <label for="verificationCode">Verification Code</label>
                                <div class="input-with-icon">
                                    <i class='bx bx-check-shield'></i>
                                    <input type="text" id="verificationCode" class="form-control" placeholder="Enter the 6-digit code" maxlength="6">
                                    <div class="verification-timer">
                                        <span id="timer">02:00</span>
                                        <button type="button" id="resend-code" class="resend-code" disabled>
                                            Resend
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group terms-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="terms" required>
                                    <span>I agree to the <a href="#" class="terms-link">Terms of Service</a> and <a href="#" class="terms-link">Privacy Policy</a></span>
                                </label>
                            </div>
                            
                            <button type="submit" class="btn-signup">
                                <i class='bx bx-user-plus'></i>
                                <span>Create Account</span>
                            </button>
                        </form>
                        
                        <div class="signup-divider">
                            <div class="line"></div>
                            <div class="text">or sign up with</div>
                            <div class="line"></div>
                        </div>
                        
                        <div class="social-signup">
                            <button class="social-btn facebook">
                                <i class='bx bxl-facebook'></i>
                            </button>
                            <button class="social-btn twitter">
                                <i class='bx bxl-twitter'></i>
                            </button>
                            <button class="social-btn google">
                                <i class='bx bxl-google'></i>
                            </button>
                            <button class="social-btn github">
                                <i class='bx bxl-github'></i>
                            </button>
                        </div>
                        
                        <div class="login-link">
                            Already have an account? <a href="login.html" id="login-link">Log in</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const signupContainer = document.createElement('div');
        signupContainer.id = 'signup-container';
        signupContainer.innerHTML = signupHTML;

        this.container.innerHTML = '';
        this.container.appendChild(signupContainer);
    }

    setupEventListeners() {
        const themeToggle = document.getElementById('signup-theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        const togglePassword = document.getElementById('toggle-password');
        if (togglePassword) {
            togglePassword.addEventListener('click', () => this.togglePasswordVisibility('password', 'toggle-password'));
        }

        const toggleConfirmPassword = document.getElementById('toggle-confirm-password');
        if (toggleConfirmPassword) {
            toggleConfirmPassword.addEventListener('click', () => this.togglePasswordVisibility('confirmPassword', 'toggle-confirm-password'));
        }

        const sendCodeBtn = document.getElementById('send-code-btn');
        if (sendCodeBtn) {
            sendCodeBtn.addEventListener('click', () => this.sendVerificationCode());
        }

        const resendCodeBtn = document.getElementById('resend-code');
        if (resendCodeBtn) {
            resendCodeBtn.addEventListener('click', () => this.resendVerificationCode());
        }

        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', () => this.checkPasswordStrength(passwordInput.value));
        }

        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.validateForm()) {
                    this.submitSignupForm();
                }
            });
        }

        const inputs = document.querySelectorAll('.form-control');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            input.addEventListener('blur', () => {
                if (input.value === '') {
                    input.parentElement.classList.remove('focused');
                }
            });
            if (input.value !== '') {
                input.parentElement.classList.add('focused');
            }
        });
    }

    togglePasswordVisibility(inputId, buttonId) {
        const passwordInput = document.getElementById(inputId);
        const toggleButton = document.getElementById(buttonId);
        const icon = toggleButton.querySelector('i');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.className = 'bx bx-show';
        } else {
            passwordInput.type = 'password';
            icon.className = 'bx bx-hide';
        }
    }

    sendVerificationCode() {
        const phoneNumber = document.getElementById('phoneNumber').value;
        const sendCodeBtn = document.getElementById('send-code-btn');
        const verificationGroup = document.querySelector('.verification-group');

        if (!phoneNumber || phoneNumber.length < 10) {
            this.showError('Please enter a valid phone number');
            return;
        }

        sendCodeBtn.textContent = 'Sending...';
        sendCodeBtn.disabled = true;

        setTimeout(() => {
            verificationGroup.style.display = 'block';
            sendCodeBtn.textContent = 'Sent';
            this.startVerificationTimer();
            this.verificationSent = true;
        }, 1500);
    }

    resendVerificationCode() {
        const resendCodeBtn = document.getElementById('resend-code');
        resendCodeBtn.textContent = 'Sending...';
        resendCodeBtn.disabled = true;

        setTimeout(() => {
            resendCodeBtn.textContent = 'Resend';
            this.startVerificationTimer();
        }, 1500);
    }

    startVerificationTimer() {
        const timerElement = document.getElementById('timer');
        const resendCodeBtn = document.getElementById('resend-code');
        let timeLeft = 120; 

        if (this.verificationTimer) {
            clearInterval(this.verificationTimer);
        }

        resendCodeBtn.disabled = true;
        timerElement.textContent = '02:00';

        this.verificationTimer = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            if (timeLeft <= 0) {
                clearInterval(this.verificationTimer);
                resendCodeBtn.disabled = false;
                timerElement.textContent = '00:00';
            }
        }, 1000);
    }

    checkPasswordStrength(password) {
        const strengthBar = document.getElementById('strength-bar');
        const strengthText = document.getElementById('strength-text');
        let strength = 0;
        let status = 'Very weak';

        if (password.length > 0) strength = 20;
        if (password.length >= 8) { strength = 40; status = 'Weak'; }
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) { strength = 60; status = 'Medium'; }
        if (password.match(/\d/)) { strength = 80; status = 'Strong'; }
        if (password.match(/[^a-zA-Z\d]/)) { strength = 100; status = 'Very strong'; }

        strengthBar.style.width = `${strength}%`;
        strengthText.textContent = status;

        if (strength <= 40) strengthBar.style.backgroundColor = '#f44336';
        else if (strength <= 80) strengthBar.style.backgroundColor = '#ffa726';
        else strengthBar.style.backgroundColor = '#66bb6a';
    }

    validateForm() {
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const phoneNumber = document.getElementById('phoneNumber').value;
        const verificationCode = document.getElementById('verificationCode').value;
        const termsAccepted = document.getElementById('terms').checked;

        if (!firstName || !lastName) { this.showError('Please enter your full name'); return false; }
        if (!username) { this.showError('Please enter a username'); return false; }
        if (!email || !this.isValidEmail(email)) { this.showError('Please enter a valid email address'); return false; }
        if (!password || password.length < 8) { this.showError('Password must be at least 8 characters long'); return false; }
        if (password !== confirmPassword) { this.showError('Passwords do not match'); return false; }
        if (!phoneNumber || phoneNumber.length < 10) { this.showError('Please enter a valid phone number'); return false; }
        if (this.verificationSent && (!verificationCode || verificationCode.length !== 6)) { this.showError('Please enter the 6-digit verification code'); return false; }
        if (!termsAccepted) { this.showError('You must accept the Terms of Service and Privacy Policy'); return false; }
        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async submitSignupForm() {
        const signupBtn = document.querySelector('.btn-signup');
        signupBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i><span>Creating Account...</span>';
        signupBtn.disabled = true;

        const userData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            first_name: document.getElementById('firstName').value,
            last_name: document.getElementById('lastName').value,
            phone: document.getElementById('phoneNumber').value
        };

        try {
            const response = await fetch('../backend/api/auth/register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const responseData = await response.json();

            if (response.ok && responseData.success) {
                alert('Registration successful! Please log in.');
                window.location.href = './login.html?registered=true';
            } else {
                throw new Error(responseData.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showError(error.message || 'Registration failed. Please try again.');
            signupBtn.innerHTML = '<i class="bx bx-user-plus"></i><span>Create Account</span>';
            signupBtn.disabled = false;
        }
    }

    showError(message) {
        let errorDiv = document.querySelector('.signup-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'signup-error';
            const termsGroup = document.querySelector('.terms-group');
            termsGroup.parentNode.insertBefore(errorDiv, termsGroup.nextSibling);
        }
        errorDiv.textContent = message;
        document.querySelector('.signup-card').classList.add('shake');
        setTimeout(() => {
            document.querySelector('.signup-card').classList.remove('shake');
        }, 500);
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode);
        this.applyTheme();
    }

    applyTheme() {
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        const themeIcon = document.querySelector('#signup-theme-toggle i');
        if (themeIcon) {
            themeIcon.className = this.isDarkMode ? 'bx bx-sun' : 'bx bx-moon';
        }
    }
}