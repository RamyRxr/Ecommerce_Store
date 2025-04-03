export default class ExploreContents {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.currentPage = 1;
        this.itemsPerPage = 35; // 5 columns × 7 rows = 35 items per page
        this.sortOption = 'newest';
        this.products = [];
        this.filteredProducts = [];
        this.init();
    }

    async init() {
        await this.fetchProducts();
        this.render();
        this.setupEventListeners();
    }

    async fetchProducts() {
        try {
            // Calculate exact number of products to generate 10 pages
            const totalProductsNeeded = this.itemsPerPage * 10;

            // Product image paths - using your existing images
            const productImages = [
                '../assets/images/products-images/product-1.svg',
                '../assets/images/products-images/product-2.svg',
                '../assets/images/products-images/product-3.svg',
                '../assets/images/products-images/product-4.svg',
                '../assets/images/products-images/product-5.svg',
                '../assets/images/products-images/product-6.svg',
            ];

            // Product names and descriptions
            const productNames = [
                'Premium Wireless Headphones',
                'Ultra HD Smartphone',
                'Gaming Laptop Pro',
                'Smart Tablet 4K',
                'Professional DSLR Camera',
                'Noise-Cancelling Earbuds',
                'Portable SSD 1TB',
                'Mechanical Keyboard RGB',
                'Smart Watch Series 7',
                'Bluetooth Speaker',
                'USB-C Hub Multiport',
                'Wireless Charging Pad'
            ];

            const productDescriptions = [
                'Experience crystal clear audio with premium comfort and long battery life.',
                'The latest smartphone with 8K camera and 120Hz display.',
                'Powerful gaming laptop with RTX graphics and high refresh rate.',
                'Ultra-thin tablet with stunning 4K display and all-day battery.',
                'Capture professional-quality photos with this high-end DSLR camera.',
                'Immersive sound with active noise cancellation technology.',
                'Lightning-fast data transfer with compact, durable design.',
                'Premium mechanical keyboard with customizable RGB lighting.',
                'Track fitness, messages, and more with this advanced smartwatch.',
                'Room-filling sound with waterproof design and 20-hour battery.',
                'Connect multiple devices with this versatile USB-C hub.',
                'Fast wireless charging for all compatible devices.'
            ];

            // Generate products with more realistic data
            this.products = Array.from({ length: totalProductsNeeded }, (_, i) => {
                // Determine index for cycling through available images/names
                const itemIndex = i % productImages.length;

                // Randomly determine if product has a discount
                const hasDiscount = Math.random() > 0.6;
                const isNew = Math.random() > 0.8;

                // Generate realistic price
                const basePrice = Math.floor(Math.random() * 900) + 100;
                const originalPrice = hasDiscount ? basePrice : null;
                const discountedPrice = hasDiscount ? Math.floor(basePrice * 0.8) : basePrice;

                return {
                    id: i + 1,
                    name: productNames[itemIndex],
                    description: productDescriptions[itemIndex],
                    price: discountedPrice,
                    originalPrice: originalPrice,
                    rating: (Math.random() * 3 + 2).toFixed(1), // Random rating between 2-5
                    ratingCount: Math.floor(Math.random() * 500) + 10,
                    image: productImages[itemIndex],
                    isSaved: false,
                    isNew: isNew,
                    isSale: hasDiscount,
                    dateAdded: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
                };
            });

            // Initial sort by newest
            this.sortProducts('newest');
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }

    sortProducts(option) {
        this.sortOption = option;

        switch (option) {
            case 'newest':
                this.filteredProducts = [...this.products].sort((a, b) =>
                    b.dateAdded - a.dateAdded
                );
                break;
            case 'price-low-high':
                this.filteredProducts = [...this.products].sort((a, b) =>
                    a.price - b.price
                );
                break;
            case 'price-high-low':
                this.filteredProducts = [...this.products].sort((a, b) =>
                    b.price - a.price
                );
                break;
            case 'highest-rated':
                this.filteredProducts = [...this.products].sort((a, b) =>
                    b.rating - a.rating || b.ratingCount - a.ratingCount
                );
                break;
            default:
                this.filteredProducts = [...this.products];
        }

        this.currentPage = 1; // Reset to first page on sort
        this.updateProductCards();
        this.updatePagination();
    }

    searchProducts(query) {
        if (!query || query.trim() === '') {
            this.filteredProducts = [...this.products];
        } else {
            const searchTerm = query.toLowerCase().trim();
            this.filteredProducts = this.products.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm)
            );
        }

        // Re-apply current sort
        this.sortProducts(this.sortOption);
    }

    render() {
        const mainContentHTML = `
            <div class="main-content-container">
                <div class="search-filter-container">
                    <div class="search-container">
                        <i class='bx bx-search'></i>
                        <input type="text" id="main-search" placeholder="Search products...">
                    </div>
                    
                    <div class="filter-controls">
                        <button id="filter-dropdown-btn">
                            <i class='bx bx-sort-alt-2'></i>
                            <span>Sort</span>
                        </button>
                        
                        <div class="filter-dropdown">
                            <div class="filter-option" data-sort="newest">
                                <i class='bx bx-time'></i>
                                <span>Newest</span>
                            </div>
                            <div class="filter-option" data-sort="price-low-high">
                                <i class='bx bx-sort-up'></i>
                                <span>Price: Low to High</span>
                            </div>
                            <div class="filter-option" data-sort="price-high-low">
                                <i class='bx bx-sort-down'></i>
                                <span>Price: High to Low</span>
                            </div>
                            <div class="filter-option" data-sort="highest-rated">
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

        if (paginatedProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-products">
                    <i class='bx bx-search-alt'></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                </div>
            `;
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

            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                    <button class="save-btn ${product.isSaved ? 'saved' : ''}">
                        <i class='bx ${product.isSaved ? 'bxs-heart' : 'bx-heart'}'></i>
                    </button>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
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
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.searchProducts(searchInput.value);
            });
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
            let selectedOption = 'newest';

            filterOptions.forEach(option => {
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
}