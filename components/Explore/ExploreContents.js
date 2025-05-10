export default class ExploreContents {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.currentPage = 1;
        this.itemsPerPage = 35;
        this.sortOption = 'newest';
        this.products = [];
        this.filteredProducts = [];
        this.activeFilters = null;
        this.user = JSON.parse(sessionStorage.getItem('user') || '{}');
        this.init();
    }

    async init() {
        await this.fetchProducts();
        await this.initializeSavedStates();
        this.render();
        this.setupEventListeners();
    }

    formatProductData(listing) {
        let imagesArray = [];
        if (Array.isArray(listing.images)) {
            imagesArray = listing.images;
        } else if (typeof listing.images === 'string') {
            try {
                const parsed = JSON.parse(listing.images);
                if (Array.isArray(parsed)) {
                    imagesArray = parsed;
                }
            } catch (e) {
                // Silently ignore parsing errors for images
            }
        }

        const mainImage = imagesArray.length > 0 ? imagesArray[0] : '';
        const imagePath = mainImage
            ? (mainImage.includes('uploads/') ? `../${mainImage}` : `../backend/uploads/products/${mainImage}`)
            : '../assets/images/general-image/DefaultProduct.png';
        
        const stockQuantityRaw = listing.stock_quantity;
        const parsedStock = parseInt(stockQuantityRaw, 10);

        return {
            id: listing.id,
            title: listing.name || listing.title || 'Unnamed Product',
            description: listing.description || '',
            price: parseFloat(listing.price) || 0,
            originalPrice: listing.original_price ? parseFloat(listing.original_price) : null,
            category: listing.category_name || listing.category || 'Uncategorized',
            category_id: listing.category_id,
            brand: listing.brand || 'Unknown Brand',
            image: imagePath,
            images: imagesArray.map(img =>
                `${img.includes('uploads/') ? `../${img}` : `../backend/uploads/products/${img}`}`
            ),
            condition: listing.condition || 'Not specified',
            seller: listing.seller_username || listing.seller_name || 'Unknown Seller',
            seller_id: listing.user_id || listing.seller_id,
            dateAdded: new Date(listing.created_at),
            rating: parseFloat(listing.rating_avg || listing.rating) || 0,
            ratingCount: parseInt(listing.review_count || listing.rating_count) || 0,
            stock_quantity: Number.isFinite(parsedStock) ? parsedStock : 0,
            isSaved: listing.isSaved !== undefined ? listing.isSaved : false
        };
    }

    async fetchProducts() {
        try {
            const response = await fetch('../backend/api/get_all_products.php');
            if (!response.ok) {
                throw new Error(`Failed to fetch products: ${response.statusText} (Status: ${response.status})`);
            }
            const data = await response.json();
            if (data.success && data.data && Array.isArray(data.data.listings)) {
                const currentUserId = this.user ? String(this.user.id) : null;
                this.products = data.data.listings
                    .filter(listing => String(listing.user_id) !== currentUserId)
                    .map(listing => this.formatProductData(listing));
                this.filteredProducts = [...this.products];
            } else {
                throw new Error(data.message || 'Failed to load products or unexpected data structure');
            }
        } catch (error) {
            this.products = [];
            this.filteredProducts = [];
            this.showToast(`Error fetching products: ${error.message}`, 'error');
        }
    }

    async initializeSavedStates() {
        if (!this.user || !this.user.id) return;
        try {
            const response = await fetch('../backend/api/saved/get_saved_items.php');
            if (!response.ok) throw new Error(`Failed to fetch saved states: ${response.statusText} (Status: ${response.status})`);

            const data = await response.json();
            if (data.success && Array.isArray(data.data)) {
                const savedProductIds = new Set(data.data.map(item => String(item.product_id)));
                this.products.forEach(product => {
                    product.isSaved = savedProductIds.has(String(product.id));
                });
                this.filteredProducts.forEach(product => {
                    product.isSaved = savedProductIds.has(String(product.id));
                });
                document.querySelectorAll('.product-card').forEach(card => {
                    const productId = card.dataset.id;
                    const saveBtn = card.querySelector('.save-btn');
                    if (saveBtn && productId) {
                        const isSaved = savedProductIds.has(String(productId));
                        saveBtn.classList.toggle('saved', isSaved);
                        saveBtn.innerHTML = `<i class='bx ${isSaved ? 'bxs-heart' : 'bx-heart'}'></i>`;
                    }
                });
            }
        } catch (error) {
            // console.error('Error initializing saved states:', error);
        }
    }

    sortProducts(option) {
        this.sortOption = option;
        const productsToSort = [...this.filteredProducts];
        switch (option) {
            case 'newest':
                productsToSort.sort((a, b) => b.dateAdded - a.dateAdded);
                break;
            case 'price-low-high':
                productsToSort.sort((a, b) => a.price - b.price);
                break;
            case 'price-high-low':
                productsToSort.sort((a, b) => b.price - a.price);
                break;
            case 'highest-rated':
                productsToSort.sort((a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount);
                break;
            case 'name_asc':
                productsToSort.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'name_desc':
                productsToSort.sort((a, b) => b.title.localeCompare(a.title));
                break;
        }
        this.filteredProducts = productsToSort;
        this.currentPage = 1;
        this.updateProductCards();
        this.updatePagination();
    }

    searchProducts(query = '') {
        const searchTerm = query.toLowerCase().trim();
        if (!searchTerm) {
            this.filteredProducts = this.activeFilters ? this.applyFiltersToData(this.products, this.activeFilters) : [...this.products];
        } else {
            const baseProducts = this.activeFilters ? this.applyFiltersToData(this.products, this.activeFilters) : [...this.products];
            this.filteredProducts = baseProducts.filter(product =>
                (product.title && product.title.toLowerCase().includes(searchTerm)) ||
                (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                (product.brand && product.brand.toLowerCase().includes(searchTerm)) ||
                (product.category && product.category.toLowerCase().includes(searchTerm))
            );
        }
        this.currentPage = 1;
        this.updateProductCards();
        this.updatePagination();
    }

    applyFiltersToData(products, filters) {
        let filtered = [...products];
        const currentUserId = this.user ? String(this.user.id) : null;

        if (currentUserId) {
            filtered = filtered.filter(product => String(product.seller_id) !== currentUserId);
        }
        if (filters.categories && filters.categories.length > 0) {
            filtered = filtered.filter(product => filters.categories.includes(product.category_id ? String(product.category_id) : product.category));
        }
        if (filters.brands && filters.brands.length > 0) {
            filtered = filtered.filter(product => filters.brands.includes(product.brand));
        }
        if (filters.price) {
            filtered = filtered.filter(product => {
                const price = product.price;
                const minOk = !filters.price.min || price >= parseFloat(filters.price.min);
                const maxOk = !filters.price.max || filters.price.max === 'unlimited' || price <= parseFloat(filters.price.max);
                return minOk && maxOk;
            });
        }
        if (filters.rating && parseInt(filters.rating) > 0) {
            const minRating = parseInt(filters.rating);
            filtered = filtered.filter(product => product.rating >= minRating);
        }
        if (filters.showOutOfStock === false) {
            filtered = filtered.filter(product => product.stock_quantity > 0);
        }
        return filtered;
    }

    async applyFilters(filters) {
        this.activeFilters = filters;
        try {
            const response = await fetch('../backend/api/explore/filter_products.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filters)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
                throw new Error(errorData.message || `Failed to fetch filtered products: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.success && data.data && Array.isArray(data.data.products)) {
                this.filteredProducts = data.data.products.map(listingFromServer => {
                    const formattedProduct = this.formatProductData(listingFromServer);
                    formattedProduct.isSaved = listingFromServer.isSaved !== undefined ? listingFromServer.isSaved : false;
                    return formattedProduct;
                });
            } else {
                this.filteredProducts = [];
            }
        } catch (error) {
            this.showToast(`Error applying filters: ${error.message}`, 'error');
            this.filteredProducts = [];
        }
        this.currentPage = 1;
        this.sortProducts(this.sortOption);
    }

    async resetFilters() {
        this.activeFilters = null;
        const currentUserId = this.user ? String(this.user.id) : null;
        this.filteredProducts = currentUserId
            ? this.products.filter(product => String(product.seller_id) !== currentUserId)
            : [...this.products];
        this.currentPage = 1;
        this.sortProducts(this.sortOption);
    }

    render() {
        const mainContentHTML = `
            <div class="main-content-container">
                <div class="search-filter-container">
                    <div class="search-container">
                        <i class='bx bx-search'></i>
                        <input type="text" id="main-search" placeholder="Search products...">
                        <button id="search-button" class="search-button">
                            <i class='bx bx-search-alt'></i>
                            Search
                        </button>
                    </div>
                    <div class="filter-controls">
                        <button id="filter-dropdown-btn">
                            <i class='bx bx-sort-alt-2'></i>
                            <span>Sort</span>
                        </button>
                        <div class="filter-dropdown">
                            <div class="filter-option ${this.sortOption === 'newest' ? 'selected' : ''}" data-sort="newest">
                                <i class='bx bx-time'></i>
                                <span>Newest</span>
                            </div>
                            <div class="filter-option ${this.sortOption === 'price-low-high' ? 'selected' : ''}" data-sort="price-low-high">
                                <i class='bx bx-sort-up'></i>
                                <span>Price: Low to High</span>
                            </div>
                            <div class="filter-option ${this.sortOption === 'price-high-low' ? 'selected' : ''}" data-sort="price-high-low">
                                <i class='bx bx-sort-down'></i>
                                <span>Price: High to Low</span>
                            </div>
                            <div class="filter-option ${this.sortOption === 'highest-rated' ? 'selected' : ''}" data-sort="highest-rated">
                                <i class='bx bx-star'></i>
                                <span>Highest Rated</span>
                            </div>
                            <div class="filter-option ${this.sortOption === 'name_asc' ? 'selected' : ''}" data-sort="name_asc">
                                <i class='bx bx-sort-a-z'></i>
                                <span>Name: A-Z</span>
                            </div>
                            <div class="filter-option ${this.sortOption === 'name_desc' ? 'selected' : ''}" data-sort="name_desc">
                                <i class='bx bx-sort-z-a'></i>
                                <span>Name: Z-A</span>
                            </div>
                            <button id="apply-filter-btn">Apply</button>
                        </div>
                    </div>
                </div>
                <div class="products-grid">
                </div>
                <div class="pagination-container">
                </div>
            </div>
        `;
        const mainContentContainer = document.createElement('div');
        mainContentContainer.className = 'explore-content';
        mainContentContainer.innerHTML = mainContentHTML;
        const existingMainContent = this.container.querySelector('.explore-content');
        if (existingMainContent) {
            existingMainContent.replaceWith(mainContentContainer);
        } else {
            this.container.appendChild(mainContentContainer);
        }
        this.updateProductCards();
        this.updatePagination();
    }

    updateProductCards() {
        const productsGrid = document.querySelector('.products-grid');
        if (!productsGrid) return;
        productsGrid.innerHTML = '';
        if (this.filteredProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-products">
                    <div class="no-products-icon">
                        <i class='bx bx-search-alt'></i>
                    </div>
                    <h3>No Products Found</h3>
                    <p>We couldn't find any products matching your criteria. Try adjusting your search or filters.</p>
                    <button class="reset-search-btn">
                        <i class='bx bx-reset'></i>
                        Clear Search & Filters
                    </button>
                </div>
            `;
            const resetBtn = productsGrid.querySelector('.reset-search-btn');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    const mainSearchInput = document.getElementById('main-search');
                    if (mainSearchInput) mainSearchInput.value = '';
                    this.resetFilters();
                    document.dispatchEvent(new CustomEvent('resetAllFiltersInSidebar'));
                });
            }
            return;
        }
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
        paginatedProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.dataset.id = product.id;
            const fullStars = Math.floor(product.rating);
            const hasHalfStar = product.rating % 1 >= 0.5;
            let starsHTML = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= fullStars) starsHTML += `<i class='bx bxs-star'></i>`;
                else if (i === fullStars + 1 && hasHalfStar) starsHTML += `<i class='bx bxs-star-half'></i>`;
                else starsHTML += `<i class='bx bx-star'></i>`;
            }
            const truncatedDescription = product.description && product.description.length > 52
                ? product.description.substring(0, 52) + '...'
                : product.description || '';

            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.title}">
                    <button class="save-btn ${product.isSaved ? 'saved' : ''}" aria-label="Save item">
                        <i class='bx ${product.isSaved ? 'bxs-heart' : 'bx-heart'}'></i>
                    </button>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.title}</h3>
                    <p class="product-description">${truncatedDescription}</p>
                    <div class="product-meta">
                        <div class="price-container">
                            ${product.originalPrice ? `<span class="old-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
                            <span class="product-price">$${product.price.toFixed(2)}</span>
                        </div>
                        <div class="product-rating">
                            <div class="stars">${starsHTML}</div>
                            <span class="rating-count">(${product.ratingCount})</span>
                        </div>
                    </div>
                    <button class="add-to-cart-btn"> 
                        <i class='bx bx-cart-add'></i>
                        Add to Cart
                    </button>
                </div>
            `;
            productsGrid.appendChild(productCard);
        });
    }

    updatePagination() {
        const paginationContainer = document.querySelector('.pagination-container');
        if (!paginationContainer) return;
        const totalItems = this.filteredProducts.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        paginationContainer.innerHTML = '';
        if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        }
        paginationContainer.style.display = 'flex';
        let paginationHTML = '';
        paginationHTML += `<button class="pagination-btn prev-btn" ${this.currentPage === 1 ? 'disabled' : ''}><i class='bx bx-chevron-left'></i></button>`;
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                paginationHTML += `<button class="pagination-btn page-number ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            }
        } else {
            paginationHTML += `<button class="pagination-btn page-number ${this.currentPage === 1 ? 'active' : ''}" data-page="1">1</button>`;
            if (this.currentPage > 3) paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            const startPage = Math.max(2, this.currentPage - 1);
            const endPage = Math.min(totalPages - 1, this.currentPage + 1);
            for (let i = startPage; i <= endPage; i++) {
                paginationHTML += `<button class="pagination-btn page-number ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            }
            if (this.currentPage < totalPages - 2) paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            paginationHTML += `<button class="pagination-btn page-number ${this.currentPage === totalPages ? 'active' : ''}" data-page="${totalPages}">${totalPages}</button>`;
        }
        paginationHTML += `<button class="pagination-btn next-btn" ${this.currentPage === totalPages ? 'disabled' : ''}><i class='bx bx-chevron-right'></i></button>`;
        paginationContainer.innerHTML = paginationHTML;
    }

    setupEventListeners() {
        const searchInput = document.getElementById('main-search');
        const searchButton = document.getElementById('search-button');
        const filterBtn = document.getElementById('filter-dropdown-btn');
        const filterDropdown = document.querySelector('.filter-dropdown');
        const mainContentContainer = this.container.querySelector('.explore-content .main-content-container');

        if (sessionStorage.getItem('focusSearch') === 'true') {
            searchInput?.focus();
            sessionStorage.removeItem('focusSearch');
        }
        let searchTimeout;
        searchInput?.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => this.searchProducts(searchInput.value), 300);
        });
        searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                clearTimeout(searchTimeout);
                this.searchProducts(searchInput.value);
            }
        });
        searchButton?.addEventListener('click', () => {
            clearTimeout(searchTimeout);
            this.searchProducts(searchInput.value);
        });
        filterBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            filterDropdown?.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (filterDropdown?.classList.contains('active') && !filterBtn?.contains(e.target) && !filterDropdown.contains(e.target)) {
                filterDropdown.classList.remove('active');
            }
        });
        filterDropdown?.addEventListener('click', (e) => {
            const filterOption = e.target.closest('.filter-option');
            const applyButton = e.target.closest('#apply-filter-btn');
            if (filterOption) {
                filterDropdown.querySelectorAll('.filter-option').forEach(opt => opt.classList.remove('selected'));
                filterOption.classList.add('selected');
                this.tempSortOption = filterOption.dataset.sort;
            }
            if (applyButton) {
                if (this.tempSortOption) this.sortProducts(this.tempSortOption);
                filterDropdown.classList.remove('active');
            }
        });

        if (mainContentContainer) {
            mainContentContainer.addEventListener('click', (e) => {
                const productCard = e.target.closest('.product-card');
                if (productCard) {
                    const productId = productCard.dataset.id;
                    const product = this.filteredProducts.find(p => String(p.id) === String(productId)) || this.products.find(p => String(p.id) === String(productId));
                    if (e.target.closest('.save-btn')) {
                        e.preventDefault();
                        if (product) this.updateSavedItems(product);
                    } else if (e.target.closest('.add-to-cart-btn')) {
                        e.preventDefault();
                        const btn = e.target.closest('.add-to-cart-btn');
                        if (product && !btn.disabled) this.addToCart(product, btn);
                    } else {
                        if (productId) {
                            window.location.href = `../HTML-Pages/ItemDetailsPage.html?id=${productId}`;
                        }
                    }
                    return;
                }
                const pageButton = e.target.closest('.pagination-btn.page-number');
                const prevButton = e.target.closest('.prev-btn');
                const nextButton = e.target.closest('.next-btn');
                if (pageButton) this.currentPage = parseInt(pageButton.dataset.page);
                else if (prevButton && this.currentPage > 1) this.currentPage--;
                else if (nextButton) {
                    const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
                    if (this.currentPage < totalPages) this.currentPage++;
                } else return;
                this.updateProductCards();
                this.updatePagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        document.addEventListener('filtersAppliedFromSidebar', (event) => {
            if (event.detail && event.detail.filters) {
                this.applyFilters(event.detail.filters);
            }
        });
        document.addEventListener('resetAllFiltersInSidebar', () => {
            this.resetFilters();
            const mainSearchInput = document.getElementById('main-search');
            if (mainSearchInput) mainSearchInput.value = '';
        });
    }

    async updateSavedItems(product) {
        if (!this.user || !this.user.id) {
            this.showToast("Please log in to save items.", "info");
            return;
        }
        const currentSavedState = product.isSaved;
        const action = currentSavedState ? 'remove' : 'add';
        product.isSaved = !currentSavedState;
        const saveBtn = document.querySelector(`.product-card[data-id="${product.id}"] .save-btn`);
        if (saveBtn) {
            saveBtn.classList.toggle('saved', product.isSaved);
            saveBtn.innerHTML = `<i class='bx ${product.isSaved ? 'bxs-heart' : 'bx-heart'}'></i>`;
        }
        document.dispatchEvent(new CustomEvent('updateSavedBadge'));
        try {
            const response = await fetch('../backend/api/saved/add_to_saved.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: product.id, action: action })
            });
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Failed to update saved state on server');
            }
            if (window.location.pathname.includes('SavedPage.html') && typeof window.savedItemsInstance?.loadSavedItems === 'function') {
                window.savedItemsInstance.loadSavedItems();
            }
        } catch (error) {
            product.isSaved = currentSavedState;
            if (saveBtn) {
                saveBtn.classList.toggle('saved', product.isSaved);
                saveBtn.innerHTML = `<i class='bx ${product.isSaved ? 'bxs-heart' : 'bx-heart'}'></i>`;
            }
            document.dispatchEvent(new CustomEvent('updateSavedBadge'));
            this.showToast(error.message || 'Failed to update saved item', 'error');
        }
    }

    async addToCart(product, buttonElement) {
        if (!this.user || !this.user.id) {
            this.showToast("Please log in to add items to your cart.", "info");
            return;
        }

        const originalButtonHTML = buttonElement.innerHTML;
        buttonElement.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> Adding...`;
        buttonElement.disabled = true;

        try {
            const response = await fetch('../backend/api/cart/add_to_cart.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product_id: product.id,
                    quantity: 1 
                })
            });

            const responseText = await response.text(); 
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (jsonError) {
                console.error("Failed to parse JSON response from server:", responseText);
                throw new Error("Server returned an invalid response. Please check the browser console for details.");
            }
            
            console.log("Add to cart API response data:", data); 

            if (data.success) {
                this.showToast(data.message || `${product.title} added to cart!`, 'success');
                document.dispatchEvent(new CustomEvent('updateCartBadge')); 
                console.log(`Added ${product.title} to cart`); 

                buttonElement.innerHTML = `<i class='bx bx-check'></i> Added`;
                setTimeout(() => {
                    buttonElement.innerHTML = originalButtonHTML;
                    buttonElement.disabled = false;
                }, 2000);
            } else {
                throw new Error(data.message || 'Failed to add item to cart (server indicated failure)');
            }
        } catch (error) {
            console.error('Error in addToCart process:', error);
            this.showToast(error.message || 'Failed to add item to cart. Check console for errors.', 'error');

            buttonElement.innerHTML = originalButtonHTML;
            buttonElement.disabled = false;
        }
    }

    showToast(message, type = 'info') {
        const toastId = 'toast-' + Date.now();
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        const toastContainer = document.getElementById('toast-container') || this.createToastContainer();
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
                if (toastContainer.childNodes && toastContainer.childNodes.length === 0) {
                    toastContainer.remove();
                }
            }, 500);
        }, 3000);
    }

    createToastContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }
}

document.addEventListener('cartUpdated', () => {
    document.dispatchEvent(new CustomEvent('updateCartBadge'));
});