export default class LogIn {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
        this.applyTheme();
    }

    render() {
        const loginHTML = `
            <div class="login-container">
                <div class="login-card">
                    <div class="login-header">
                        <div class="logo">
                            <img src="../assets/images/RamyRxr.png" alt="RamyRXR" class="logo-img">
                            <h2>TechBuy</h2>
                        </div>
                        <div class="theme-toggle">
                            <button id="login-theme-toggle">
                                <i class='bx bx-moon'></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="login-body">
                        <h1 class="login-title">Welcome Back</h1>
                        <p class="login-subtitle">Please Log in to continue</p>
                        
                        <form id="login-form">
                            <div class="form-group">
                                <label for="username">Username or Email</label>
                                <div class="input-with-icon">
                                    <i class='bx bx-user'></i>
                                    <input type="text" id="username" class="form-control" placeholder="Enter your username" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="password">Password</label>
                                <div class="input-with-icon">
                                    <i class='bx bx-lock-alt'></i>
                                    <input type="password" id="password" class="form-control" placeholder="Enter your password" required>
                                    <button type="button" id="toggle-password" class="toggle-password">
                                        <i class='bx bx-hide'></i>
                                    </button>
                                    
                                </div>
                            </div>
                            
                            <div class="checkbox-group">
                                <label class="remember-me">
                                    <input type="checkbox" id="remember-me">
                                    <span>Remember me</span>
                                </label>
                                <a href="#" class="forgot-password">Forgot Password?</a>
                            </div>
                            
                            <button type="submit" class="btn-login">
                                <i class='bx bx-log-in'></i>
                                <span>Log In</span>
                            </button>
                        </form>
                        
                        <div class="login-divider">
                            <div class="line"></div>
                            <div class="text">or continue with</div>
                            <div class="line"></div>
                        </div>
                        
                        <div class="social-login">
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
                        
                        <div class="register-link">
                            Don't have an account? <a href="../HTML-Pages/signup.html" id="signup-link">Sign up</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const loginContainer = document.createElement('div');
        loginContainer.id = 'login-container';
        loginContainer.innerHTML = loginHTML;

        this.container.innerHTML = '';
        this.container.appendChild(loginContainer);
    }

    setupEventListeners() {
        const themeToggle = document.getElementById('login-theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        const togglePassword = document.getElementById('toggle-password');
        if (togglePassword) {
            togglePassword.addEventListener('click', () => {
                const passwordInput = document.getElementById('password');
                const icon = togglePassword.querySelector('i');

                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.className = 'bx bx-show';
                } else {
                    passwordInput.type = 'password';
                    icon.className = 'bx bx-hide';
                }
            });
        }

        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                const remember = document.getElementById('remember-me').checked;

                if (!username || !password) {
                    this.showError('Please fill in all fields');
                    return;
                }

                this.login(username, password, remember);
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

        const rememberedUser = localStorage.getItem('rememberedUser');
        if (rememberedUser) {
            document.getElementById('username').value = rememberedUser;
            document.getElementById('remember-me').checked = true;
            document.getElementById('username').parentElement.classList.add('focused');
        }
    }

    async login(username, password, remember) {
        const loginBtn = document.querySelector('.btn-login');
        loginBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i><span>Logging in...</span>';
        loginBtn.disabled = true;

        const requestPayload = {
            username: username,
            password: password
        };

        try {
            const response = await fetch('../backend/api/auth/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestPayload)
            });

            const responseData = await response.json();

            if (responseData.success) {
                sessionStorage.setItem('user', JSON.stringify({
                    id: responseData.user.id,
                    username: responseData.user.username,
                    email: responseData.user.email,
                    first_name: responseData.user.first_name,
                    last_name: responseData.user.last_name,
                    is_admin: responseData.user.is_admin 
                }));

                if (remember) {
                    localStorage.setItem('rememberedUser', username);
                } else {
                    localStorage.removeItem('rememberedUser');
                }

                window.location.href = '../HTML-Pages/ExplorePage.html'; 
            } else {
                throw new Error(responseData.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            loginBtn.innerHTML = '<i class="bx bx-log-in"></i><span>Log In</span>';
            loginBtn.disabled = false;
            this.showError(error.message || 'Login failed. Please try again.');
        }
    }

    showError(message) {
        let errorDiv = document.querySelector('.login-error');

        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'login-error';

            const formGroup = document.querySelector('.checkbox-group').parentNode;
            formGroup.insertBefore(errorDiv, document.querySelector('.btn-login'));
        }

        errorDiv.textContent = message;

        document.querySelector('.login-card').classList.add('shake');
        setTimeout(() => {
            document.querySelector('.login-card').classList.remove('shake');
        }, 500);
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode);
        this.applyTheme();
    }

    applyTheme() {
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        const themeIcon = document.querySelector('#login-theme-toggle i');
        if (themeIcon) {
            themeIcon.className = this.isDarkMode ? 'bx bx-sun' : 'bx bx-moon';
        }
    }
}