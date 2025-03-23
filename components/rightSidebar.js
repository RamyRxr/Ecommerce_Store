/**
 * Right Sidebar Component
 * Generates and manages the right sidebar functionality
 */
export default class RightSidebar {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.isHidden = false;
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        const rightSidebarHTML = `
            <div class="right-sidebar${this.isHidden ? ' hidden' : ''}">
                <!-- Close Button -->
                <button id="close-sidebar" class="sidebar-toggle">
                    <i class='bx bx-chevron-right'></i>
                </button>
                
                <!-- Newest Items Section -->
                <div class="newest-items">
                    <div class="section-header">
                        <h3>Newest Items</h3>
                        <a href="#" class="see-more">See more <i class='bx bx-right-arrow-alt'></i></a>
                    </div>
                    <div class="item-card">
                        <div class="item-img">
                            <img src="./products/newestItem-1.svg" alt="New Item">
                            <span class="new-badge">NEW</span>
                        </div>
                        <div class="item-info">
                            <h4>Wireless Gaming Headset Pro</h4>
                            <p class="price">129.99</p>
                            <p class="item-desc">Premium sound quality with noise cancellation</p>
                            <div class="item-stats">
                                <span><i class='bx bx-show'></i> 342</span>
                                <span><i class='bx bx-time'></i> Just added</span>
                            </div>
                            <button class="view-btn">View Details</button>
                        </div>
                    </div>
                </div>

                <!-- Daily Deals Section -->
                <div class="daily-deals">
                    <div class="section-header">
                        <h3>Daily Deals</h3>
                        <a href="#" class="view-all">View all <i class='bx bx-right-arrow-alt'></i></a>
                    </div>
                    <div class="deals-container">
                        ${this.generateDealItems()}
                    </div>
                </div>
            </div>
        `;

        // Create right sidebar element and add to container
        const rightSidebarContainer = document.createElement('div');
        rightSidebarContainer.id = 'right-sidebar-container';
        rightSidebarContainer.innerHTML = rightSidebarHTML;
        
        // Check if right sidebar already exists
        const existingRightSidebar = document.querySelector('.right-sidebar');
        if (existingRightSidebar) {
            existingRightSidebar.replaceWith(rightSidebarContainer.firstElementChild);
        } else {
            this.container.appendChild(rightSidebarContainer);
        }
    }

    generateDealItems() {
        const dealItems = [
            {
                id: 1,
                name: 'beats new studio blue headset',
                price: 99.99,
                views: '1.2k',
                left: 45,
                image: './products/product-1.svg'
            },
            {
                id: 2,
                name: 'beats pro wireless Headset',
                price: 79.99,
                views: '856',
                left: 12,
                image: './products/product-2.svg'
            },
            {
                id: 3,
                name: 'Apple AirPods Pro',
                price: 129.99,
                views: '1.5k',
                left: 8,
                image: './products/product-3.svg'
            },
            {
                id: 4,
                name: 'Lenovo Wired Headphone',
                price: 49.99,
                views: '678',
                left: 25,
                image: './products/product-4.svg'
            },
            {
                id: 5,
                name: 'Logic3 Cavallino T250 Headset',
                price: 199.99,
                views: '2.3k',
                left: 3,
                image: './products/product-5.svg'
            },
            {
                id: 6,
                name: 'Musicians Choice Stereo',
                price: 89.99,
                views: '945',
                left: 17,
                image: './products/product-6.svg'
            }
        ];

        return dealItems.map(item => `
            <a href="/product/${item.id}" class="deal-item">
                <div class="item-img">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p class="price">${item.price}</p>
                    <div class="item-stats">
                        <span><i class='bx bx-show'></i> ${item.views}</span>
                        <span><i class='bx bx-package'></i> ${item.left} left</span>
                    </div>
                </div>
            </a>
        `).join('');
    }

    setupEventListeners() {
        // Toggle right sidebar visibility
        const closeSidebarBtn = document.getElementById('close-sidebar');
        if (closeSidebarBtn) {
            closeSidebarBtn.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
    }

    toggleSidebar() {
        this.isHidden = !this.isHidden;
        const rightSidebar = document.querySelector('.right-sidebar');
        if (rightSidebar) {
            rightSidebar.classList.toggle('hidden', this.isHidden);
        }
    }
}