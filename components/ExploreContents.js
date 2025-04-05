export default class ExploreContents {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.currentPage = 1;
        this.itemsPerPage = 35; // 5 columns × 7 rows = 35 items per page
        this.sortOption = 'newest';
        this.products = [];
        this.filteredProducts = [];
        this.activeFilters = null;
        this.init();
    }

    async init() {
        await this.fetchProducts();
        this.initializeSavedStates(); // Add this line
        this.render();
        this.setupEventListeners();
    }

    async fetchProducts() {
        try {
            // Define structured product data with real categories and brands
            const productData = [
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
                    isNew: false
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
                    isNew: true
                },
                {
                    id: 3,
                    name: "Dell XPS 15",
                    description: "Powerful laptop with 15.6\" OLED display, Intel Core i9 and NVIDIA RTX graphics.",
                    price: 1899.99,
                    originalPrice: 2199.99,
                    category: "laptops",
                    brand: "dell",
                    rating: 4.6,
                    ratingCount: 423,
                    image: "../assets/images/products-images/product-3.svg",
                    isSale: true,
                    isNew: false
                },
                {
                    id: 4,
                    name: "iPad Pro 12.9",
                    description: "Apple's professional tablet with M2 chip, Liquid Retina XDR display and all-day battery.",
                    price: 1099.99,
                    originalPrice: null,
                    category: "tablets",
                    brand: "apple",
                    rating: 4.9,
                    ratingCount: 612,
                    image: "../assets/images/products-images/product-4.svg",
                    isSale: false,
                    isNew: true
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
                    isNew: false
                },
                {
                    id: 6,
                    name: "JBL Flip 6",
                    description: "Portable Bluetooth speaker with rich sound, waterproof design and 12-hour playtime.",
                    price: 129.99,
                    originalPrice: 149.99,
                    category: "accessories",
                    brand: "jbl",
                    rating: 4.5,
                    ratingCount: 875,
                    image: "../assets/images/products-images/product-6.svg",
                    isSale: true,
                    isNew: false
                },
                {
                    id: 7,
                    name: "Samsung Galaxy S23 Ultra",
                    description: "Premium Android smartphone with S Pen support, 200MP camera and 6.8\" Dynamic AMOLED.",
                    price: 1199.99,
                    originalPrice: null,
                    category: "smartphones",
                    brand: "samsung",
                    rating: 4.6,
                    ratingCount: 731,
                    image: "../assets/images/products-images/product-2.svg",
                    isSale: false,
                    isNew: true
                },
                {
                    id: 8,
                    name: "MacBook Pro 16\"",
                    description: "Powerful laptop with M3 Pro chip, stunning Liquid Retina XDR display and up to 22-hour battery.",
                    price: 2499.99,
                    originalPrice: null,
                    category: "laptops",
                    brand: "apple",
                    rating: 4.8,
                    ratingCount: 517,
                    image: "../assets/images/products-images/product-3.svg",
                    isSale: false,
                    isNew: true
                },
                {
                    id: 9,
                    name: "Sony WF-1000XM5",
                    description: "True wireless earbuds with exceptional noise cancellation and high-resolution audio.",
                    price: 249.99,
                    originalPrice: 279.99,
                    category: "headphones",
                    brand: "sony",
                    rating: 4.7,
                    ratingCount: 629,
                    image: "../assets/images/products-images/product-1.svg",
                    isSale: true,
                    isNew: false
                },
                {
                    id: 10,
                    name: "Lenovo ThinkPad X1 Carbon",
                    description: "Premium business laptop with Intel Core i7, 14\" display and legendary durability.",
                    price: 1799.99,
                    originalPrice: 1999.99,
                    category: "laptops",
                    brand: "lenovo",
                    rating: 4.6,
                    ratingCount: 384,
                    image: "../assets/images/products-images/product-3.svg",
                    isSale: true,
                    isNew: false
                },
                {
                    id: 11,
                    name: "Samsung Galaxy Tab S9 Ultra",
                    description: "Large 14.6\" AMOLED display tablet with S Pen included and powerful Snapdragon processor.",
                    price: 1199.99,
                    originalPrice: null,
                    category: "tablets",
                    brand: "samsung",
                    rating: 4.5,
                    ratingCount: 297,
                    image: "../assets/images/products-images/product-4.svg",
                    isSale: false,
                    isNew: true
                },
                {
                    id: 12,
                    name: "Canon EOS R6 Mark II",
                    description: "Advanced mirrorless camera with 24MP sensor, 6K video and enhanced subject tracking.",
                    price: 2499.99,
                    originalPrice: 2699.99,
                    category: "cameras",
                    brand: "canon",
                    rating: 4.7,
                    ratingCount: 213,
                    image: "../assets/images/products-images/product-5.svg",
                    isSale: true,
                    isNew: false
                }
            ];

            // Calculate exact number of products to generate 10 pages
            const totalProductsNeeded = this.itemsPerPage * 10;

            // Generate additional products based on our defined items
            this.products = [];
            for (let i = 0; i < totalProductsNeeded; i++) {
                // Use modulo to cycle through our defined products
                const sourceProduct = productData[i % productData.length];

                // Create a copy with a unique ID
                const product = {
                    ...sourceProduct,
                    id: i + 1,
                    dateAdded: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                    isSaved: false
                };

                this.products.push(product);
            }

            // IMPORTANT: Initialize filteredProducts with all products
            this.filteredProducts = [...this.products];

            // Then sort by newest
            this.sortProducts('newest');
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }

    initializeSavedStates() {
        // Get saved items from localStorage
        const savedItemsJson = localStorage.getItem('savedItems');
        
        if (savedItemsJson) {
            try {
                const savedItems = JSON.parse(savedItemsJson);
                const savedIds = savedItems.map(item => item.id);
                
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
                
                console.log(`Initialized ${savedIds.length} saved items states`);
            } catch (error) {
                console.error('Error initializing saved states:', error);
            }
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
            productCard.dataset.id = product.id;

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
        const paginationContainer = document.querySelector('.pagination');
        if (!paginationContainer) return;

        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);

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
            const filters = event.detail.filters;
            this.applyFilters(filters);
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
            if (e.target.matches('.save-btn') || e.target.closest('.save-btn')) {
                const saveBtn = e.target.matches('.save-btn') ? e.target : e.target.closest('.save-btn');
                const productCard = saveBtn.closest('.product-card');
                const productId = parseInt(productCard.dataset.id);

                const product = this.products.find(p => p.id === productId);
                if (product) {
                    product.isSaved = !product.isSaved;

                    // Update the button
                    saveBtn.classList.toggle('saved', product.isSaved);
                    const icon = saveBtn.querySelector('i');
                    icon.className = product.isSaved ? 'bx bxs-heart' : 'bx bx-heart';
                    
                    // Save to localStorage
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
                    // Temporarily change the button to indicate success
                    const originalText = btn.innerHTML;
                    btn.innerHTML = '<i class=\'bx bx-check\'></i> Added';
                    btn.classList.add('added');

                    // Reset after some time
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.classList.remove('added');
                    }, 2000);

                    // In a real app, you would call a function to add the product to the cart
                    console.log(`Added product ${product.id} to cart`);
                }
            }
        });
    }

    // Add a new method to handle saving items to localStorage
    updateSavedItems(product) {
        // Get current saved items from localStorage
        let savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
        
        if (product.isSaved) {
            // Add to saved items if it's not already there
            if (!savedItems.some(item => item.id === product.id)) {
                // Add dateAdded property to track when it was saved
                const savedItem = {
                    ...product, 
                    dateAdded: new Date().toISOString()
                };
                savedItems.push(savedItem);
                console.log(`Added product ${product.id} to saved items`);
            }
        } else {
            // Remove from saved items
            savedItems = savedItems.filter(item => item.id !== product.id);
            console.log(`Removed product ${product.id} from saved items`);
        }
        
        // Save back to localStorage
        localStorage.setItem('savedItems', JSON.stringify(savedItems));
    }
}