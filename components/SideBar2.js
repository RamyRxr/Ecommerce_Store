export default class SideBar2 {
    constructor(containerId = 'app', activeMenuItem = 'explore') {
        this.container = document.getElementById(containerId);
        this.isCollapsed = true; // Always collapsed
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.activeMenuItem = activeMenuItem; // Add this parameter
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
        this.applyTheme();
        this.updateCartCount();
        this.updateSavedCount(); // Add this call
    }

    render() {
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
                    <li class="${this.activeMenuItem === 'saved' ? 'active' : ''}">
                        <a href="../HTML-Pages/SavedPage.html">
                            <i class='bx bx-heart'></i>
                            <span class="links_name">Saved</span>
                            <span class="saved-badge">0</span>
                        </a>
                    </li>
                    <li class="${this.activeMenuItem === 'cart' ? 'active' : ''}">
                        <a href="../HTML-Pages/CartPage.html">
                            <i class='bx bx-cart'></i>
                            <span class="links_name">Cart</span>
                            <span class="cart-badge">0</span>
                        </a>
                    </li>
                    <li class="${this.activeMenuItem === 'selling' ? 'active' : ''}">
                        <a href="../HTML-Pages/SellingPage.html">
                            <i class='bx bx-store'></i>
                            <span class="links_name">Selling</span>
                        </a>
                    </li>
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
                        <a href="../HTML-Pages/Profile.html">
                            <i class='bx bx-user'></i>
                            <span class="links_name">Profile</span>
                        </a>
                    </li>
                </ul>

                <div class="profile">
                    <div class="profile-details">
                        <img src="../assets/images/general-image/RamyRxr.png" alt="RamyRXR">
                        <div class="info">
                            <span>RamyRxr</span>
                            <small>Developer</small>
                        </div>
                    </div>
                    <div class="logout-wrapper">
                        <a href="#" id="theme-toggle">
                            <div class="dark-light">
                                <i class='bx ${this.isDarkMode ? 'bx-sun' : 'bx-moon'}'></i>
                            </div>
                        </a>
                        <a href="../HTML-Pages/login.html">
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
    }

    setupEventListeners() {
        // No toggle button for this sidebar - it must always remain collapsed

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        }

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

        // Listen for cart updates
        document.addEventListener('updateCartBadge', () => {
            this.updateCartCount();
        });
        
        // Add listener for saved updates
        document.addEventListener('updateSavedBadge', () => {
            this.updateSavedCount();
        });
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

    // Add this method to the SideBar2 class
    updateCartCount() {
        try {
            // Get cart items from localStorage
            const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

            // Calculate total items
            const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

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

    // Add a new method to update saved count
    updateSavedCount() {
        try {
            // Get saved items from localStorage
            const savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];

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
}