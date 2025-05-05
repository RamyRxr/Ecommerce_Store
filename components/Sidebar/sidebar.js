export default class SideBar {
    constructor(containerId = 'app', activeMenuItem = 'home') {
        this.container = document.getElementById(containerId);
        this.isCollapsed = false;
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.activeMenuItem = activeMenuItem;
        this.isAdmin = false; // Default to false
        this.init();
    }

    async init() {
        // Force synchronous execution to ensure admin status is set before rendering
        this.checkAdminStatus();
        console.log('Sidebar init - isAdmin:', this.isAdmin);
        this.render();
        this.setupEventListeners();
        this.applyTheme();
        this.postRenderCleanup();
    }

    checkAdminStatus() {
        try {
            const user = JSON.parse(sessionStorage.getItem('user') || '{}');
            this.isAdmin = Boolean(user.is_admin);
            console.log('Admin status check (Sidebar):', this.isAdmin ? 'Administrator' : 'Regular User');

            // Also store in localStorage as a backup for page refreshes
            localStorage.setItem('isAdmin', this.isAdmin);

            return this.isAdmin;
        } catch (error) {
            console.error('Error checking admin status:', error);
            this.isAdmin = false;
            return false;
        }
    }

    render() {
        const sidebarHTML = `
            <div class="sidebar${this.isCollapsed ? ' collapsed' : ''}">
                <div class="top">
                    <span class="logo">
                        <img src="../assets/images/general-image/RamyRxr.png" alt="RamyRXR" class="logo-img">
                    </span>
                    <div class="top-controls">
                        <div class="icon-item">
                            <i class='bx bx-message'></i>
                            <span class="badge">3</span>
                            <!-- Message Dropdown -->
                            <div class="dropdown-box messages-box">
                                <div class="dropdown-header">
                                    <h4>Messages</h4>
                                </div>
                                <div class="dropdown-content">
                                    <div class="scrollable-content">
                                        <div class="message-item">
                                            <div class="message-avatar">
                                                <img src="../assets/images/general-image/RamyRxr.png" alt="User">
                                            </div>
                                            <div class="message-info">
                                                <h5>John Doe</h5>
                                                <p>Hey, how's it going?</p>
                                                <small>2 mins ago</small>
                                            </div>
                                        </div>
                                        <div class="message-item">
                                            <div class="message-avatar">
                                                <img src="../assets/images/general-image/RamyRxr.png" alt="User">
                                            </div>
                                            <div class="message-info">
                                                <h5>Jane Smith</h5>
                                                <p>The project is ready for review</p>
                                                <small>1 hour ago</small>
                                            </div>
                                        </div>
                                        <div class="message-item">
                                            <div class="message-avatar">
                                                <img src="../assets/images/general-image/RamyRxr.png" alt="User">
                                            </div>
                                            <div class="message-info">
                                                <h5>Mike Johnson</h5>
                                                <p>Meeting at 3pm today</p>
                                                <small>3 hours ago</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="dropdown-footer">
                                        <button class="show-more-btn">Show more <i class='bx bx-chevron-down'></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="icon-item">
                            <i class='bx bx-bell'></i>
                            <span class="badge">5</span>

                            <!-- Notification dropdown -->

                            <div class="dropdown-box notifications-box">

                                <div class="dropdown-header">
                                    <h4>Notifications</h4>
                                </div>

                                <div class="dropdown-content">

                                    <div class="notification-item" data-target="orders-received">
                                        <div class="notification-icon">
                                            <i class='bx bx-shopping-bag'></i>
                                            <span class="notification-badge">3</span>
                                        </div>
                                        <div class="notification-info">
                                            <p>New orders received</p>
                                            <small>View all orders</small>
                                        </div>
                                    </div>
                                    
                                    <div class="notification-item" data-target="interactions">

                                        <div class="notification-icon">
                                            <i class='bx bx-like'></i>
                                            <span class="notification-badge">3</span>
                                        </div>

                                        <div class="notification-info">
                                            <p>Likes & Comments</p>
                                            <small>See your interactions</small>
                                        </div>

                                    </div>
                                    
                                    <div class="notification-item" data-target="my-orders">

                                        <div class="notification-icon">
                                            <i class='bx bx-package'></i>
                                            <span class="notification-badge">3</span>
                                        </div>
                                        
                                        <div class="notification-info">
                                            <p>My Orders</p>
                                            <small>Track your purchases</small>
                                        </div>

                                    </div>
                                    
                                    <div class="notification-item" data-target="system">

                                        <div class="notification-icon">
                                            <i class='bx bx-bell'></i>
                                            <span class="notification-badge">3</span>
                                        </div>

                                        <div class="notification-info">
                                            <p>System Notifications</p>
                                            <small>Important updates</small>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>

                        <button id="toggle-btn">
                            <span class="total-badge">8</span>
                            <i class='bx bx-menu'></i>
                        </button>

                    </div>
                </div>

                <!-- Search Bar -->

                <div class="search-box" >
                    <i class='bx bx-search'></i>
                    <input type="text" placeholder="Search..." id="search-input">
                </div>

                <ul class="menu">
                    <!-- Common items -->
                    <li class="${this.activeMenuItem === 'home' ? 'active' : ''}">
                        <a href="../HTML-Pages/Home.html">
                            <i class='bx bx-home'></i>
                            <span class="links_name">Home</span>
                        </a>
                    </li>
                    <li class="${this.activeMenuItem === 'explore' ? 'active' : ''}">
                        <a href="../HTML-Pages/ExplorePage.html">
                            <i class='bx bx-compass'></i>
                            <span class="links_name">Explore</span>
                        </a>
                    </li>
                    
                    <!-- Customer-only items -->
                    ${!this.isAdmin ? `
                    <li class="${this.activeMenuItem === 'saved' ? 'active' : ''} customer-only-item">
                        <a href="../HTML-Pages/SavedPage.html">
                            <i class='bx bx-heart'></i>
                            <span class="links_name">Saved</span>
                        </a>
                    </li>
                    <li class="${this.activeMenuItem === 'cart' ? 'active' : ''} customer-only-item">
                        <a href="../HTML-Pages/CartPage.html">
                            <i class='bx bx-cart'></i>
                            <span class="links_name">Cart</span>
                        </a>
                    </li>
                    ` : ''}
                    
                    <!-- Admin-only items -->
                    ${this.isAdmin ? `
                    <li class="${this.activeMenuItem === 'selling' ? 'active' : ''} admin-only-item">
                        <a href="../HTML-Pages/SellingPage.html">
                            <i class='bx bx-store'></i>
                            <span class="links_name">Selling</span>
                        </a>
                    </li>
                    ` : ''}
                    
                    <!-- Common items again -->
                    <li class="${this.activeMenuItem === 'purchase_history' ? 'active' : ''}">
                        <a href="../HTML-Pages/HistoryPage.html">
                            <i class='bx bx-history'></i>
                            <span class="links_name">Purchase History</span>
                        </a>
                    </li>
                    <li class="${this.activeMenuItem === 'settings' ? 'active' : ''}">
                        <a href="../HTML-Pages/SettingsPage.html">
                            <i class='bx bx-cog'></i>
                            <span class="links_name">Settings</span>
                        </a>
                    </li>
                    <li class="${this.activeMenuItem === 'profile' ? 'active' : ''}">
                        <a href="../HTML-Pages/ProfilePage.html">
                            <i class='bx bx-user'></i>
                            <span class="links_name">Profile</span>
                        </a>
                    </li>
                </ul>

                <div class="profile">
                    <div class="profile-details">
                        <img src="../assets/images/general-image/RamyRxr.png" alt="RamyRXR">
                        <div class="info">
                            <span id="username-display">RamyRxr</span>
                            <small id="role-display">${this.isAdmin ? 'Administrator' : 'Customer'}</small>
                        </div>
                    </div>
                    <div class="logout-wrapper">
                        <a href="#" id="theme-toggle">
                            <div class="dark-light">
                                <i class='bx ${this.isDarkMode ? 'bx-sun' : 'bx-moon'}'></i>
                            </div>
                        </a>
                        <a href="#" id="logout-link">
                            <i class='bx bx-log-out'></i>
                        </a>
                    </div>
                </div>
            </div>
        `;

        // Create sidebar element and add to container
        const sidebarContainer = document.createElement('div');
        sidebarContainer.id = 'sidebar-container';
        sidebarContainer.innerHTML = sidebarHTML;

        // Check if sidebar already exists
        const existingSidebar = document.querySelector('.sidebar');
        if (existingSidebar) {
            existingSidebar.replaceWith(sidebarContainer.firstElementChild);
        } else {
            this.container.appendChild(sidebarContainer);
        }

        // Update user info
        this.updateUserInfo();
    }

    postRenderCleanup() {
        if (this.isAdmin) {
            // Hide customer-only items using CSS as a fallback
            const customerOnlyItems = document.querySelectorAll('.customer-only-item');
            customerOnlyItems.forEach(item => {
                item.style.display = 'none';
            });

            // Show admin-only items
            const adminOnlyItems = document.querySelectorAll('.admin-only-item');
            adminOnlyItems.forEach(item => {
                item.style.display = 'block';
            });
        } else {
            // Hide admin-only items
            const adminOnlyItems = document.querySelectorAll('.admin-only-item');
            adminOnlyItems.forEach(item => {
                item.style.display = 'none';
            });

            // Show customer-only items
            const customerOnlyItems = document.querySelectorAll('.customer-only-item');
            customerOnlyItems.forEach(item => {
                item.style.display = 'block';
            });
        }
    }

    updateUserInfo() {
        try {
            const user = JSON.parse(sessionStorage.getItem('user') || '{}');
            const usernameDisplay = document.getElementById('username-display');
            const roleDisplay = document.getElementById('role-display');

            if (usernameDisplay && user.username) {
                usernameDisplay.textContent = user.username;
            }

            if (roleDisplay) {
                roleDisplay.textContent = this.isAdmin ? 'Administrator' : 'Customer';
            }
        } catch (error) {
            console.error('Error updating user info:', error);
        }
    }

    setupEventListeners() {
        // Toggle sidebar collapse
        const toggleBtn = document.getElementById('toggle-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Toggle dropdowns with mutual exclusivity
        const iconItems = document.querySelectorAll('.icon-item');
        iconItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const dropdown = item.querySelector('.dropdown-box');
                if (dropdown && !this.isCollapsed) {
                    // Close any other open dropdowns first
                    const activeDropdowns = document.querySelectorAll('.dropdown-box.active');
                    activeDropdowns.forEach(activeDropdown => {
                        if (activeDropdown !== dropdown) {
                            activeDropdown.classList.remove('active');
                        }
                    });

                    // Toggle the clicked dropdown
                    dropdown.classList.toggle('active');
                    e.stopPropagation();
                }
            });
        });

        // Menu items active state
        const menuItems = document.querySelectorAll('.menu li a');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove active class from all menu items
                document.querySelectorAll('.menu li').forEach(li => {
                    li.classList.remove('active');
                });

                // Add active class to the clicked menu item's parent li
                item.parentElement.classList.add('active');
            });
        });


        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        }

        // Logout functionality
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            const dropdowns = document.querySelectorAll('.dropdown-box.active');
            dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
        });

        // Navigate to the corresponding page based on notification item click
        const notificationItems = document.querySelectorAll('.notification-item');
        notificationItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const target = item.getAttribute('data-target');

                // Navigate to the corresponding page based on target
                switch (target) {
                    case 'orders-received':
                        window.location.href = './orders-received.html';
                        break;
                    case 'interactions':
                        window.location.href = './interactions.html';
                        break;
                    case 'my-orders':
                        window.location.href = './my-orders.html';
                        break;
                    case 'system':
                        window.location.href = './system-notifications.html';
                        break;
                }
            });
        });

        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = searchInput.value.trim();
                    if (query) {
                        window.location.href = `../HTML-Pages/ExplorePage.html?search=${encodeURIComponent(query)}`;
                    }
                }
            });
        }
    }

    logout() {
        // Clear session storage
        sessionStorage.removeItem('user');

        // Call logout API to clear server-side session
        fetch('../backend/api/auth/logout.php')
            .finally(() => {
                // Redirect to login page
                window.location.href = '../HTML-Pages/login.html';
            });
    }

    toggleSidebar() {
        this.isCollapsed = !this.isCollapsed;
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed', this.isCollapsed);
        }
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode);
        this.applyTheme();
    }

    applyTheme() {
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        const themeIcon = document.querySelector('#theme-toggle i');
        if (themeIcon) {
            themeIcon.className = this.isDarkMode ? 'bx bx-sun' : 'bx bx-moon';
        }
    }
}