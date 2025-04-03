export default class SideBar {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.isCollapsed = false;
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
        this.applyTheme();
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
                    <li class="active">
                        <a href="#">
                            <i class='bx bx-home'></i>
                            <span class="links_name">Home</span>
                        </a>
                    </li>
                    <li>
                        <a href="#">
                            <i class='bx bx-compass'></i>
                            <span class="links_name">Explore</span>
                        </a>
                    </li>
                    <li>
                        <a href="#">
                            <i class='bx bx-heart'></i>
                            <span class="links_name">Saved</span>
                        </a>
                    </li>
                    <li>
                        <a href="#">
                            <i class='bx bx-cart'></i>
                            <span class="links_name">Cart</span>
                        </a>
                    </li>
                    <li>
                        <a href="#">
                            <i class='bx bx-store'></i>
                            <span class="links_name">Selling</span>
                        </a>
                    </li>
                    <li>
                        <a href="#">
                            <i class='bx bx-history'></i>
                            <span class="links_name">Purchase History</span>
                        </a>
                    </li>
                    <li>
                        <a href="#">
                            <i class='bx bx-cog'></i>
                            <span class="links_name">Settings</span>
                        </a>
                    </li>
                    <li>
                        <a href="#">
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
                                <i class='bx bx-moon'></i>
                            </div>
                        </a>
                        <a href="../HTML-Pages/login.html" id="theme-toggle">
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
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
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
                switch(target) {
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