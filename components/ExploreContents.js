export default class ExploreContents {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.currentPage = 1;
        this.itemsPerPage = 35;
        this.sortOption = 'newest';
        this.products = [];
        this.filteredProducts = [];
        this.activeFilters = null;
        this.init();
    }

    async init() {
        await this.fetchProducts();
        this.initializeSavedStates();
        this.render();
        this.setupEventListeners();
    }

    async fetchProducts() {
        try {
            const response = await fetch('../backend/api/get_all_products.php');
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();

            if (data.success) {
                this.products = data.data.listings.map(listing => ({
                    id: listing.id,
                    name: listing.title,
                    description: listing.description,
                    price: parseFloat(listing.price),
                    originalPrice: listing.original_price ? parseFloat(listing.original_price) : null,
                    category: listing.category,
                    brand: listing.brand,
                    image: listing.images[0] ? `${listing.images[0].includes('uploads/') ? '../' + listing.images[0] : '../backend/uploads/products/' + listing.images[0]}` : '/Project-Web/assets/images/products-images/placeholder.svg',
                    images: listing.images.map(img =>
                        `${img.includes('uploads/') ? '../' + img : '../backend/uploads/products/' + img}`
                    ),
                    condition: listing.condition,
                    seller: listing.seller_name,
                    dateAdded: new Date(listing.created_at),
                    rating: parseFloat(listing.rating) || 0,
                    ratingCount: parseInt(listing.rating_count) || 0,
                    isSaved: false
                }));

                // Add debug logging
                console.log('Sample image path:', this.products[0]?.image);

                this.filteredProducts = [...this.products];
                this.sortProducts('newest');
            } else {
                throw new Error(data.message || 'Failed to load products');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            // Show error message to user
            const productsGrid = document.querySelector('.products-grid');
            if (productsGrid) {
                productsGrid.innerHTML = `
                    <div class="error-message">
                        <i class='bx bx-error-circle'></i>
                        <p>Failed to load products. Please try again later.</p>
                    </div>
                `;
            }
        }
    }

    async initializeSavedStates() {
        try {
            const response = await fetch('../backend/api/saved/get_saved_items.php');
            if (!response.ok) throw new Error('Failed to fetch saved states');

            const data = await response.json();
            if (data.success) {
                const savedIds = data.data.map(item => item.product_id); // Changed from id to product_id
                
                // Update isSaved flag for products
                this.products.forEach(product => {
                    product.isSaved = savedIds.includes(product.id);
                });

                // Also update filtered products if they exist
                if (this.filteredProducts.length > 0) {
                    this.filteredProducts.forEach(product => {
                        product.isSaved = savedIds.includes(product.id);
                    });
                }

                // Update UI for all saved buttons
                document.querySelectorAll('.product-card').forEach(card => {
                    const productId = parseInt(card.dataset.id);
                    const saveBtn = card.querySelector('.save-btn');
                    if (saveBtn) {
                        const isSaved = savedIds.includes(productId);
                        saveBtn.classList.toggle('saved', isSaved);
                        saveBtn.innerHTML = `<i class='bx ${isSaved ? 'bxs-heart' : 'bx-heart'}'></i>`;
                    }
                });
            }
        } catch (error) {
            console.error('Error initializing saved states:', error);
        }
    }

    sortProducts(option) {
        this.sortOption = option;

        // Sort the current filtered products instead of replacing them with all products
        switch (option) {
            case 'newest':
                this.filteredProducts.sort((a, b) => b.dateAdded - a.dateAdded);
                break;
            case 'price-low-high':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high-low':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'highest-rated':
                this.filteredProducts.sort((a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount);
                break;
        }

        this.currentPage = 1; // Reset to first page on sort
        this.updateProductCards();
        this.updatePagination();
    }

    searchProducts(query) {
        if (!query || query.trim() === '') {
            // If search is empty, apply only active filters if they exist
            if (this.activeFilters) {
                this.applyFilters(this.activeFilters);
                return;
            }
            // Otherwise show all products
            this.filteredProducts = [...this.products];
        } else {
            const searchTerm = query.toLowerCase().trim();
            // Search within all products or within filtered products if filters are active
            const productsToSearch = this.activeFilters ? this.filteredProducts : this.products;
            this.filteredProducts = productsToSearch.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.brand.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm)
            );

            console.log(`Found ${this.filteredProducts.length} products matching "${searchTerm}"`);
        }

        // Reset to first page and update the display
        this.currentPage = 1;
        this.updateProductCards();
        this.updatePagination();
    }

    // New method to apply filters
    applyFilters(filters) {
        // Store active filters for use with search
        this.activeFilters = filters;

        // Start with all products
        let filtered = [...this.products];

        // Filter by categories if any are selected
        if (filters.categories && filters.categories.length > 0) {
            filtered = filtered.filter(product =>
                filters.categories.includes(product.category)
            );
        }

        // Filter by brands if any are selected
        if (filters.brands && filters.brands.length > 0) {
            filtered = filtered.filter(product =>
                filters.brands.includes(product.brand)
            );
        }

        // Filter by price range
        if (filters.price) {
            filtered = filtered.filter(product => {
                const price = product.price;
                return price >= filters.price.min &&
                    (filters.price.max === 'unlimited' || price <= filters.price.max);
            });
        }

        // Filter by rating
        if (filters.rating && parseInt(filters.rating) > 0) {
            const minRating = parseInt(filters.rating);
            filtered = filtered.filter(product => product.rating >= minRating);
        }

        console.log(`Filtered to ${filtered.length} products`);

        // Update filtered products
        this.filteredProducts = filtered;

        // Apply current sort option
        this.sortProducts(this.sortOption);
    }

    // Method to reset filters
    resetFilters() {
        this.activeFilters = null;
        this.filteredProducts = [...this.products];

        // Apply current sort option
        this.sortProducts(this.sortOption);
    }

    // Rest of the class remains the same...
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
                            <button id="apply-filter-btn">Apply</button>
                        </div>
                    </div>
                </div>
                
                <div class="products-grid">
                    <!-- Product cards will be inserted here -->
                </div>
                
                <div class="pagination-container">
                    <div class="pagination">
                        <!-- Pagination will be inserted here -->
                    </div>
                </div>
            </div>
        `;

        const mainContentContainer = document.createElement('div');
        mainContentContainer.className = 'explore-content';
        mainContentContainer.innerHTML = mainContentHTML;

        const existingMainContent = document.querySelector('.explore-content');
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

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);

        productsGrid.innerHTML = '';

        if (this.filteredProducts.length === 0) {
            // No products found message with fancy styling
            productsGrid.innerHTML = `
                <div class="no-products">
                    <div class="no-products-icon">
                        <i class='bx bx-search-alt'></i>
                    </div>
                    <h3>Product Not Found</h3>
                    <p>We couldn't find any products matching your criteria.</p>
                    <button class="reset-search-btn">
                        <i class='bx bx-reset'></i>
                        Clear All Filters
                    </button>
                </div>
            `;

            // Add event listener to the reset search button
            const resetSearchBtn = productsGrid.querySelector('.reset-search-btn');
            if (resetSearchBtn) {
                resetSearchBtn.addEventListener('click', () => {
                    const searchInput = document.getElementById('main-search');
                    if (searchInput) {
                        searchInput.value = '';
                    }
                    this.resetFilters();
                    // Also trigger the filter reset event for the sidebar
                    document.dispatchEvent(new CustomEvent('resetAllFilters'));
                });
            }
            return;
        }

        paginatedProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.dataset.id = product.id; // Change from productId to id

            // Generate stars based on rating
            const fullStars = Math.floor(product.rating);
            const hasHalfStar = product.rating % 1 >= 0.5;

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
            const truncatedDescription = product.description.length > 52
                ? product.description.substring(0, 52) + '...'
                : product.description;

            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                    <button class="save-btn ${product.isSaved ? 'saved' : ''}">
                        <i class='bx ${product.isSaved ? 'bxs-heart' : 'bx-heart'}'></i>
                    </button>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${truncatedDescription}</p>
                    <div class="product-meta">
                        <div class="price-container">
                            ${product.originalPrice ?
                    `<span class="old-price">$${product.originalPrice.toFixed(2)}</span>` : ''
                }
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
        const totalItems = this.filteredProducts.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);

        // Clear existing pagination
        const paginationContainer = document.querySelector('.pagination-container');
        if (!paginationContainer) return;

        // Hide pagination if no products found
        if (totalItems === 0) {
            paginationContainer.style.display = 'none';
            return;
        } else {
            paginationContainer.style.display = 'flex';
        }

        // Rest of your pagination code...
        const pagination = document.createElement('div');
        pagination.className = 'pagination';
        // ...existing pagination generation code

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
        // Search functionality
        const searchInput = document.getElementById('main-search');
        const searchButton = document.getElementById('search-button');

        if (searchInput) {
            // Add debouncing to improve performance
            let searchTimeout;

            // Search when typing (with debounce)
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchProducts(searchInput.value);
                }, 500); // Wait 500ms after user stops typing
            });

            // Search when user presses Enter
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    clearTimeout(searchTimeout);
                    this.searchProducts(searchInput.value);
                }
            });

            // Add search button click event
            if (searchButton) {
                searchButton.addEventListener('click', () => {
                    clearTimeout(searchTimeout);
                    this.searchProducts(searchInput.value);
                });
            }
        }

        // Filter dropdown toggle
        const filterBtn = document.getElementById('filter-dropdown-btn');
        const filterDropdown = document.querySelector('.filter-dropdown');
        if (filterBtn && filterDropdown) {
            filterBtn.addEventListener('click', () => {
                filterDropdown.classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!filterBtn.contains(e.target) && !filterDropdown.contains(e.target)) {
                    filterDropdown.classList.remove('active');
                }
            });
        }

        // Filter options
        const filterOptions = document.querySelectorAll('.filter-option');
        const applyFilterBtn = document.getElementById('apply-filter-btn');

        if (filterOptions && applyFilterBtn) {
            let selectedOption = this.sortOption;

            // Set initial selected option
            filterOptions.forEach(option => {
                if (option.dataset.sort === this.sortOption) {
                    option.classList.add('selected');
                }

                option.addEventListener('click', () => {
                    filterOptions.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                    selectedOption = option.dataset.sort;
                });
            });

            applyFilterBtn.addEventListener('click', () => {
                this.sortProducts(selectedOption);
                filterDropdown.classList.remove('active');
            });
        }

        // Listen to filter application from sidebar
        document.addEventListener('filtersApplied', (event) => {
            const { filters, products } = event.detail;
            // Update products directly from the filtered results
            this.products = products;
            this.filteredProducts = products;
            this.currentPage = 1;
            this.updateProductCards();
            this.updatePagination();
        });

        // Listen to filter reset from sidebar
        document.addEventListener('filtersReset', () => {
            this.resetFilters();
        });

        // Pagination
        document.addEventListener('click', e => {
            // Page number buttons
            if (e.target.matches('.pagination-btn.page-number')) {
                this.currentPage = parseInt(e.target.dataset.page);
                this.updateProductCards();
                this.updatePagination();
                window.scrollTo(0, 0);
            }

            // Prev button
            if (e.target.matches('.prev-btn') || e.target.closest('.prev-btn')) {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.updateProductCards();
                    this.updatePagination();
                    window.scrollTo(0, 0);
                }
            }

            // Next button
            if (e.target.matches('.next-btn') || e.target.closest('.next-btn')) {
                const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.updateProductCards();
                    this.updatePagination();
                    window.scrollTo(0, 0);
                }
            }
        });

        // Save product (heart icon)
        document.addEventListener('click', e => {
            const saveBtn = e.target.closest('.save-btn');
            if (saveBtn) {
                e.preventDefault();
                e.stopPropagation();

                const productCard = saveBtn.closest('.product-card');
                if (!productCard) return;

                const productId = parseInt(productCard.dataset.id);
                const product = this.products.find(p => p.id === productId);

                if (product) {
                    // Don't update UI immediately, let updateSavedItems handle it
                    this.updateSavedItems(product);
                }
            }
        });

        // Add to cart
        document.addEventListener('click', e => {
            if (e.target.matches('.add-to-cart-btn') || e.target.closest('.add-to-cart-btn')) {
                const btn = e.target.matches('.add-to-cart-btn') ? e.target : e.target.closest('.add-to-cart-btn');
                const productCard = btn.closest('.product-card');
                const productId = parseInt(productCard.dataset.id);

                // Find the product
                const product = this.products.find(p => p.id === productId);
                if (product) {
                    this.addToCart(product);
                }
            }
        });

        // Add to cart button click handler
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            const addToCartBtn = card.querySelector('.add-to-cart-btn');
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const productId = card.dataset.productId;
                    const product = this.products.find(p => p.id === parseInt(productId));
                    if (product) {
                        await this.addToCart(product);
                    }
                });
            }
        });
    }

    // Add a new method to handle saving items to localStorage
    async updateSavedItems(product) {
        try {
            // Get current state before making the change
            const currentSavedState = product.isSaved;
            const action = currentSavedState ? 'remove' : 'add';

            const response = await fetch('../backend/api/saved/add_to_saved.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product_id: product.id,
                    action: action
                })
            });

            const data = await response.json();
            
            if (data.success) {
                // Only update the state and UI after successful API call
                product.isSaved = !currentSavedState;
                
                // Update UI for this specific product card
                const saveBtn = document.querySelector(`.product-card[data-id="${product.id}"] .save-btn`);
                if (saveBtn) {
                    if (!currentSavedState) {
                        // Adding to saved
                        saveBtn.classList.add('saved');
                        saveBtn.innerHTML = '<i class="bx bxs-heart"></i>';
                    } else {
                        // Removing from saved
                        saveBtn.classList.remove('saved');
                        saveBtn.innerHTML = '<i class="bx bx-heart"></i>';
                    }
                }
                
                // Trigger badge update
                document.dispatchEvent(new CustomEvent('updateSavedBadge'));
                
                // Refresh saved items list if we're on the saved page
                const savedItemsInstance = window.savedItemsInstance;
                if (savedItemsInstance) {
                    savedItemsInstance.loadSavedItems();
                }
            } else {
                throw new Error(data.message || 'Failed to update saved state');
            }
        } catch (error) {
            console.error('Error updating saved items:', error);
            // Revert visual state on error
            product.isSaved = !product.isSaved;
            const saveBtn = document.querySelector(`.product-card[data-id="${product.id}"] .save-btn`);
            if (saveBtn) {
                saveBtn.classList.toggle('saved');
                saveBtn.innerHTML = `<i class='bx ${product.isSaved ? 'bxs-heart' : 'bx-heart'}'></i>`;
            }
            // Show error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-toast';
            errorDiv.textContent = error.message || 'Failed to update saved item';
            document.body.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 3000);
        }
    }

    // Add this method to the ExploreContents class
    async addToCart(product) {
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

            const data = await response.json();

            if (data.success) {
                // Show visual confirmation
                this.showAddedToCartConfirmation(product.id);
                
                // Update cart badge
                document.dispatchEvent(new CustomEvent('updateCartBadge'));
                
                console.log(`Added ${product.name} to cart`);
            } else {
                throw new Error(data.message || 'Failed to add item to cart');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            // Show error message to user
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-toast';
            errorDiv.textContent = error.message || 'Failed to add item to cart';
            document.body.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 3000);
        }
    }

    // Visual confirmation when product is added to cart
    showAddedToCartConfirmation(productId) {
        const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
        if (!productCard) return;

        const addButton = productCard.querySelector('.add-to-cart-btn');
        if (!addButton) return;

        // Change button state
        const originalText = addButton.innerHTML;
        addButton.innerHTML = `<i class='bx bx-check'></i> Added to Cart`;
        addButton.classList.add('added');

        // Reset button after 2 seconds
        setTimeout(() => {
            addButton.innerHTML = originalText;
            addButton.classList.remove('added');
        }, 2000);
    }
}

// Add a custom event to notify sidebar when cart is updated
document.addEventListener('cartUpdated', () => {
    // Dispatch an event that the sidebar can listen to
    document.dispatchEvent(new CustomEvent('updateCartBadge'));
});