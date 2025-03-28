
export default class MainContent {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.currentSlide = 0;
        this.slideCount = 6;
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        const mainContentHTML = `
            <div class="main-content">
                <!-- Store Name Header -->
                <div class="store-header">
                    <h1>RamyRXR Store</h1>
                </div>

                <!-- Ad Carousel -->
                <div class="ad-carousel">
                    <div class="carousel-container">
                        <div class="carousel-slide active">
                            <img src="/assets/images/products-images/headphone-1.jpg" alt="Special Offer">
                            <div class="carousel-caption">
                                <h3>Summer Collection</h3>
                                <p>Up to 50% off on selected items</p>
                                <button class="shop-now-btn">Shop Now</button>
                            </div>
                        </div>
                        <div class="carousel-slide">
                            <img src="/assets/images/products-images/headphone-2.jpg" alt="New Arrivals">
                            <div class="carousel-caption">
                                <h3>New Arrivals</h3>
                                <p>Check out our latest products</p>
                                <button class="shop-now-btn">Explore</button>
                            </div>
                        </div>
                        <div class="carousel-slide">
                            <img src="/assets/images/products-images/pc-1.jpg" alt="Limited Edition">
                            <div class="carousel-caption">
                                <h3>Limited Edition</h3>
                                <p>Exclusive products available for a limited time</p>
                                <button class="shop-now-btn">View Collection</button>
                            </div>
                        </div>
                        <div class="carousel-slide">
                            <img src="/assets/images/products-images/pc-2.jpg" alt="Best Sellers">
                            <div class="carousel-caption">
                                <h3>Best Sellers</h3>
                                <p>Our most popular products this month</p>
                                <button class="shop-now-btn">See More</button>
                            </div>
                        </div>
                        <div class="carousel-slide">
                            <img src="/assets/images/products-images/setup-1.jpg" alt="Clearance">
                            <div class="carousel-caption">
                                <h3>Clearance Sale</h3>
                                <p>Last chance to buy at unbeatable prices</p>
                                <button class="shop-now-btn">Shop Sale</button>
                            </div>
                        </div>
                        <div class="carousel-slide">
                            <img src="/assets/images/products-images/setup-2.jpg" alt="Premium Collection">
                            <div class="carousel-caption">
                                <h3>Premium Collection</h3>
                                <p>Luxury items for discerning customers</p>
                                <button class="shop-now-btn">Discover</button>
                            </div>
                        </div>
                    </div>

                    <button class="carousel-btn prev"><i class='bx bx-chevron-left'></i></button>
                    <button class="carousel-btn next"><i class='bx bx-chevron-right'></i></button>
                    
                    <div class="carousel-dots">
                        <span class="dot active" data-index="0"></span>
                        <span class="dot" data-index="1"></span>
                        <span class="dot" data-index="2"></span>
                        <span class="dot" data-index="3"></span>
                        <span class="dot" data-index="4"></span>
                        <span class="dot" data-index="5"></span>
                    </div>
                </div>

                <!-- Categories -->
                <div class="categories-section">
                    <h2>Shop by Category</h2>
                    <div class="categories-container">
                        <button class="category-btn active">Electronics</button>
                        <button class="category-btn">Fashion</button>
                        <button class="category-btn">Home & Garden</button>
                        <button class="category-btn">Sports</button>
                        <button class="category-btn">Beauty</button>
                        <button class="category-btn">Toys</button>
                        <button class="category-btn">Books</button>
                        <button class="category-btn">Automotive</button>
                        <button class="category-btn">Health</button>
                        <button class="category-btn">Jewelry</button>
                    </div>
                        <button class="category-nav-btn next"><i class='bx bx-chevron-right'></i></button>
                </div>

                <!-- Products Grid -->
                <div class="products-section">
                    <h2>Featured Products</h2>
                    <div class="products-grid">
                        ${this.generateProductCards()}
                    </div>

                    <!-- Pagination -->
                    <div class="pagination">
                        <button class="page-nav prev"><i class='bx bx-chevron-left'></i></button>
                        <button class="page-btn active">1</button>
                        <button class="page-btn">2</button>
                        <button class="page-btn">3</button>
                        <span class="page-dots">...</span>
                        <button class="page-btn">10</button>
                        <button class="page-nav next"><i class='bx bx-chevron-right'></i></button>
                    </div>
                </div>
            </div>
        `;

        // Create main content element and add to container
        const mainContentContainer = document.createElement('div');
        mainContentContainer.id = 'main-content-container';
        mainContentContainer.innerHTML = mainContentHTML;
        
        // Check if main content already exists
        const existingMainContent = document.querySelector('.main-content');
        if (existingMainContent) {
            existingMainContent.replaceWith(mainContentContainer.firstElementChild);
        } else {
            this.container.appendChild(mainContentContainer);
        }
    }

    generateProductCards() {
        const products = [
            {
                id: 1,
                name: 'Wireless Headphones',
                price: 129.99,
                rating: 4.5,
                reviews: 120,
                image: '/assets/images/products-images/product-1.svg',
                badge: 'New'
            },
            {
                id: 2,
                name: 'Smart Watch Pro',
                price: 199.99,
                rating: 5,
                reviews: 84,
                image: '/assets/images/products-images/product-2.svg'
            },
            {
                id: 3,
                name: 'Bluetooth Speaker',
                price: 71.99,
                oldPrice: 89.99,
                rating: 4,
                reviews: 56,
                image: '/assets/images/products-images/product-3.svg',
                badge: 'sale',
                discount: '-20%'
            },
            {
                id: 4,
                name: 'Gaming Mouse',
                price: 49.99,
                rating: 3.5,
                reviews: 42,
                image: '/assets/images/products-images/product-4.svg'
            },
            {
                id: 5,
                name: 'Noise Cancelling Earbuds',
                price: 89.99,
                rating: 4,
                reviews: 78,
                image: '/assets/images/products-images/product-1.svg'
            },
            {
                id: 6,
                name: 'Fitness Tracker',
                price: 79.99,
                rating: 4.5,
                reviews: 112,
                image: '/assets/images/products-images/product-2.svg',
                badge: 'Best'
            },
            {
                id: 7,
                name: 'Portable Charger',
                price: 34.99,
                rating: 4,
                reviews: 65,
                image: '/assets/images/products-images/product-3.svg'
            },
            {
                id: 8,
                name: 'Mechanical Keyboard',
                price: 69.99,
                oldPrice: 99.99,
                rating: 5,
                reviews: 93,
                image: '/assets/images/products-images/product-4.svg',
                badge: 'sale',
                discount: '-30%'
            },
            {
                id: 9,
                name: 'Smart Home Hub',
                price: 129.99,
                rating: 3.5,
                reviews: 42,
                image: '/assets/images/products-images/product-1.svg',
                badge: 'New'
            },
            {
                id: 10,
                name: 'Wireless Charger',
                price: 29.99,
                rating: 4,
                reviews: 87,
                image: '/assets/images/products-images/product-2.svg'
            },
            {
                id: 11,
                name: 'HD Webcam',
                price: 59.99,
                rating: 4.5,
                reviews: 54,
                image: '/assets/images/products-images/product-3.svg'
            },
            {
                id: 12,
                name: 'External SSD 1TB',
                price: 119.99,
                rating: 5,
                reviews: 63,
                image: '/assets/images/products-images/product-4.svg'
            },
            {
                id: 13,
                name: 'Ergonomic Mouse',
                price: 59.49,
                oldPrice: 69.99,
                rating: 3.5,
                reviews: 38,
                image: '/assets/images/products-images/product-1.svg',
                badge: 'sale',
                discount: '-15%'
            },
            {
                id: 14,
                name: 'Tablet Stand',
                price: 24.99,
                rating: 5,
                reviews: 72,
                image: '/assets/images/products-images/product-2.svg'
            },
            {
                id: 15,
                name: 'WiFi Extender',
                price: 44.99,
                rating: 4,
                reviews: 91,
                image: '/assets/images/products-images/product-3.svg',
                badge: 'Hot'
            },
            {
                id: 16,
                name: 'USB-C Hub',
                price: 39.99,
                rating: 4,
                reviews: 48,
                image: '/assets/images/products-images/product-4.svg'
            },
            // Adding 4 more rows (16 more products)
            {
                id: 17,
                name: 'Wireless Keyboard',
                price: 59.99,
                rating: 4.5,
                reviews: 103,
                image: '/assets/images/products-images/product-1.svg'
            },
            {
                id: 18,
                name: '4K Monitor',
                price: 299.99,
                oldPrice: 399.99,
                rating: 5,
                reviews: 58,
                image: '/assets/images/products-images/product-2.svg',
                badge: 'sale',
                discount: '-25%'
            },
            {
                id: 19,
                name: 'Desk Lamp',
                price: 34.99,
                rating: 4,
                reviews: 76,
                image: '/assets/images/products-images/product-3.svg'
            },
            {
                id: 20,
                name: 'Smartphone Stand',
                price: 19.99,
                rating: 4.5,
                reviews: 89,
                image: '/assets/images/products-images/product-4.svg',
                badge: 'New'
            },
            {
                id: 21,
                name: 'Laptop Cooling Pad',
                price: 44.99,
                rating: 4,
                reviews: 67,
                image: '/assets/images/products-images/product-1.svg'
            },
            {
                id: 22,
                name: 'Desk Organizer',
                price: 29.99,
                rating: 3.5,
                reviews: 52,
                image: '/assets/images/products-images/product-2.svg'
            },
            {
                id: 23,
                name: 'HDMI Cable 6ft',
                price: 13.49,
                oldPrice: 14.99,
                rating: 5,
                reviews: 124,
                image: '/assets/images/products-images/product-3.svg',
                badge: 'sale',
                discount: '-10%'
            },
            {
                id: 24,
                name: 'Phone Case',
                price: 19.99,
                rating: 4,
                reviews: 98,
                image: '/assets/images/products-images/product-4.svg'
            },
            {
                id: 25,
                name: 'Laptop Backpack',
                price: 69.99,
                rating: 5,
                reviews: 147,
                image: '/assets/images/products-images/product-1.svg',
                badge: 'Best'
            },
            {
                id: 26,
                name: 'USB Flash Drive 64GB',
                price: 24.99,
                rating: 4,
                reviews: 73,
                image: '/assets/images/products-images/product-2.svg'
            },
            {
                id: 27,
                name: 'Wireless Charger Pad',
                price: 29.99,
                rating: 4.5,
                reviews: 86,
                image: '/assets/images/products-images/product-3.svg'
            },
            {
                id: 28,
                name: 'Bluetooth Earphones',
                price: 29.99,
                oldPrice: 49.99,
                rating: 3.5,
                reviews: 45,
                image: '/assets/images/products-images/product-4.svg',
                badge: 'sale',
                discount: '-40%'
            }
        ];

        return products.map(product => {
            // Generate stars based on rating
            const fullStars = Math.floor(product.rating);
            const hasHalfStar = product.rating % 1 !== 0;
            const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
            
            const starsHTML = `
                ${Array(fullStars).fill('<i class="bx bxs-star"></i>').join('')}
                ${hasHalfStar ? '<i class="bx bxs-star-half"></i>' : ''}
                ${Array(emptyStars).fill('<i class="bx bx-star"></i>').join('')}
            `;

            // Return card HTML
            return `
                <div class="product-card">
                    ${product.badge ? `<div class="product-badge ${product.badge.toLowerCase()}">${product.badge === 'sale' ? product.discount : product.badge}</div>` : ''}
                    <img src="${product.image}" alt="${product.name}">
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p class="product-price">
                            ${product.oldPrice ? `<span class="old-price">$${product.oldPrice}</span> ` : ''}
                            $${product.price}
                        </p>
                        <div class="product-rating">
                            ${starsHTML}
                            <span>${product.rating} (${product.reviews})</span>
                        </div>
                        <button class="add-to-cart-btn"><i class='bx bx-cart-add'></i> Add to Cart</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    setupEventListeners() {
        // Carousel navigation
        const prevBtn = document.querySelector('.carousel-btn.prev');
        const nextBtn = document.querySelector('.carousel-btn.next');
        const dots = document.querySelectorAll('.carousel-dots .dot');

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => this.changeSlide(-1));
            nextBtn.addEventListener('click', () => this.changeSlide(1));
        }

        if (dots.length) {
            dots.forEach(dot => {
                dot.addEventListener('click', () => {
                    const index = parseInt(dot.getAttribute('data-index'));
                    this.goToSlide(index);
                });
            });
        }

        // Auto rotate carousel
        this.startCarouselAutoplay();

        // Category button click handling
        const categoryBtns = document.querySelectorAll('.category-btn');
        if (categoryBtns.length) {
            categoryBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    // Here you would typically filter products by category
                });
            });
        }

        // Pagination
        const paginationBtns = document.querySelectorAll('.page-btn');
        const prevPageBtn = document.querySelector('.page-nav.prev');
        const nextPageBtn = document.querySelector('.page-nav.next');

        if (paginationBtns.length) {
            paginationBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    // Here you would load the appropriate page of products
                });
            });
        }

        if (prevPageBtn && nextPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                // Go to previous page logic
                const activePage = document.querySelector('.page-btn.active');
                if (activePage && activePage.previousElementSibling && activePage.previousElementSibling.classList.contains('page-btn')) {
                    activePage.previousElementSibling.click();
                }
            });

            nextPageBtn.addEventListener('click', () => {
                // Go to next page logic
                const activePage = document.querySelector('.page-btn.active');
                if (activePage && activePage.nextElementSibling && activePage.nextElementSibling.classList.contains('page-btn')) {
                    activePage.nextElementSibling.click();
                }
            });
        }

        // Add to cart buttons
        const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
        if (addToCartBtns.length) {
            addToCartBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const productCard = e.currentTarget.closest('.product-card');
                    const productName = productCard.querySelector('h3').textContent;
                    
                    // Visual feedback
                    btn.innerHTML = '<i class="bx bx-check"></i> Added!';
                    setTimeout(() => {
                        btn.innerHTML = '<i class="bx bx-cart-add"></i> Add to Cart';
                    }, 2000);
                    
                    // Here you would add the product to the cart
                    console.log(`Added to cart: ${productName}`);
                });
            });
        }
    }

    changeSlide(direction) {
        this.goToSlide((this.currentSlide + direction + this.slideCount) % this.slideCount);
    }

    goToSlide(index) {
        const slides = document.querySelectorAll('.carousel-slide');
        const dots = document.querySelectorAll('.carousel-dots .dot');

        if (slides.length && dots.length) {
            slides[this.currentSlide].classList.remove('active');
            dots[this.currentSlide].classList.remove('active');

            this.currentSlide = index;
            
            slides[this.currentSlide].classList.add('active');
            dots[this.currentSlide].classList.add('active');
        }
    }

    startCarouselAutoplay() {
        this.carouselInterval = setInterval(() => {
            this.changeSlide(1);
        }, 5000); // Change slide every 5 seconds
    }

    stopCarouselAutoplay() {
        if (this.carouselInterval) {
            clearInterval(this.carouselInterval);
        }
    }
}


