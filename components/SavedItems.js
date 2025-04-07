export default class SavedItems {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.savedItems = [];
        this.deletedItems = {}; // Track deleted items for undo functionality
        this.deleteTimers = {}; // Track deletion timers
        this.progressIntervals = {}; // Add this to track progress bar intervals
        this.currentPage = 1;
        this.itemsPerPage = 35; // 5 columns × 7 rows = 35 items per page
        this.createNotificationContainer(); // Add this line to create global notification container
        this.init();
    }
    
    // Add this method to create a global notification container
    createNotificationContainer() {
        // Remove any existing notification container
        const existingContainer = document.querySelector('.global-notification-container');
        if (existingContainer) return;
        
        // Create a new container appended to body
        const container = document.createElement('div');
        container.className = 'notification-container global-notification-container';
        document.body.appendChild(container);
    }

    async init() {
        await this.loadSavedItems();
        this.render();
        this.setupEventListeners();
    }

    async loadSavedItems() {
        try {
            // Get saved items from localStorage
            const savedItemsJson = localStorage.getItem('savedItems');
            
            if (savedItemsJson) {
                let savedItems = JSON.parse(savedItemsJson);
                
                // Ensure all items have the isSaved flag set to true
                savedItems = savedItems.map(item => ({
                    ...item,
                    isSaved: true
                }));
                
                this.savedItems = savedItems;
            } else {
                // Demo data if no saved items exist
                console.log('No saved items found, using demo data');
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
                        dateAdded: new Date().toISOString()
                    },
                    // Other demo items...
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

    // Update the removeItem method
    removeItem(itemId) {
        // Find the item in the savedItems array
        const itemIndex = this.savedItems.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return;

        // Store the item for potential undo
        this.deletedItems[itemId] = {
            item: this.savedItems[itemIndex],
            index: itemIndex,
            timestamp: new Date().getTime() // Add timestamp for notification display
        };

        // Remove the item from the savedItems array
        this.savedItems.splice(itemIndex, 1);

        // Update localStorage - make sure to mark as not saved
        let allSavedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
        allSavedItems = allSavedItems.filter(item => item.id !== itemId);
        localStorage.setItem('savedItems', JSON.stringify(allSavedItems));

        // Update the UI first
        this.updateItemCards();
        this.updatePagination();
        
        // Update item count in header
        const itemCountElement = document.querySelector('.saved-header p');
        if (itemCountElement) {
            itemCountElement.textContent = `${this.savedItems.length} items saved`;
        }

        // Show notification with timer AFTER UI update
        this.showNotification(itemId);

        // Set timer for permanent deletion - changed to 5 seconds
        if (this.deleteTimers[itemId]) {
            clearTimeout(this.deleteTimers[itemId]);
        }

        this.deleteTimers[itemId] = setTimeout(() => {
            this.permanentlyDeleteItem(itemId);
        }, 5000); // 5 seconds

        // If no items left, show the empty state
        if (this.savedItems.length === 0) {
            this.render();
        }
        
        // Dispatch event to update saved badge
        document.dispatchEvent(new CustomEvent('updateSavedBadge'));
    }

    // Update undoRemove method to handle progress intervals
    undoRemove(itemId) {
        // Check if the item exists in deletedItems
        if (!this.deletedItems[itemId]) return;

        // Clear the delete timer
        if (this.deleteTimers[itemId]) {
            clearTimeout(this.deleteTimers[itemId]);
            delete this.deleteTimers[itemId];
        }
        
        // Clear the progress interval if it exists
        if (this.progressIntervals[itemId]) {
            clearInterval(this.progressIntervals[itemId]);
            delete this.progressIntervals[itemId];
        }

        // Rest of the method stays the same
        const { item, index } = this.deletedItems[itemId];

        if (index < this.savedItems.length) {
            this.savedItems.splice(index, 0, item);
        } else {
            this.savedItems.push(item);
        }

        delete this.deletedItems[itemId];

        let allSavedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
        if (!allSavedItems.some(savedItem => savedItem.id === item.id)) {
            allSavedItems.push({
                ...item,
                isSaved: true
            });
        }
        localStorage.setItem('savedItems', JSON.stringify(allSavedItems));

        this.removeNotification(itemId);
        this.updateItemCards();
        this.updatePagination();
        
        const itemCountElement = document.querySelector('.saved-header p');
        if (itemCountElement) {
            itemCountElement.textContent = `${this.savedItems.length} items saved`;
        }

        if (this.savedItems.length === 1) {
            this.render();
        }
        
        // Dispatch event to update saved badge
        document.dispatchEvent(new CustomEvent('updateSavedBadge'));
    }

    // Update permanentlyDeleteItem method to clear progress intervals
    permanentlyDeleteItem(itemId) {
        // Clear the progress interval if it exists
        if (this.progressIntervals[itemId]) {
            clearInterval(this.progressIntervals[itemId]);
            delete this.progressIntervals[itemId];
        }
        
        // Remove from deletedItems
        delete this.deletedItems[itemId];
        delete this.deleteTimers[itemId];

        // Remove the notification
        this.removeNotification(itemId);
    }

    // Update showNotification method with timer display
    showNotification(itemId) {
        const notificationContainer = document.querySelector('.global-notification-container');
        if (!notificationContainer) {
            console.error('Notification container not found');
            return;
        }

        const item = this.deletedItems[itemId].item;
        const notification = document.createElement('div');
        notification.className = 'notification fade-in';
        notification.dataset.id = itemId;

        // Calculate time remaining - 5 seconds
        const secondsRemaining = 5;
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class='bx bx-check-circle notification-icon'></i>
                <div class="notification-text">
                    <p>"${item.name}" removed from saved items</p>
                    <button class="undo-btn" data-id="${itemId}">Undo</button>
                    <span class="notification-time">${secondsRemaining}s</span>
                </div>
                <button class="close-notification-btn">
                    <i class='bx bx-x'></i>
                </button>
            </div>
            <div class="notification-progress"></div>
        `;

        notificationContainer.appendChild(notification);

        // Initialize timer display and progress bar
        const timeDisplay = notification.querySelector('.notification-time');
        const progressBar = notification.querySelector('.notification-progress');
        
        if (progressBar) {
            // Use CSS transition for smooth progress bar animation
            progressBar.style.transition = 'width 5s linear';
            
            // Force a reflow before changing the width to ensure the transition works
            void progressBar.offsetWidth;
            
            // Start with full width
            progressBar.style.width = '100%';
            
            // After a tiny delay, set width to 0 to start the animation
            setTimeout(() => {
                progressBar.style.width = '0%';
            }, 50);
        }
        
        // Create a countdown timer that updates every second
        let timeLeft = secondsRemaining;
        
        this.progressIntervals[itemId] = setInterval(() => {
            timeLeft--;
            
            if (timeDisplay) {
                timeDisplay.textContent = `${timeLeft}s`;
            }
            
            if (timeLeft <= 0) {
                clearInterval(this.progressIntervals[itemId]);
                delete this.progressIntervals[itemId];
            }
        }, 1000);

        // Add event listeners for this specific notification
        notification.querySelector('.close-notification-btn').addEventListener('click', () => {
            if (this.deleteTimers[itemId]) {
                clearTimeout(this.deleteTimers[itemId]);
            }
            if (this.progressIntervals[itemId]) {
                clearInterval(this.progressIntervals[itemId]);
                delete this.progressIntervals[itemId];
            }
            this.permanentlyDeleteItem(itemId);
            this.removeNotification(itemId);
        });

        notification.querySelector('.undo-btn').addEventListener('click', () => {
            this.undoRemove(itemId);
        });
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