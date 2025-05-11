export default class SavedItems {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.savedItems = [];
        this.deletedItems = {}; 
        this.deleteTimers = {}; 
        this.progressIntervals = {}; 
        this.currentPage = 1;
        this.itemsPerPage = 35; 
        this.createNotificationContainer(); 
        this.init();
    }

    createNotificationContainer() {
        const existingContainer = document.querySelector('.global-notification-container');
        if (existingContainer) return;

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
            const response = await fetch('../backend/api/saved/get_saved_items.php');
            if (!response.ok) throw new Error('Failed to fetch saved items');

            const data = await response.json();

            if (data.success) {
                this.savedItems = data.data.map(item => {
                    const hasImages = item.images && Array.isArray(item.images) && item.images.length > 0;

                    return {
                        id: item.id,
                        name: item.title,
                        description: item.description || '',
                        price: parseFloat(item.price || 0),
                        originalPrice: item.original_price ? parseFloat(item.original_price) : null,
                        rating: parseFloat(item.rating || 0),
                        ratingCount: parseInt(item.rating_count || 0),
                        image: hasImages && item.images[0]
                            ? `${item.images[0].includes('uploads/')
                                ? '../' + item.images[0]
                                : '../backend/uploads/products/' + item.images[0]}`
                            : '../assets/images/placeholder.svg', 
                        images: hasImages
                            ? item.images.map(img =>
                                `${img.includes('uploads/')
                                    ? '../' + img
                                    : '../backend/uploads/products/' + img}`
                            )
                            : []
                    };
                });

                console.log('Loaded saved items:', this.savedItems);
            } else {
                throw new Error(data.message || 'Failed to load saved items');
            }
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
                    </div>
                    
                    <div class="pagination-container">
                        <div class="pagination">
                        </div>
                    </div>
                </div>
            </div>
        `;

        const savedContentContainer = document.createElement('div');
        savedContentContainer.innerHTML = savedContentHTML;

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

        if (this.savedItems.length === 0) {
            itemsGrid.innerHTML = `
                            <div class="no-items">
                                <div class="no-items-icon">
                                    <i class='bx bx-bookmark-heart'></i>
                                </div>
                                <h3>No Saved Items Yet</h3>
                                <p>Items you save will appear here. Start exploring to find products you love!</p>
                                <a href="../HTML-Pages/ExplorePage.html" class="explore-btn">
                                    <i class='bx bx-compass'></i>
                                    Explore Products
                                </a>
                            </div>`;
            return;
        }

        itemsGrid.innerHTML = '';

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.savedItems.length);
        const paginatedItems = this.savedItems.slice(startIndex, endIndex);

        paginatedItems.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'item-card';
            itemCard.dataset.id = item.id;

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

            const truncatedDescription = item.description && item.description.length > 52
                ? item.description.substring(0, 52) + '...'
                : item.description || '';

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
                    <a href="../HTML-Pages/ItemDetailsPage.html?id=${item.id}" class="view-details-btn">
                        <i class='bx bx-show'></i>
                        View Details
                    </a>
                </div>
            `;

            itemCard.addEventListener('click', (e) => {
                if (!e.target.closest('.delete-btn')) {
                    window.location.href = `../HTML-Pages/ItemDetailsPage.html?id=${item.id}`;
                }
            });

            itemsGrid.appendChild(itemCard);
        });
    }

    updatePagination() {
        const paginationContainer = document.querySelector('.pagination-container');
        if (!paginationContainer) return;

        if (this.savedItems.length === 0) {
            paginationContainer.style.display = 'none';
            return;
        } else {
            paginationContainer.style.display = 'flex';
        }

        const pagination = document.querySelector('.pagination');
        if (!pagination) return;

        const totalPages = Math.max(1, Math.ceil(this.savedItems.length / this.itemsPerPage));

        let paginationHTML = '';

        paginationHTML += `
            <button class="pagination-btn prev-btn" ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class='bx bx-chevron-left'></i>
            </button>
        `;

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                paginationHTML += `
                    <button class="pagination-btn page-number ${i === this.currentPage ? 'active' : ''}" 
                            data-page="${i}">
                        ${i}
                    </button>
                `;
            }
        } else {
            paginationHTML += `
                <button class="pagination-btn page-number ${this.currentPage === 1 ? 'active' : ''}" data-page="1">1</button>
            `;

            if (this.currentPage > 3) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }

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

        paginationHTML += `
            <button class="pagination-btn next-btn" ${this.currentPage === totalPages ? 'disabled' : ''}>
                <i class='bx bx-chevron-right'></i>
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    setupEventListeners() {
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

        document.addEventListener('click', e => {
            if (e.target.matches('.pagination-btn.page-number')) {
                this.currentPage = parseInt(e.target.dataset.page);
                this.updateItemCards();
                this.updatePagination();
                window.scrollTo(0, 0);
            }

            if (e.target.matches('.prev-btn') || e.target.closest('.prev-btn')) {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.updateItemCards();
                    this.updatePagination();
                    window.scrollTo(0, 0);
                }
            }

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

        document.addEventListener('click', (e) => {
            const undoBtn = e.target.closest('.undo-btn');
            if (undoBtn) {
                const itemId = parseInt(undoBtn.dataset.id);
                this.undoRemove(itemId);
            }
        });
    }

    async removeItem(itemId) {
        try {
            const response = await fetch('../backend/api/saved/add_to_saved.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product_id: itemId,
                    action: 'remove'
                })
            });

            if (!response.ok) throw new Error('Failed to remove item');

            const data = await response.json();
            if (!data.success) throw new Error(data.message);

            const itemIndex = this.savedItems.findIndex(item => item.id === itemId);
            if (itemIndex === -1) return;

            this.deletedItems[itemId] = {
                item: this.savedItems[itemIndex],
                index: itemIndex,
                timestamp: new Date().getTime()
            };

            this.savedItems.splice(itemIndex, 1);

            this.updateItemCards();
            this.updatePagination();

            const itemCountElement = document.querySelector('.saved-header p');
            if (itemCountElement) {
                itemCountElement.textContent = `${this.savedItems.length} items saved`;
            }

            this.showNotification(itemId);

            document.dispatchEvent(new CustomEvent('updateSavedBadge'));

            if (this.savedItems.length === 0) {
                this.render();
            }
        } catch (error) {
            console.error('Error removing item:', error);
        }
    }

    async undoRemove(itemId) {
        try {
            if (!this.deletedItems[itemId]) return;

            if (this.deleteTimers[itemId]) {
                clearTimeout(this.deleteTimers[itemId]);
                delete this.deleteTimers[itemId];
            }

            if (this.progressIntervals[itemId]) {
                clearInterval(this.progressIntervals[itemId]);
                delete this.progressIntervals[itemId];
            }

            const { item, index } = this.deletedItems[itemId];

            const response = await fetch('../backend/api/saved/add_to_saved.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product_id: item.id,
                    action: 'add'
                })
            });

            if (!response.ok) throw new Error('Failed to restore item');

            const data = await response.json();
            if (!data.success) throw new Error(data.message);

            await this.loadSavedItems();

            delete this.deletedItems[itemId];
            this.removeNotification(itemId);

            this.updateItemCards();
            this.updatePagination();

            const itemCountElement = document.querySelector('.saved-header p');
            if (itemCountElement) {
                itemCountElement.textContent = `${this.savedItems.length} items saved`;
            }

            document.dispatchEvent(new CustomEvent('updateSavedBadge'));

        } catch (error) {
            console.error('Error restoring item:', error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-toast';
            errorDiv.textContent = 'Failed to restore item';
            document.body.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 3000);
        }
    }

    permanentlyDeleteItem(itemId) {
        if (this.progressIntervals[itemId]) {
            clearInterval(this.progressIntervals[itemId]);
            delete this.progressIntervals[itemId];
        }

        delete this.deletedItems[itemId];
        delete this.deleteTimers[itemId];

        this.removeNotification(itemId);
    }

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

        const timeDisplay = notification.querySelector('.notification-time');
        const progressBar = notification.querySelector('.notification-progress');

        if (progressBar) {
            progressBar.style.transition = 'width 5s linear';
            void progressBar.offsetWidth;
            progressBar.style.width = '100%';
            setTimeout(() => {
                progressBar.style.width = '0%';
            }, 50);
        }

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