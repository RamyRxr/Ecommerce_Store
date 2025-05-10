export default class SideBar2 {
    constructor(containerId = 'app', activeMenuItem = 'explore') {
        this.container = document.getElementById(containerId);
        this.isCollapsed = true; 
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.activeMenuItem = activeMenuItem;
        this.isAdmin = false; 
        this.init();
    }

    async init() {
        this.render();
        this.setupEventListeners();
        this.applyTheme();
        this.postRenderCleanup();
    }

    render() {
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        this.isAdmin = Boolean(user.is_admin);


        const sidebarHTML = `
            <div class="sidebar collapsed">
                <div class="explore-top">
                    <span class="logo">
                        <img src="../assets/images/general-image/RamyRxr.png" alt="RamyRXR" class="logo-img">
                    </span>
                </div>

                <!-- Search Bar -->
                <div class="search-box" >
                    <i class='bx bx-search'></i>
                    <input type="text" placeholder="Search..." id="search-input">
                </div>

                <ul class="menu">
                    <li class="${this.activeMenuItem === 'explore' ? 'active' : ''}">
                        <a href="../HTML-Pages/ExplorePage.html">
                            <i class='bx bx-compass'></i>
                            <span class="links_name">Explore</span>
                        </a>
                    </li>
                    ${!this.isAdmin ? `
                    <li class="${this.activeMenuItem === 'saved' ? 'active' : ''} customer-only-item">
                        <a href="../HTML-Pages/SavedPage.html">
                            <i class='bx bx-heart'></i>
                            <span class="links_name">Saved</span>
                            <span class="saved-badge">0</span>
                        </a>
                    </li>
                    <li class="${this.activeMenuItem === 'cart' ? 'active' : ''} customer-only-item">
                        <a href="../HTML-Pages/CartPage.html">
                            <i class='bx bx-cart'></i>
                            <span class="links_name">Cart</span>
                            <span class="cart-badge">0</span>
                        </a>
                    </li>
                    ` : ''}
                    ${this.isAdmin ? `
                    <li class="${this.activeMenuItem === 'selling' ? 'active' : ''} admin-only-item">
                        <a href="../HTML-Pages/SellingPage.html">
                            <i class='bx bx-store'></i>
                            <span class="links_name">Selling</span>
                        </a>
                    </li>
                    ` : ''}
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
                            <span id="username-display">User</span>
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

            // Update cart and saved counts for customers
            this.updateCartCount();
            this.updateSavedCount();
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

        // Search functionality
        const searchInput = document.getElementById('search-input'); // The input field in the sidebar
        if (searchInput) {
            // Handles search submission when Enter is pressed in the sidebar search input
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = searchInput.value.trim();
                    if (query) {
                        // If there's a query, navigate with it
                        window.location.href = `../HTML-Pages/ExplorePage.html?search=${encodeURIComponent(query)}`;
                    } else {
                        // If no query, just go to Explore page and signal focus
                        sessionStorage.setItem('focusSearch', 'true');
                        window.location.href = '../HTML-Pages/ExplorePage.html';
                    }
                }
            });
        }

        // Event listener for the whole search box container click
        const searchBox = document.querySelector('.sidebar .search-box');
        if (searchBox) {
            searchBox.addEventListener('click', (e) => {
                // If the click target is the input field itself, do nothing.
                // This allows the input to be focused, and the user can type.
                // The 'keypress' event listener on 'search-input' will handle search submission.
                if (e.target.id === 'search-input') {
                    return;
                }

                // For any other click within the search-box (e.g., on the icon or the div's padding),
                // set the sessionStorage flag and navigate to the Explore page.
                sessionStorage.setItem('focusSearch', 'true');
                window.location.href = '../HTML-Pages/ExplorePage.html';
            });
        }

        // Add event listeners for badge updates
        document.addEventListener('updateCartBadge', () => {
            this.updateCartCount();
        });

        document.addEventListener('updateSavedBadge', () => {
            this.updateSavedCount();
        });
    }

    logout() {
        sessionStorage.removeItem('user');
        fetch('../backend/api/auth/logout.php')
            .finally(() => {
                window.location.href = '../HTML-Pages/login.html';
            });
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode);
        this.applyTheme();

        const themeIcon = document.querySelector('.dark-light i');
        if (themeIcon) {
            themeIcon.className = this.isDarkMode ? 'bx bx-sun' : 'bx bx-moon';
        }
    }

    applyTheme() {
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }

    async updateCartCount() {
        if (this.isAdmin) return;

        try {
            const response = await fetch('../backend/api/cart/get_cart.php');
            if (!response.ok) throw new Error('Failed to fetch cart items');

            const data = await response.json();
            const cartItems = data.success ? data.data : [];

            // Calculate total items
            const itemCount = cartItems.reduce((total, item) => total + parseInt(item.quantity || 1), 0);

            // Update the badge
            const cartBadge = document.querySelector('.cart-badge');
            if (cartBadge) {
                if (itemCount > 0) {
                    cartBadge.textContent = itemCount;
                    cartBadge.style.display = 'flex';
                } else {
                    cartBadge.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Error updating cart count:', error);
        }
    }

    async updateSavedCount() {
        if (this.isAdmin) return; // Skip for admin users

        try {
            // Get saved items count from database
            const response = await fetch('../backend/api/saved/get_saved_items.php');
            if (!response.ok) throw new Error('Failed to fetch saved items');

            const data = await response.json();
            const savedItems = data.success ? data.data : [];

            // Update the badge
            const savedBadge = document.querySelector('.saved-badge');
            if (savedBadge) {
                if (savedItems.length > 0) {
                    savedBadge.textContent = savedItems.length;
                    savedBadge.style.display = 'flex';
                } else {
                    savedBadge.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Error updating saved count:', error);
        }
    }

    debugSidebar() {
        console.group('SideBar2 Debug Info');
        console.log('Is Admin:', this.isAdmin);
        console.log('Active Menu Item:', this.activeMenuItem);
        console.log('Is Collapsed:', this.isCollapsed);
        console.log('Is Dark Mode:', this.isDarkMode);

        const savedMenuItem = document.querySelector('.sidebar li a i.bx-heart')?.parentElement.parentElement;
        const cartMenuItem = document.querySelector('.sidebar li a i.bx-cart')?.parentElement.parentElement;
        const sellingMenuItem = document.querySelector('.sidebar li a i.bx-store')?.parentElement.parentElement;

        console.log('Saved Menu Item Present:', !!savedMenuItem);
        console.log('Cart Menu Item Present:', !!cartMenuItem);
        console.log('Selling Menu Item Present:', !!sellingMenuItem);

        if (savedMenuItem) console.log('Saved Display:', savedMenuItem.style.display);
        if (cartMenuItem) console.log('Cart Display:', cartMenuItem.style.display);
        if (sellingMenuItem) console.log('Selling Display:', sellingMenuItem.style.display);

        const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
        console.log('User Data in Session:', userData);
        console.groupEnd();
    }
}