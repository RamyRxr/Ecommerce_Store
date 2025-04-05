export default class SavedItems {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.savedItems = [];
        this.deletedItems = {}; // Track deleted items for undo functionality
        this.deleteTimers = {}; // Track deletion timers
        this.currentPage = 1;
        this.itemsPerPage = 35; // 5 columns × 7 rows = 35 items per page
        this.init();
    }

    async init() {
        await this.loadSavedItems();
        this.render();
        this.setupEventListeners();
    }

    async loadSavedItems() {
        try {
            // In a real app, this would fetch from a backend API
            // For demonstration, we'll check localStorage first, and if empty, use demo data
            const savedItemsJson = localStorage.getItem('savedItems');
            
            if (savedItemsJson) {
                this.savedItems = JSON.parse(savedItemsJson);
            } else {
                // Demo data - we'll use the same product structure as in ExploreContents
                const demoSavedItems = [
                    {
                        id: 1,
                        name: "Sony WH-1000XM5",
                        description: "Premium noise-cancelling headphones with industry-leading sound quality and battery life.",
                        price: 349.99,
                        originalPrice: 399.99,
                        category: "headphones",
                        brand: "sony",
                        rating: 4.8,
                        ratingCount: 1254,
                        image: "../assets/images/products-images/product-1.svg",
                        isSale: true,
                        isNew: false,
                        isSaved: true,
                        dateAdded: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                    },
                    {
                        id: 2,
                        name: "iPhone 15 Pro",
                        description: "Apple's latest flagship smartphone with A17 Pro chip, titanium design and 48MP camera.",
                        price: 999.99,
                        originalPrice: null,
                        category: "smartphones",
                        brand: "apple",
                        rating: 4.7,
                        ratingCount: 857,
                        image: "../assets/images/products-images/product-2.svg",
                        isSale: false,
                        isNew: true,
                        isSaved: true,
                        dateAdded: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                    },
                    {
                        id: 5,
                        name: "Sony Alpha A7 IV",
                        description: "Full-frame mirrorless camera with 33MP sensor, 4K60p video and advanced autofocus.",
                        price: 2499.99,
                        originalPrice: 2699.99,
                        category: "cameras",
                        brand: "sony",
                        rating: 4.7,
                        ratingCount: 329,
                        image: "../assets/images/products-images/product-5.svg",
                        isSale: true,
                        isNew: false,
                        isSaved: true,
                        dateAdded: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                    }
                ];
                
                this.savedItems = demoSavedItems;
                localStorage.setItem('savedItems', JSON.stringify(demoSavedItems));
            }
            
            // Sort by date added (newest first)
            this.savedItems.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
            
        } catch (error) {
            console.error('Error loading saved items:', error);
            this.savedItems = [];
        }
    }

    render() {
        const savedContentHTML = `
            <div class="saved-content">
                <div class="main-content-container">
                    <div class="saved-header">
                        <h1>Saved Items</h1>
                        <p>${this.savedItems.length} items saved</p>
                    </div>
                    
                    <div class="notification-container">
                        <!-- Deleted item notifications will be displayed here -->
                    </div>
                    
                    <div class="items-grid">
                        ${this.savedItems.length > 0 ? '' : `
                            <div class="no-items">
                                <div class="no-items-icon">
                                    <i class='bx bx-bookmark-heart'></i>
                                </div>
                                <h3>No Saved Items Yet</h3>
                                <p>Items you save will appear here. Start exploring to find products you love!</p>
                                <a href="ExplorePage.html" class="explore-btn">
                                    <i class='bx bx-compass'></i>
                                    Explore Products
                                </a>
                            </div>
                        `}
                        <!-- Saved item cards will be inserted here -->
                    </div>
                    
                    <div class="pagination-container">
                        <div class="pagination">
                            <!-- Pagination will be inserted here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        const savedContentContainer = document.createElement('div');
        savedContentContainer.innerHTML = savedContentHTML;

        // Check if saved content already exists
        const existingSavedContent = document.querySelector('.saved-content');
        if (existingSavedContent) {
            existingSavedContent.replaceWith(savedContentContainer.firstElementChild);
        } else {
            this.container.appendChild(savedContentContainer.firstElementChild);
        }

        this.updateItemCards();
        this.updatePagination();
    }

    updateItemCards() {
        const itemsGrid = document.querySelector('.items-grid');
        if (!itemsGrid) return;

        // If there are no saved items, show the no-items message (already handled in render)
        if (this.savedItems.length === 0) {
            return;
        }

        // Clear existing items
        itemsGrid.innerHTML = '';

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.savedItems.length);
        const paginatedItems = this.savedItems.slice(startIndex, endIndex);

        paginatedItems.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'item-card';
            itemCard.dataset.id = item.id;

            // Generate stars based on rating
            const fullStars = Math.floor(item.rating);
            const hasHalfStar = item.rating % 1 >= 0.5;

            let starsHTML = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= fullStars) {
                    starsHTML += `<i class='bx bxs-star'></i>`;
                } else if (i === fullStars + 1 && hasHalfStar) {
                    starsHTML += `<i class='bx bxs-star-half'></i>`;
                } else {
                    starsHTML += `<i class='bx bx-star'></i>`;
                }
            }

            // Truncate description if longer than 52 characters
            const truncatedDescription = item.description.length > 52
                ? item.description.substring(0, 52) + '...'
                : item.description;

            itemCard.innerHTML = `
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}">
                    <button class="delete-btn" title="Remove from saved items">
                        <i class='bx bx-trash'></i>
                    </button>
                </div>
                <div class="item-info">
                    <h3 class="item-name">${item.name}</h3>
                    <p class="item-description">${truncatedDescription}</p>
                    <div class="item-meta">
                        <div class="price-container">
                            ${item.originalPrice ?
                                `<span class="old-price">$${item.originalPrice.toFixed(2)}</span>` : ''
                            }
                            <span class="item-price">$${item.price.toFixed(2)}</span>
                        </div>
                        <div class="item-rating">
                            <div class="stars">${starsHTML}</div>
                            <span class="rating-count">(${item.ratingCount})</span>
                        </div>
                    </div>
                    <a href="ItemDetail.html?id=${item.id}" class="view-details-btn">
                        <i class='bx bx-show'></i>
                        View Details
                    </a>
                </div>
            `;

            // Make entire card clickable
            itemCard.addEventListener('click', (e) => {
                // Don't navigate if clicking the delete button
                if (!e.target.closest('.delete-btn')) {
                    window.location.href = `ItemDetail.html?id=${item.id}`;
                }
            });

            itemsGrid.appendChild(itemCard);
        });
    }

    updatePagination() {
        const paginationContainer = document.querySelector('.pagination');
        if (!paginationContainer) return;

        const totalPages = Math.max(1, Math.ceil(this.savedItems.length / this.itemsPerPage));

        let paginationHTML = '';

        // Prev button
        paginationHTML += `
            <button class="pagination-btn prev-btn" ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class='bx bx-chevron-left'></i>
            </button>
        `;

        // Page numbers with dynamic styling
        if (totalPages <= 7) {
            // Show all pages if 7 or fewer
            for (let i = 1; i <= totalPages; i++) {
                paginationHTML += `
                    <button class="pagination-btn page-number ${i === this.currentPage ? 'active' : ''}" 
                            data-page="${i}">
                        ${i}
                    </button>
                `;
            }
        } else {
            // Show first page, current page and neighbors, and last page
            paginationHTML += `
                <button class="pagination-btn page-number ${this.currentPage === 1 ? 'active' : ''}" data-page="1">1</button>
            `;

            if (this.currentPage > 3) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }

            // Pages around current page
            const start = Math.max(2, this.currentPage - 1);
            const end = Math.min(totalPages - 1, this.currentPage + 1);

            for (let i = start; i <= end; i++) {
                paginationHTML += `
                    <button class="pagination-btn page-number ${i === this.currentPage ? 'active' : ''}" 
                            data-page="${i}">
                        ${i}
                    </button>
                `;
            }

            if (this.currentPage < totalPages - 2) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }

            paginationHTML += `
                <button class="pagination-btn page-number ${this.currentPage === totalPages ? 'active' : ''}" 
                        data-page="${totalPages}">
                    ${totalPages}
                </button>
            `;
        }

        // Next button
        paginationHTML += `
            <button class="pagination-btn next-btn" ${this.currentPage === totalPages ? 'disabled' : ''}>
                <i class='bx bx-chevron-right'></i>
            </button>
        `;

        paginationContainer.innerHTML = paginationHTML;
    }

    setupEventListeners() {
        // Delete button click event
        document.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn) {
                e.preventDefault();
                e.stopPropagation();
                
                const itemCard = deleteBtn.closest('.item-card');
                const itemId = parseInt(itemCard.dataset.id);
                
                this.removeItem(itemId);
            }
        });

        // Pagination events
        document.addEventListener('click', e => {
            // Page number buttons
            if (e.target.matches('.pagination-btn.page-number')) {
                this.currentPage = parseInt(e.target.dataset.page);
                this.updateItemCards();
                this.updatePagination();
                window.scrollTo(0, 0);
            }

            // Prev button
            if (e.target.matches('.prev-btn') || e.target.closest('.prev-btn')) {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.updateItemCards();
                    this.updatePagination();
                    window.scrollTo(0, 0);
                }
            }

            // Next button
            if (e.target.matches('.next-btn') || e.target.closest('.next-btn')) {
                const totalPages = Math.ceil(this.savedItems.length / this.itemsPerPage);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.updateItemCards();
                    this.updatePagination();
                    window.scrollTo(0, 0);
                }
            }
        });

        // Undo button event
        document.addEventListener('click', (e) => {
            const undoBtn = e.target.closest('.undo-btn');
            if (undoBtn) {
                const itemId = parseInt(undoBtn.dataset.id);
                this.undoRemove(itemId);
            }
        });
    }

    removeItem(itemId) {
        // Find the item in the savedItems array
        const itemIndex = this.savedItems.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return;

        // Store the item for potential undo
        this.deletedItems[itemId] = {
            item: this.savedItems[itemIndex],
            index: itemIndex
        };

        // Remove the item from the savedItems array
        this.savedItems.splice(itemIndex, 1);

        // Update localStorage
        localStorage.setItem('savedItems', JSON.stringify(this.savedItems));

        // Show notification with undo option
        this.showNotification(itemId);

        // Set a timer to permanently delete after 10 seconds
        if (this.deleteTimers[itemId]) {
            clearTimeout(this.deleteTimers[itemId]);
        }

        this.deleteTimers[itemId] = setTimeout(() => {
            this.permanentlyDeleteItem(itemId);
        }, 10000); // 10 seconds

        // Re-render the item cards and pagination
        this.updateItemCards();
        this.updatePagination();
        
        // Update item count in header
        const itemCountElement = document.querySelector('.saved-header p');
        if (itemCountElement) {
            itemCountElement.textContent = `${this.savedItems.length} items saved`;
        }

        // If no items left, show the empty state
        if (this.savedItems.length === 0) {
            this.render();
        }
    }

    undoRemove(itemId) {
        // Check if the item exists in deletedItems
        if (!this.deletedItems[itemId]) return;

        // Clear the delete timer
        if (this.deleteTimers[itemId]) {
            clearTimeout(this.deleteTimers[itemId]);
            delete this.deleteTimers[itemId];
        }

        // Get the deleted item info
        const { item, index } = this.deletedItems[itemId];

        // Re-insert the item at the original position if possible, or at the beginning
        if (index < this.savedItems.length) {
            this.savedItems.splice(index, 0, item);
        } else {
            this.savedItems.push(item);
        }

        // Remove from deletedItems
        delete this.deletedItems[itemId];

        // Update localStorage
        localStorage.setItem('savedItems', JSON.stringify(this.savedItems));

        // Remove the notification
        this.removeNotification(itemId);

        // Re-render the cards and pagination
        this.updateItemCards();
        this.updatePagination();
        
        // Update item count in header
        const itemCountElement = document.querySelector('.saved-header p');
        if (itemCountElement) {
            itemCountElement.textContent = `${this.savedItems.length} items saved`;
        }

        // If this was the first item added back to an empty list, re-render entire component
        if (this.savedItems.length === 1) {
            this.render();
        }
    }

    permanentlyDeleteItem(itemId) {
        // Remove from deletedItems
        delete this.deletedItems[itemId];
        delete this.deleteTimers[itemId];

        // Remove the notification
        this.removeNotification(itemId);
    }

    showNotification(itemId) {
        const notificationContainer = document.querySelector('.notification-container');
        if (!notificationContainer) return;

        const item = this.deletedItems[itemId].item;
        const notification = document.createElement('div');
        notification.className = 'notification fade-in';
        notification.dataset.id = itemId;

        notification.innerHTML = `
            <div class="notification-content">
                <i class='bx bx-check-circle notification-icon'></i>
                <div class="notification-text">
                    <p>"${item.name}" removed from saved items</p>
                    <button class="undo-btn" data-id="${itemId}">Undo</button>
                </div>
                <button class="close-notification-btn">
                    <i class='bx bx-x'></i>
                </button>
            </div>
            <div class="notification-progress"></div>
        `;

        notificationContainer.appendChild(notification);

        // Start the progress bar animation
        setTimeout(() => {
            const progressBar = notification.querySelector('.notification-progress');
            if (progressBar) {
                progressBar.style.width = '0%';
            }
        }, 50);

        // Add close button functionality
        const closeBtn = notification.querySelector('.close-notification-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.removeNotification(itemId);
            });
        }
    }

    removeNotification(itemId) {
        const notification = document.querySelector(`.notification[data-id="${itemId}"]`);
        if (notification) {
            notification.classList.remove('fade-in');
            notification.classList.add('fade-out');
            
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }
}