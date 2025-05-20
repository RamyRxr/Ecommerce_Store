class ItemDetails {
    constructor() {
        this.container = document.getElementById('product-details-content');
        this.productId = null;
        this.productData = null;
        this.reviews = [];
        this.soldCount = 0;
        this.savedItemIds = new Set();
        this.user = JSON.parse(sessionStorage.getItem('user') || '{}');
        this.init();
    }

    async init() {
        const urlParams = new URLSearchParams(window.location.search);
        this.productId = urlParams.get('id');
        if (!this.productId) {
            this.renderError('Product ID not found.');
            return;
        }
        this.applyInitialDarkMode();
        this.setupEventListeners();
        await this.loadSavedItems();
        await this.loadProductDetails();
    }

    applyInitialDarkMode() {
        const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
        document.body.classList.toggle('dark-mode', darkModeEnabled);
        const darkModeToggle = document.getElementById('dark-mode-toggle-details');
        if (darkModeToggle) {
            const icon = darkModeToggle.querySelector('i');
            if (icon) {
                icon.className = darkModeEnabled ? 'bx bxs-sun' : 'bx bx-moon';
            }
        }
    }

    setupEventListeners() {
        const backButton = document.getElementById('back-button');
        if (backButton) {
            backButton.addEventListener('click', () => window.history.back());
        }
        const darkModeToggle = document.getElementById('dark-mode-toggle-details');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                const darkModeEnabled = document.body.classList.contains('dark-mode');
                localStorage.setItem('darkMode', darkModeEnabled);
                const icon = darkModeToggle.querySelector('i');
                if (icon) {
                    icon.className = darkModeEnabled ? 'bx bxs-sun' : 'bx bx-moon';
                }
            });
        }
    }

    async loadSavedItems() {
        if (!this.user || !this.user.id) return;
        try {
            const response = await fetch('../backend/api/saved/get_saved_items.php');
            if (!response.ok) throw new Error('Failed to fetch saved items');
            const data = await response.json();
            if (data.success && Array.isArray(data.data)) {
                data.data.forEach(item => this.savedItemIds.add(String(item.product_id)));
            }
        } catch (error) {
            // console.error('Error loading saved items:', error);
        }
    }

    async loadProductDetails() {
        if (!this.container) return;
        this.renderLoading();
        try {
            const detailsRes = await fetch(`../backend/api/products/get_product_details.php?id=${this.productId}`);
            if (!detailsRes.ok) {
                throw new Error(`Failed to load product details: ${detailsRes.statusText} (Status: ${detailsRes.status})`);
            }
            const detailsData = await detailsRes.json();
            if (!detailsData.success || !detailsData.product) {
                throw new Error(detailsData.message || 'Product not found.');
            }
            this.productData = detailsData.product;
            if (typeof this.productData.images === 'string') {
                try {
                    this.productData.images = JSON.parse(this.productData.images);
                } catch (e) {
                    this.productData.images = [];
                }
            } else if (!Array.isArray(this.productData.images)) {
                this.productData.images = [];
            }

            const reviewsRes = await fetch(`../backend/api/products/get_product_reviews.php?product_id=${this.productId}`);
            if (reviewsRes.ok) {
                const reviewsData = await reviewsRes.json();
                if (reviewsData.success && Array.isArray(reviewsData.reviews)) {
                    this.reviews = reviewsData.reviews;
                } else {
                    this.reviews = [];
                }
            } else {
                this.reviews = [];
            }

            const soldCountRes = await fetch(`../backend/api/products/get_product_sold_count.php?product_id=${this.productId}`);
            if (soldCountRes.ok) {
                const soldCountData = await soldCountRes.json();
                if (soldCountData.success && soldCountData.sold_count !== undefined) {
                    this.soldCount = parseInt(soldCountData.sold_count, 10) || 0;
                } else {
                    this.soldCount = 0;
                }
            } else {
                this.soldCount = 0;
            }
            this.renderProduct();
        } catch (error) {
            this.renderError(error.message);
        }
    }

    renderLoading() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="item-details-loading">
                <i class='bx bx-loader-alt bx-spin'></i>
                <p>Loading product details...</p>
            </div>
        `;
    }

    renderError(message) {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="item-details-error">
                <i class='bx bx-error-circle'></i>
                <p>${message || 'Could not load product details.'}</p>
                <button onclick="window.location.reload()" class="retry-button">Try Again</button>
            </div>
        `;
    }

    renderProduct() {
        if (!this.container || !this.productData) {
            this.renderError('Product data is not available to render.');
            return;
        }
        const { name, images, rating_avg, review_count, price, description, stock_quantity } = this.productData;
        const processImagePath = (imgPathString) => {
            if (!imgPathString || typeof imgPathString !== 'string') {
                return '../assets/images/general-image/DefaultProduct.png';
            }
            const pathStr = imgPathString.replace(/\\/g, '/').trim();
            if (pathStr.startsWith('http://') || pathStr.startsWith('https://')) {
                return pathStr;
            }
            if (pathStr.startsWith('backend/')) {
                return `../${pathStr}`;
            } else if (pathStr.startsWith('uploads/')) {
                return `../backend/${pathStr}`;
            } else if (pathStr.includes('/')) {
                return `../backend/${pathStr}`;
            } else {
                return `../backend/uploads/products/${pathStr}`;
            }
        };
        const mainImageSrc = Array.isArray(images) && images.length > 0
            ? processImagePath(images[0])
            : '../assets/images/general-image/DefaultProduct.png';
        const allImageSources = Array.isArray(images)
            ? images.map(img => processImagePath(img)).filter(src => src !== '../assets/images/general-image/DefaultProduct.png' || images.length === 1)
            : [];
        const shortDescription = description ? description.split('\n').slice(0, 2).join('\n') + (description.split('\n').length > 2 ? '...' : '') : 'No description available.';
        const isSaved = this.savedItemIds.has(String(this.productId));
        const productHTML = `
            <div class="product-layout">
                <div class="product-images-section">
                    <img src="${mainImageSrc}" alt="${name || 'Product Image'}" id="main-product-image" class="main-product-image">
                    ${allImageSources && allImageSources.length > 1 ? `
                        <div class="thumbnail-images" id="thumbnail-images">
                            ${allImageSources.map((imgSrc, index) => `<img src="${imgSrc}" alt="Thumbnail ${index + 1}" class="thumbnail-img ${index === 0 && imgSrc === mainImageSrc ? 'active' : ''}" data-index="${index}">`).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="product-info-section">
                    <h1 class="product-info-name">${name || 'Product Name'}</h1>
                    <div class="product-stats">
                        <span class="product-rating-display">
                            ${this.renderStars(parseFloat(rating_avg) || 0)}
                        </span>
                        <span class="product-review-count"><i class='bx bx-message-rounded-dots'></i> ${review_count || 0} Reviews</span>
                        <span class="product-sold-count"><i class='bx bx-package'></i> ${this.soldCount} Sold</span>
                    </div>
                    <p class="product-price">${parseFloat(price || 0).toFixed(2)}</p>
                    <p class="product-short-description">${shortDescription}</p>
                    <p class="product-stock ${stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}">
                        ${stock_quantity > 0 ? `${stock_quantity} in stock` : 'Out of Stock'}
                    </p>
                    <div class="product-actions">
                        <button class="product-action-btn add-to-cart-btn-details" id="add-to-cart-btn" ${stock_quantity <= 0 ? 'disabled' : ''}>
                            <i class='bx bx-cart-add'></i> Add to Cart
                        </button>
                        <button class="product-action-btn save-item-btn-details ${isSaved ? 'saved' : ''}" id="save-item-btn">
                            <i class='bx ${isSaved ? 'bxs-heart' : 'bx-heart'}'></i> ${isSaved ? 'Saved' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
            <div class="product-tabs-section">
                <div class="product-tabs-nav">
                    <button class="product-tab-button active" data-tab="description">Description</button>
                    <button class="product-tab-button" data-tab="reviews">Reviews (${this.reviews.length})</button>
                </div>
                <div class="product-tab-content-area">
                    <div id="description-tab-content" class="product-tab-content active">
                        <p class="product-description-full">${description || 'No full description available.'}</p>
                    </div>
                    <div id="reviews-tab-content" class="product-tab-content">
                        ${this.renderReviews()}
                    </div>
                </div>
            </div>
        `;
        this.container.innerHTML = productHTML;
        this.addEventListenersToProductElements();
    }

    renderStars(rating) {
        let starsHTML = '';
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        for (let i = 0; i < fullStars; i++) starsHTML += "<i class='bx bxs-star'></i>";
        if (halfStar) starsHTML += "<i class='bx bxs-star-half'></i>";
        for (let i = 0; i < emptyStars; i++) starsHTML += "<i class='bx bx-star'></i>";
        return starsHTML;
    }

    renderReviews() {
        if (!Array.isArray(this.reviews) || this.reviews.length === 0) {
            return '<p class="no-reviews">No reviews found for this product, or you may need to log in to see reviews.</p>';
        }
        const processAvatarPath = (avatarPathString) => {
            if (!avatarPathString || typeof avatarPathString !== 'string' || avatarPathString.trim() === '') {
                return '../assets/images/general-image/generic-avatar.png';
            }
            const pathStr = avatarPathString.replace(/\\/g, '/').trim();
            if (pathStr.startsWith('http://') || pathStr.startsWith('https://')) return pathStr;
            if (pathStr.startsWith('backend/')) return `../${pathStr}`;
            if (pathStr.startsWith('uploads/users/')) return `../backend/${pathStr}`;
            if (pathStr.startsWith('uploads/')) return `../backend/${pathStr}`;
            return `../backend/uploads/users/${pathStr}`;
        };
        return `
            <div class="product-reviews-list">
                ${this.reviews.map(review => {
            const avatarSrc = processAvatarPath(review.reviewerAvatarUrl);
            const reviewerName = review.reviewerUsername || 'User';
            const reviewDate = review.date;
            const reviewContent = review.reviewText || '';
            const likesCount = review.likes_count || 0;
            const userLikedThisReview = review.currentUserLiked || false;
            return `
                        <div class="review-card" data-review-id="${review.id}">
                            <div class="review-header">
                                <div class="reviewer-info">
                                    <img src="${avatarSrc}" alt="${reviewerName}" class="reviewer-avatar">
                                    <span class="reviewer-name">${reviewerName}</span>
                                </div>
                                <span class="review-date">${reviewDate}</span>
                            </div>
                            <div class="review-rating">
                                ${this.renderStars(parseFloat(review.rating))}
                            </div>
                            <p class="review-text">${reviewContent}</p>
                            <div class="review-footer">
                                <button class="like-review-btn ${userLikedThisReview ? 'liked' : ''}" data-review-id="${review.id}">
                                    <i class='bx ${userLikedThisReview ? 'bxs-like' : 'bx-like'}'></i> 
                                    <span class="like-count">${likesCount}</span>
                                </button>
                            </div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    }

    addEventListenersToProductElements() {
        const thumbnails = document.querySelectorAll('.thumbnail-img');
        const mainImageEl = document.getElementById('main-product-image');
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                if (mainImageEl) mainImageEl.src = thumb.src;
                document.querySelectorAll('.thumbnail-img.active').forEach(activeThumb => activeThumb.classList.remove('active'));
                thumb.classList.add('active');
            });
        });
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => this.handleAddToCart());
        }
        const saveItemBtn = document.getElementById('save-item-btn');
        if (saveItemBtn) {
            saveItemBtn.addEventListener('click', () => this.handleSaveItem());
        }
        const tabButtons = document.querySelectorAll('.product-tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.product-tab-button.active').forEach(activeBtn => activeBtn.classList.remove('active'));
                document.querySelectorAll('.product-tab-content.active').forEach(activeContent => activeContent.classList.remove('active'));
                button.classList.add('active');
                const tabId = button.dataset.tab + '-tab-content';
                const tabContentElement = document.getElementById(tabId);
                if (tabContentElement) {
                    tabContentElement.classList.add('active');
                }
            });
        });
        const reviewList = this.container.querySelector('.product-reviews-list');
        if (reviewList) {
            reviewList.addEventListener('click', (event) => {
                const likeButton = event.target.closest('.like-review-btn');
                if (likeButton) {
                    const reviewId = likeButton.dataset.reviewId;
                    if (reviewId) {
                        this.handleLikeReview(reviewId, likeButton);
                    }
                }
            });
        }
    }

    async handleAddToCart() {
        if (!this.user || !this.user.id) {
            alert('Please log in to add items to your cart.');
            return;
        }
        if (!this.productData || this.productData.stock_quantity <= 0) {
            alert('This item is out of stock.');
            return;
        }
        const btn = document.getElementById('add-to-cart-btn');
        const originalButtonText = btn ? btn.innerHTML : '';
        if (btn) {
            btn.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> Adding...`;
            btn.disabled = true;
        }
        try {
            const response = await fetch('../backend/api/cart/add_to_cart.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: this.productId, quantity: 1 })
            });
            const data = await response.json();
            if (data.success) {
                alert(data.message || 'Item added to cart!');
                document.dispatchEvent(new CustomEvent('updateCartBadge'));
                if (btn) btn.innerHTML = `<i class='bx bx-check'></i> Added!`;
                setTimeout(() => {
                    if (btn) btn.innerHTML = originalButtonText;
                }, 2000);
            } else {
                alert(data.message || 'Failed to add item to cart.');
                if (btn) btn.innerHTML = originalButtonText;
            }
        } catch (error) {
            alert('An error occurred while adding to cart.');
            if (btn) btn.innerHTML = originalButtonText;
        } finally {
            if (btn && !btn.innerHTML.includes('Added!')) {
                btn.disabled = this.productData.stock_quantity <= 0;
            } else if (btn && btn.innerHTML.includes('Added!')) {
                setTimeout(() => {
                    if (btn) btn.disabled = this.productData.stock_quantity <= 0;
                }, 2000);
            }
        }
    }

    async handleSaveItem() {
        if (!this.user || !this.user.id) {
            alert('Please log in to save items.');
            return;
        }
        const btn = document.getElementById('save-item-btn');
        const isCurrentlySaved = this.savedItemIds.has(String(this.productId));
        const action = isCurrentlySaved ? 'remove' : 'add';
        if (btn) {
            if (isCurrentlySaved) {
                this.savedItemIds.delete(String(this.productId));
                btn.classList.remove('saved');
                btn.innerHTML = `<i class='bx bx-heart'></i> Save`;
            } else {
                this.savedItemIds.add(String(this.productId));
                btn.classList.add('saved');
                btn.innerHTML = `<i class='bx bxs-heart'></i> Saved`;
            }
        }
        document.dispatchEvent(new CustomEvent('updateSavedBadge'));
        try {
            const response = await fetch(`../backend/api/saved/add_to_saved.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: this.productId, action: action })
            });
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Failed to update saved state on server.');
            }
        } catch (error) {
            if (btn) {
                if (isCurrentlySaved) {
                    this.savedItemIds.add(String(this.productId));
                    btn.classList.add('saved');
                    btn.innerHTML = `<i class='bx bxs-heart'></i> Saved`;
                } else {
                    this.savedItemIds.delete(String(this.productId));
                    btn.classList.remove('saved');
                    btn.innerHTML = `<i class='bx bx-heart'></i> Save`;
                }
            }
            document.dispatchEvent(new CustomEvent('updateSavedBadge'));
            alert(error.message || 'An error occurred while saving the item.');
        }
    }

    async handleLikeReview(reviewId, buttonElement) {
        if (!this.user || !this.user.id) {
            alert('Please log in to like reviews.');
            return;
        }
        const icon = buttonElement.querySelector('i');
        const countSpan = buttonElement.querySelector('.like-count');
        let currentLikes = parseInt(countSpan.textContent);
        let currentlyLiked = buttonElement.classList.contains('liked');
        if (currentlyLiked) {
            buttonElement.classList.remove('liked');
            icon.className = 'bx bx-like';
            countSpan.textContent = Math.max(0, currentLikes - 1);
        } else {
            buttonElement.classList.add('liked');
            icon.className = 'bx bxs-like';
            countSpan.textContent = currentLikes + 1;
        }
        try {
            const response = await fetch('../backend/api/products/like_review.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ review_id: reviewId })
            });
            const data = await response.json();
            if (data.success) {
                buttonElement.classList.toggle('liked', data.currentUserLiked);
                icon.className = data.currentUserLiked ? 'bx bxs-like' : 'bx bx-like';
                countSpan.textContent = data.likes_count;
                const reviewIndex = this.reviews.findIndex(r => String(r.id) === String(reviewId));
                if (reviewIndex > -1) {
                    this.reviews[reviewIndex].likes_count = data.likes_count;
                    this.reviews[reviewIndex].currentUserLiked = data.currentUserLiked;
                }
            } else {
                alert(data.message || 'Failed to update like.');
                if (currentlyLiked) {
                    buttonElement.classList.add('liked');
                    icon.className = 'bx bxs-like';
                    countSpan.textContent = currentLikes;
                } else {
                    buttonElement.classList.remove('liked');
                    icon.className = 'bx bx-like';
                    countSpan.textContent = currentLikes;
                }
            }
        } catch (error) {
            alert('An error occurred.');
            if (currentlyLiked) {
                buttonElement.classList.add('liked');
                icon.className = 'bx bxs-like';
                countSpan.textContent = currentLikes;
            } else {
                buttonElement.classList.remove('liked');
                icon.className = 'bx bx-like';
                countSpan.textContent = currentLikes;
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ItemDetails();
});