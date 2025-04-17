export default class ItemDetail {
    constructor(containerId = 'app', productId) {
        this.container = document.getElementById(containerId);
        this.productId = productId;
        this.product = null;
        this.quantity = 1;
        this.selectedImageIndex = 0;
        this.selectedTab = 'details';
        this.reviewsToShow = 5;
        this.reviewFilter = 'all';
        this.reviewSort = 'newest';
        this.init();
    }

    async init() {
        await this.loadProductDetails();
        this.render();
        this.setupEventListeners();
    }

    async loadProductDetails() {
        try {
            // In a real app, fetch from API
            // For now, we'll simulate by getting from localStorage or using mock data
            const productsJson = localStorage.getItem('productData');
            let products = [];
            
            if (productsJson) {
                products = JSON.parse(productsJson);
            } else {
                // Mock data if no products in localStorage
                products = this.getMockProducts();
            }
            
            this.product = products.find(p => p.id == this.productId);
            
            if (!this.product) {
                console.error('Product not found');
                // Fallback to a default product
                this.product = this.getDefaultProduct();
            }
        } catch (error) {
            console.error('Error loading product details:', error);
            this.product = this.getDefaultProduct();
        }
    }
    
    getMockProducts() {
        return [
            {
                id: 1,
                name: "Smartphone X Pro",
                price: 999.99,
                originalPrice: 1299.99,
                discount: 23,
                rating: 4.5,
                ratingCount: 128,
                soldCount: 534,
                description: "The latest smartphone with advanced camera system, powerful processor, and all-day battery life.",
                inStock: true,
                stockQty: 42,
                images: [
                    "assets/images/products/phone-1.jpg",
                    "assets/images/products/phone-2.jpg",
                    "assets/images/products/phone-3.jpg",
                ],
                specs: {
                    "Brand": "TechX",
                    "Model": "X Pro 2025",
                    "Year of Release": "2025",
                    "Display": "6.7-inch Super Retina XDR",
                    "Processor": "A16 Bionic chip",
                    "Camera": "48MP main camera",
                    "Battery": "4,500 mAh",
                    "Charging Time": "45 minutes (0-80%)",
                    "Storage": "256GB",
                    "Weight": "189g"
                },
                reviews: [
                    {
                        id: 101,
                        user: "John D.",
                        rating: 5,
                        date: "2025-03-15",
                        title: "Amazing device!",
                        content: "This is the best smartphone I've ever owned. The camera quality is outstanding and battery life is impressive.",
                        likes: 24,
                        dislikes: 2
                    },
                    {
                        id: 102,
                        user: "Sarah M.",
                        rating: 4,
                        date: "2025-03-12",
                        title: "Great but expensive",
                        content: "Love the phone but wish it was a bit more affordable. The features are worth it though.",
                        likes: 16,
                        dislikes: 0
                    },
                    {
                        id: 103,
                        user: "Robert K.",
                        rating: 5,
                        date: "2025-03-10",
                        title: "Worth every penny",
                        content: "The camera system alone makes this worth the purchase. I'm amazed by the photo quality.",
                        likes: 31,
                        dislikes: 3
                    },
                    {
                        id: 104,
                        user: "Emily T.",
                        rating: 3,
                        date: "2025-03-05",
                        title: "Good but has issues",
                        content: "The phone is fast and has a great display, but I've had some software glitches that need fixing.",
                        likes: 8,
                        dislikes: 1
                    },
                    {
                        id: 105,
                        user: "Michael R.",
                        rating: 5,
                        date: "2025-03-01",
                        title: "Perfect upgrade",
                        content: "Upgraded from last year's model and the improvements are significant. Highly recommend!",
                        likes: 14,
                        dislikes: 0
                    },
                    {
                        id: 106,
                        user: "Jennifer A.",
                        rating: 4,
                        date: "2025-02-28",
                        title: "Almost perfect",
                        content: "Would give 5 stars but the speaker quality could be better. Otherwise it's fantastic!",
                        likes: 7,
                        dislikes: 1
                    },
                    {
                        id: 107,
                        user: "David L.",
                        rating: 2,
                        date: "2025-02-25",
                        title: "Disappointed",
                        content: "Expected more for the price. Battery drains quickly when using camera features.",
                        likes: 19,
                        dislikes: 8
                    }
                ],
                colors: ["Black", "Silver", "Gold"],
                sizes: ["128GB", "256GB", "512GB"]
            },
            {
                id: 2,
                name: "Wireless Earbuds Pro",
                price: 149.99,
                rating: 4.3,
                ratingCount: 95,
                soldCount: 327,
                description: "Premium wireless earbuds with noise cancellation and crystal-clear sound quality.",
                inStock: true,
                stockQty: 25,
                image: "assets/images/products/earbuds.jpg",
                specs: {
                    "Type": "In-ear true wireless",
                    "Battery Life": "Up to 8 hours (28 with case)",
                    "Noise Cancellation": "Active",
                    "Water Resistance": "IPX4",
                    "Weight": "5.4g per earbud, 48g case"
                }
            }
        ];
    }
    
    getDefaultProduct() {
        return {
            id: 0,
            name: "Product Not Found",
            price: 0,
            rating: 0,
            ratingCount: 0,
            description: "This product could not be found.",
            inStock: false,
            image: "assets/images/placeholder.jpg"
        };
    }

    render() {
        if (!this.product) return;
        
        const hasMultipleImages = this.product.images && this.product.images.length > 1;
        const productImage = hasMultipleImages ? 
            this.product.images[this.selectedImageIndex] : 
            (this.product.image || "assets/images/placeholder.jpg");
            
        // Generate HTML for stars
        const starsHTML = this.generateStarsHTML(this.product.rating || 0);
        
        // Check if product is saved
        const savedItemsJson = localStorage.getItem('savedItems') || '[]';
        const savedItems = JSON.parse(savedItemsJson);
        const isSaved = savedItems.some(item => item.id == this.product.id);
        
        // Get reviews data for summary
        const reviewsData = this.getReviewsSummary();
        
        const html = `
            <div class="item-detail-container">
                <div class="product-main">
                    <div class="product-images">
                        <div class="main-image">
                            <img src="${productImage}" alt="${this.product.name}">
                        </div>
                        
                        ${hasMultipleImages ? `
                        <div class="thumbnail-container">
                            ${this.product.images.map((img, index) => `
                                <div class="thumbnail ${index === this.selectedImageIndex ? 'active' : ''}" data-index="${index}">
                                    <img src="${img}" alt="${this.product.name} - Image ${index + 1}">
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="product-info">
                        <h1 class="product-title">${this.product.name}</h1>
                        
                        <div class="product-meta">
                            <div class="product-rating">
                                <div class="stars">
                                    ${starsHTML}
                                </div>
                                <span class="rating-count">(${this.product.ratingCount || 0} reviews)</span>
                            </div>
                            
                            ${this.product.soldCount ? `
                            <div class="sold-count">
                                <i class='bx bx-package'></i>
                                <span>${this.product.soldCount} sold</span>
                            </div>
                            ` : ''}
                        </div>
                        
                        <div class="product-price">
                            <span class="current-price">$${this.product.price.toFixed(2)}</span>
                            
                            ${this.product.discount ? `
                            <span class="old-price">$${this.product.originalPrice.toFixed(2)}</span>
                            <span class="discount-badge">-${this.product.discount}%</span>
                            ` : ''}
                        </div>
                        
                        <div class="product-short-desc">
                            <p>${this.product.description}</p>
                        </div>
                        
                        ${this.product.colors ? `
                        <div class="product-colors">
                            <span class="option-label">Color:</span>
                            <div class="color-options">
                                ${this.product.colors.map((color, idx) => `
                                <div class="color-option ${idx === 0 ? 'selected' : ''}" data-color="${color}">
                                    <span class="color-name">${color}</span>
                                </div>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}
                        
                        ${this.product.sizes ? `
                        <div class="product-sizes">
                            <span class="option-label">Size:</span>
                            <div class="size-options">
                                ${this.product.sizes.map((size, idx) => `
                                <div class="size-option ${idx === 0 ? 'selected' : ''}" data-size="${size}">
                                    ${size}
                                </div>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}
                        
                        <div class="product-quantity">
                            <span class="option-label">Quantity:</span>
                            <div class="quantity-selector">
                                <button class="qty-btn" id="decrease-qty" ${this.quantity <= 1 ? 'disabled' : ''}>
                                    <i class='bx bx-minus'></i>
                                </button>
                                <span class="quantity">${this.quantity}</span>
                                <button class="qty-btn" id="increase-qty">
                                    <i class='bx bx-plus'></i>
                                </button>
                            </div>
                            
                            <span class="stock-info ${this.product.inStock ? 'in-stock' : 'out-of-stock'}">
                                <i class='bx ${this.product.inStock ? 'bx-check-circle' : 'bx-x-circle'}'></i>
                                <span>${this.product.inStock ? `In Stock: ${this.product.stockQty || 'Available'}` : 'Out of Stock'}</span>
                            </span>
                        </div>
                        
                        <div class="product-actions">
                            <button class="btn-primary add-to-cart-btn" id="add-to-cart" ${!this.product.inStock ? 'disabled' : ''}>
                                <i class='bx bx-cart-add'></i>
                                Add to Cart
                            </button>
                            
                            <button class="btn-icon save-btn ${isSaved ? 'saved' : ''}" id="save-item">
                                <i class='bx ${isSaved ? 'bxs-heart' : 'bx-heart'}'></i>
                            </button>
                            
                            <button class="btn-icon share-btn" id="share-item">
                                <i class='bx bx-share-alt'></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="product-details">
                    <div class="tabs-header">
                        <button class="tab-button ${this.selectedTab === 'details' ? 'active' : ''}" data-tab="details">Details</button>
                        <button class="tab-button ${this.selectedTab === 'specifications' ? 'active' : ''}" data-tab="specifications">Specifications</button>
                        <button class="tab-button ${this.selectedTab === 'reviews' ? 'active' : ''}" data-tab="reviews">Reviews</button>
                    </div>
                    
                    <div class="tabs-content">
                        <div class="tab-content details-tab ${this.selectedTab === 'details' ? 'active' : ''}">
                            <div class="detailed-description">
                                <p>${this.product.description}</p>
                                ${this.product.features ? `
                                <h3>Features</h3>
                                <ul>
                                    ${this.product.features.map(feature => `<li>${feature}</li>`).join('')}
                                </ul>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div class="tab-content specifications-tab ${this.selectedTab === 'specifications' ? 'active' : ''}">
                            ${this.product.specs ? `
                            <div class="specifications-list">
                                <table class="spec-table">
                                    <tbody>
                                        ${Object.entries(this.product.specs).map(([key, value]) => `
                                        <tr>
                                            <td class="spec-name">${key}</td>
                                            <td class="spec-value">${value}</td>
                                        </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                            ` : `<p>No specifications available for this product.</p>`}
                        </div>
                        
                        <div class="tab-content reviews-tab ${this.selectedTab === 'reviews' ? 'active' : ''}">
                            <div class="reviews-container">
                                <div class="reviews-summary">
                                    <div class="summary-rating">
                                        <div class="average-rating">${this.product.rating ? this.product.rating.toFixed(1) : '0.0'}</div>
                                        <div class="rating-stars">${starsHTML}</div>
                                        <div class="total-reviews">Based on ${this.product.ratingCount || 0} reviews</div>
                                    </div>
                                    
                                    <div class="rating-bars">
                                        ${reviewsData.ratingDistribution.map((dist, i) => `
                                        <div class="rating-bar-row">
                                            <div class="star-label">${5-i} star</div>
                                            <div class="rating-bar-container">
                                                <div class="rating-bar" style="width: ${dist.percentage}%"></div>
                                            </div>
                                            <div class="rating-percentage">${dist.percentage}%</div>
                                        </div>
                                        `).join('')}
                                    </div>
                                    
                                    <button class="btn-primary write-review-btn" id="write-review-btn">
                                        <i class='bx bx-edit'></i>
                                        Write a Review
                                    </button>
                                </div>
                                
                                <div class="reviews-content">
                                    <div class="reviews-header">
                                        <h3>Customer Reviews</h3>
                                        
                                        <div class="reviews-filter">
                                            <select class="filter-select" id="rating-filter">
                                                <option value="all" ${this.reviewFilter === 'all' ? 'selected' : ''}>All Stars</option>
                                                <option value="5" ${this.reviewFilter === '5' ? 'selected' : ''}>5 Stars</option>
                                                <option value="4" ${this.reviewFilter === '4' ? 'selected' : ''}>4 Stars</option>
                                                <option value="3" ${this.reviewFilter === '3' ? 'selected' : ''}>3 Stars</option>
                                                <option value="2" ${this.reviewFilter === '2' ? 'selected' : ''}>2 Stars</option>
                                                <option value="1" ${this.reviewFilter === '1' ? 'selected' : ''}>1 Star</option>
                                            </select>
                                            
                                            <select class="sort-select" id="sort-reviews">
                                                <option value="newest" ${this.reviewSort === 'newest' ? 'selected' : ''}>Newest</option>
                                                <option value="oldest" ${this.reviewSort === 'oldest' ? 'selected' : ''}>Oldest</option>
                                                <option value="highest" ${this.reviewSort === 'highest' ? 'selected' : ''}>Highest Rating</option>
                                                <option value="lowest" ${this.reviewSort === 'lowest' ? 'selected' : ''}>Lowest Rating</option>
                                                <option value="most-liked" ${this.reviewSort === 'most-liked' ? 'selected' : ''}>Most Liked</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div class="reviews-list">
                                        ${this.renderReviews()}
                                    </div>
                                    
                                    ${this.product.reviews && this.product.reviews.length > this.reviewsToShow ? `
                                    <div class="load-more">
                                        <button class="btn-secondary" id="load-more-reviews">
                                            Load More Reviews
                                        </button>
                                    </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="review-modal" class="modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>Write a Review</h2>
                            <span class="close-modal">&times;</span>
                        </div>
                        <div class="modal-body">
                            <form id="review-form">
                                <div class="form-group">
                                    <label>Your Rating</label>
                                    <div class="rating-input">
                                        <i class='bx bx-star' data-rating="1"></i>
                                        <i class='bx bx-star' data-rating="2"></i>
                                        <i class='bx bx-star' data-rating="3"></i>
                                        <i class='bx bx-star' data-rating="4"></i>
                                        <i class='bx bx-star' data-rating="5"></i>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="review-title">Review Title</label>
                                    <input type="text" id="review-title" required placeholder="Give your review a title">
                                </div>
                                <div class="form-group">
                                    <label for="review-content">Your Review</label>
                                    <textarea id="review-content" required rows="5" placeholder="Write your review here"></textarea>
                                </div>
                                <div class="form-actions">
                                    <button type="button" class="btn-secondary cancel-review">Cancel</button>
                                    <button type="submit" class="btn-primary submit-review">Submit Review</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
    }

    renderReviews() {
        if (!this.product.reviews || this.product.reviews.length === 0) {
            return '<div class="no-reviews">No reviews yet. Be the first to write a review!</div>';
        }
        
        // Filter reviews
        let filteredReviews = [...this.product.reviews];
        
        if (this.reviewFilter !== 'all') {
            const ratingFilter = parseInt(this.reviewFilter);
            filteredReviews = filteredReviews.filter(review => review.rating === ratingFilter);
        }
        
        // Sort reviews
        switch(this.reviewSort) {
            case 'newest':
                filteredReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'oldest':
                filteredReviews.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'highest':
                filteredReviews.sort((a, b) => b.rating - a.rating);
                break;
            case 'lowest':
                filteredReviews.sort((a, b) => a.rating - b.rating);
                break;
            case 'most-liked':
                filteredReviews.sort((a, b) => b.likes - a.likes);
                break;
        }
        
        // Limit reviews to show
        const reviewsToDisplay = filteredReviews.slice(0, this.reviewsToShow);
        
        if (reviewsToDisplay.length === 0) {
            return '<div class="no-reviews">No reviews match your filter criteria.</div>';
        }
        
        return reviewsToDisplay.map(review => `
            <div class="review-item" data-id="${review.id}">
                <div class="review-header">
                    <div class="reviewer-info">
                        <div class="reviewer-name">${review.user}</div>
                        <div class="review-date">${this.formatDate(review.date)}</div>
                    </div>
                    <div class="review-rating">
                        ${this.generateStarsHTML(review.rating)}
                    </div>
                </div>
                
                <div class="review-title">${review.title}</div>
                <div class="review-content">${review.content}</div>
                
                <div class="review-actions">
                    <button class="like-btn ${review.userLiked ? 'liked' : ''}" data-review-id="${review.id}">
                        <i class='bx bx-like'></i>
                        <span class="like-count">${review.likes}</span>
                    </button>
                    
                    <button class="dislike-btn ${review.userDisliked ? 'disliked' : ''}" data-review-id="${review.id}">
                        <i class='bx bx-dislike'></i>
                        <span class="dislike-count">${review.dislikes}</span>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    getReviewsSummary() {
        const reviews = this.product.reviews || [];
        const totalReviews = reviews.length;
        
        // Initialize rating distribution
        const ratingCounts = [0, 0, 0, 0, 0]; // [5-star, 4-star, 3-star, 2-star, 1-star]
        
        reviews.forEach(review => {
            if (review.rating >= 1 && review.rating <= 5) {
                ratingCounts[5 - review.rating]++;
            }
        });
        
        // Calculate percentages
        const ratingDistribution = ratingCounts.map(count => ({
            count,
            percentage: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
        }));
        
        return {
            totalReviews,
            ratingDistribution
        };
    }
    
    generateStarsHTML(rating) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                // Full star
                html += `<i class='bx bxs-star'></i>`;
            } else if (i - 0.5 <= rating) {
                // Half star
                html += `<i class='bx bxs-star-half'></i>`;
            } else {
                // Empty star
                html += `<i class='bx bx-star'></i>`;
            }
        }
        return html;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    setupEventListeners() {
        // Handle thumbnail clicks
        const thumbnails = document.querySelectorAll('.thumbnail');
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                this.selectedImageIndex = parseInt(thumb.dataset.index);
                this.updateMainImage();
                this.updateThumbnails();
            });
        });
        
        // Handle quantity selectors
        const decreaseBtn = document.getElementById('decrease-qty');
        const increaseBtn = document.getElementById('increase-qty');
        
        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', () => {
                if (this.quantity > 1) {
                    this.quantity--;
                    this.updateQuantityUI();
                }
            });
        }
        
        if (increaseBtn) {
            increaseBtn.addEventListener('click', () => {
                this.quantity++;
                this.updateQuantityUI();
            });
        }
        
        // Handle color and size selections
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                colorOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
        
        const sizeOptions = document.querySelectorAll('.size-option');
        sizeOptions.forEach(option => {
            option.addEventListener('click', () => {
                sizeOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
        
        // Handle add to cart
        const addToCartBtn = document.getElementById('add-to-cart');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => this.addToCart());
        }
        
        // Handle save/wishlist button
        const saveItemBtn = document.getElementById('save-item');
        if (saveItemBtn) {
            saveItemBtn.addEventListener('click', () => this.toggleSaveItem());
        }
        
        // Handle share button
        const shareItemBtn = document.getElementById('share-item');
        if (shareItemBtn) {
            shareItemBtn.addEventListener('click', () => this.shareProduct());
        }
        
        // Handle tab switching
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all tabs
                tabButtons.forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                // Add active class to selected tab
                button.classList.add('active');
                this.selectedTab = button.dataset.tab;
                const tabContent = document.querySelector(`.${this.selectedTab}-tab`);
                if (tabContent) tabContent.classList.add('active');
            });
        });
        
        // Handle review filtering and sorting
        const ratingFilter = document.getElementById('rating-filter');
        if (ratingFilter) {
            ratingFilter.addEventListener('change', () => {
                this.reviewFilter = ratingFilter.value;
                this.reviewsToShow = 5; // Reset to show the first 5 reviews
                this.updateReviewsList();
            });
        }
        
        const sortSelect = document.getElementById('sort-reviews');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.reviewSort = sortSelect.value;
                this.updateReviewsList();
            });
        }
        
        // Handle load more reviews
        const loadMoreBtn = document.getElementById('load-more-reviews');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.reviewsToShow += 5; // Show 5 more reviews
                this.updateReviewsList();
            });
        }
        
        // Handle like/dislike buttons
        document.querySelectorAll('.like-btn, .dislike-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const reviewId = parseInt(btn.dataset.reviewId);
                const isLike = btn.classList.contains('like-btn');
                this.handleReviewReaction(reviewId, isLike);
            });
        });
        
        // Handle write review button
        const writeReviewBtn = document.getElementById('write-review-btn');
        const reviewModal = document.getElementById('review-modal');
        const closeModal = document.querySelector('.close-modal');
        const cancelReviewBtn = document.querySelector('.cancel-review');
        
        if (writeReviewBtn && reviewModal) {
            writeReviewBtn.addEventListener('click', () => {
                reviewModal.style.display = 'block';
            });
        }
        
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                reviewModal.style.display = 'none';
            });
        }
        
        if (cancelReviewBtn) {
            cancelReviewBtn.addEventListener('click', () => {
                reviewModal.style.display = 'none';
            });
        }
        
        // Handle review form submit
        const reviewForm = document.getElementById('review-form');
        if (reviewForm) {
            reviewForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitReview();
            });
        }
        
        // Handle rating selection in review form
        const ratingInputs = document.querySelectorAll('.rating-input i');
        ratingInputs.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                this.updateRatingSelection(rating);
            });
            
            star.addEventListener('mouseover', () => {
                const rating = parseInt(star.dataset.rating);
                this.highlightRatingStars(rating);
            });
        });
        
        const ratingContainer = document.querySelector('.rating-input');
        if (ratingContainer) {
            ratingContainer.addEventListener('mouseleave', () => {
                this.resetRatingHighlight();
            });
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === reviewModal) {
                reviewModal.style.display = 'none';
            }
        });
    }
    
    updateMainImage() {
        const mainImageElement = document.querySelector('.main-image img');
        if (mainImageElement && this.product.images) {
            mainImageElement.src = this.product.images[this.selectedImageIndex];
        }
    }
    
    updateThumbnails() {
        const thumbnails = document.querySelectorAll('.thumbnail');
        thumbnails.forEach((thumb, index) => {
            if (index === this.selectedImageIndex) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
    }
    
    updateQuantityUI() {
        const quantityElement = document.querySelector('.quantity');
        const decreaseBtn = document.getElementById('decrease-qty');
        
        if (quantityElement) {
            quantityElement.textContent = this.quantity;
        }
        
        if (decreaseBtn) {
            if (this.quantity <= 1) {
                decreaseBtn.setAttribute('disabled', true);
            } else {
                decreaseBtn.removeAttribute('disabled');
            }
        }
    }
    
    updateReviewsList() {
        const reviewsList = document.querySelector('.reviews-list');
        if (reviewsList) {
            reviewsList.innerHTML = this.renderReviews();
            
            // Re-add event listeners to like/dislike buttons
            document.querySelectorAll('.like-btn, .dislike-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const reviewId = parseInt(btn.dataset.reviewId);
                    const isLike = btn.classList.contains('like-btn');
                    this.handleReviewReaction(reviewId, isLike);
                });
            });
            
            // Show/hide load more button
            const loadMoreBtn = document.getElementById('load-more-reviews');
            if (loadMoreBtn) {
                const filteredReviews = this.getFilteredReviews();
                if (this.reviewsToShow >= filteredReviews.length) {
                    loadMoreBtn.parentElement.style.display = 'none';
                } else {
                    loadMoreBtn.parentElement.style.display = 'block';
                }
            }
        }
    }
    
    getFilteredReviews() {
        if (!this.product.reviews) return [];
        
        let filteredReviews = [...this.product.reviews];
        
        if (this.reviewFilter !== 'all') {
            const ratingFilter = parseInt(this.reviewFilter);
            filteredReviews = filteredReviews.filter(review => review.rating === ratingFilter);
        }
        
        return filteredReviews;
    }
    
    addToCart() {
        if (!this.product || !this.product.inStock) return;
        
        try {
            // Get selected options
            const selectedColor = document.querySelector('.color-option.selected')?.dataset.color;
            const selectedSize = document.querySelector('.size-option.selected')?.dataset.size;
            
            // Get existing cart
            const cartJson = localStorage.getItem('cartItems');
            let cart = cartJson ? JSON.parse(cartJson) : [];
            
            // Check if item is already in cart with same options
            const existingItemIndex = cart.findIndex(item => 
                item.id === this.product.id && 
                item.color === selectedColor && 
                item.size === selectedSize
            );
            
            if (existingItemIndex !== -1) {
                // Update quantity of existing item
                cart[existingItemIndex].quantity += this.quantity;
            } else {
                // Add new item to cart
                cart.push({
                    id: this.product.id,
                    name: this.product.name,
                    price: this.product.price,
                    quantity: this.quantity,
                    color: selectedColor,
                    size: selectedSize,
                    image: this.product.images ? this.product.images[0] : this.product.image
                });
            }
            
            // Save to localStorage
            localStorage.setItem('cartItems', JSON.stringify(cart));
            
            // Show notification
            this.showNotification(`Added ${this.quantity} ${this.product.name} to cart!`);
            
            // Update cart badge
            document.dispatchEvent(new CustomEvent('updateCartBadge'));
            
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showNotification('Error adding item to cart', 'error');
        }
    }
    
    toggleSaveItem() {
        try {
            // Get saved items from localStorage
            const savedItemsJson = localStorage.getItem('savedItems');
            let savedItems = savedItemsJson ? JSON.parse(savedItemsJson) : [];
            
            const saveBtn = document.getElementById('save-item');
            
            // Check if already saved
            const isSaved = savedItems.some(item => item.id === this.product.id);
            
            if (isSaved) {
                // Remove from saved items
                savedItems = savedItems.filter(item => item.id !== this.product.id);
                if (saveBtn) {
                    saveBtn.classList.remove('saved');
                    saveBtn.querySelector('i').className = 'bx bx-heart';
                }
                this.showNotification('Item removed from saved items');
            } else {
                // Add to saved items
                savedItems.push({
                    id: this.product.id,
                    name: this.product.name,
                    price: this.product.price,
                    image: this.product.images ? this.product.images[0] : this.product.image,
                    description: this.product.description,
                    rating: this.product.rating,
                    ratingCount: this.product.ratingCount
                });
                
                if (saveBtn) {
                    saveBtn.classList.add('saved');
                    saveBtn.querySelector('i').className = 'bx bxs-heart';
                }
                this.showNotification('Item added to saved items');
            }
            
            // Save to localStorage
            localStorage.setItem('savedItems', JSON.stringify(savedItems));
            
            // Update saved badge
            document.dispatchEvent(new CustomEvent('updateSavedBadge'));
            
        } catch (error) {
            console.error('Error managing saved items:', error);
        }
    }
    
    shareProduct() {
        // Check if Web Share API is available
        if (navigator.share) {
            navigator.share({
                title: this.product.name,
                text: `Check out this amazing ${this.product.name}!`,
                url: window.location.href
            })
            .then(() => console.log('Share successful'))
            .catch((error) => console.log('Error sharing:', error));
        } else {
            // Fallback - copy URL to clipboard
            const dummyInput = document.createElement('input');
            document.body.appendChild(dummyInput);
            dummyInput.value = window.location.href;
            dummyInput.select();
            document.execCommand('copy');
            document.body.removeChild(dummyInput);
            
            this.showNotification('Link copied to clipboard!');
        }
    }
    
    handleReviewReaction(reviewId, isLike) {
        if (!this.product.reviews) return;
        
        const reviewIndex = this.product.reviews.findIndex(review => review.id === reviewId);
        if (reviewIndex === -1) return;
        
        const review = this.product.reviews[reviewIndex];
        
        // Track user interactions in localStorage
        const reactionsKey = `review_reactions_${this.product.id}`;
        let userReactions = localStorage.getItem(reactionsKey);
        userReactions = userReactions ? JSON.parse(userReactions) : {};
        
        // Check previous reaction
        const prevReaction = userReactions[reviewId];
        
        if (isLike) {
            if (prevReaction === 'like') {
                // Unliking a previously liked review
                review.likes--;
                delete userReactions[reviewId];
            } else {
                // Liking a review
                review.likes++;
                if (prevReaction === 'dislike') {
                    review.dislikes--;
                }
                userReactions[reviewId] = 'like';
            }
        } else {
            if (prevReaction === 'dislike') {
                // Undisliking a previously disliked review
                review.dislikes--;
                delete userReactions[reviewId];
            } else {
                // Disliking a review
                review.dislikes++;
                if (prevReaction === 'like') {
                    review.likes--;
                }
                userReactions[reviewId] = 'dislike';
            }
        }
        
        // Save reactions to localStorage
        localStorage.setItem(reactionsKey, JSON.stringify(userReactions));
        
        // Update UI
        this.updateReviewsList();
    }
    
    updateRatingSelection(rating) {
        const ratingStars = document.querySelectorAll('.rating-input i');
        ratingStars.forEach((star, index) => {
            if (index < rating) {
                star.className = 'bx bxs-star';
            } else {
                star.className = 'bx bx-star';
            }
        });
        
        // Store the selected rating
        this.selectedRating = rating;
    }
    
    highlightRatingStars(rating) {
        const ratingStars = document.querySelectorAll('.rating-input i');
        ratingStars.forEach((star, index) => {
            if (index < rating) {
                star.className = 'bx bxs-star';
            } else {
                star.className = 'bx bx-star';
            }
        });
    }
    
    resetRatingHighlight() {
        const ratingStars = document.querySelectorAll('.rating-input i');
        ratingStars.forEach((star, index) => {
            if (this.selectedRating && index < this.selectedRating) {
                star.className = 'bx bxs-star';
            } else {
                star.className = 'bx bx-star';
            }
        });
    }
    
    submitReview() {
        const titleInput = document.getElementById('review-title');
        const contentInput = document.getElementById('review-content');
        
        if (!this.selectedRating || !titleInput.value || !contentInput.value) {
            this.showNotification('Please complete all fields', 'error');
            return;
        }
        
        // Create new review
        const newReview = {
            id: Date.now(), // Generate unique ID
            user: "You", // In a real app, get from user profile
            rating: this.selectedRating,
            date: new Date().toISOString().split('T')[0],
            title: titleInput.value,
            content: contentInput.value,
            likes: 0,
            dislikes: 0,
            userOwned: true
        };
        
        // Add to product reviews
        if (!this.product.reviews) {
            this.product.reviews = [];
        }
        
        this.product.reviews.unshift(newReview);
        
        // Update product rating
        const totalRatings = this.product.reviews.reduce((sum, review) => sum + review.rating, 0);
        this.product.rating = totalRatings / this.product.reviews.length;
        this.product.ratingCount = this.product.reviews.length;
        
        // Close modal and clear form
        document.getElementById('review-modal').style.display = 'none';
        titleInput.value = '';
        contentInput.value = '';
        this.selectedRating = null;
        
        // Show notification
        this.showNotification('Your review has been submitted!');
        
        // Update UI
        this.render();
        this.setupEventListeners();
    }
    
    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class='bx ${type === 'success' ? 'bx-check-circle' : 'bx-error-circle'}'></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Add show class for animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}