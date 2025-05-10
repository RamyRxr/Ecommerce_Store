export default class Profile {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.activeTab = 'reviews'; 

        const sessionUser = JSON.parse(sessionStorage.getItem('user') || '{}');
        this.currentUser = {
            id: sessionUser.id,
            isAdmin: Boolean(sessionUser.is_admin),
            username: sessionUser.username
        };

        this.userData = {}; 
        this.userStats = {}; 
        this.adminStats = {}; 
        this.reviewsData = []; 

        this.activityData = {
            savedItems: {
                icon: 'bx-bookmark',
                title: 'Saved Items',
                link: '../HTML-Pages/SavedPage.html', 
                count: 0
            },
            orders: {
                icon: 'bx-package',
                title: 'Orders',
                link: '../HTML-Pages/HistoryPage.html',
                count: 0
            },
            listedItems: { 
                icon: 'bx-store',
                title: 'Listed Items',
                link: '../HTML-Pages/SellingPage.html', 
                count: 0
            },
            reviews: { 
                icon: 'bx-star',
                title: 'Reviews',
                link: '#', 
                count: 0
            }
        };

        this.currentEditReviewId = null;
        this.currentEditRating = 0;

        this.createNotificationContainer();
        this.loadProfileData(); 
    }

    async loadProfileData() {
        if (!this.currentUser.id) {
            console.error('User ID not found. Cannot load profile data.');
            this.render(); 
            return;
        }

        try {
            const profileResponse = await fetch(`../backend/api/profile/get_user_profile.php`);
            const profileData = await profileResponse.json();

            if (profileData.success) {
                this.userData = profileData.userData;
                this.userStats = profileData.userStats;
                if (this.currentUser.isAdmin && profileData.adminStats) {
                    this.adminStats = profileData.adminStats;
                }

                this.activityData.orders.count = this.userStats.ordersCount || 0;
                this.activityData.reviews.count = this.userStats.reviewsCount || 0;

                if (this.currentUser.isAdmin) {
                    this.activityData.listedItems.count = this.adminStats.totalListedItemsCount || 0;
                    this.activityData.orders.count = this.adminStats.totalOrdersCount || 0;
                    this.activityData.reviews.count = this.adminStats.totalReviewsCount || 0;
                } else {
                    this.activityData.savedItems.count = this.userStats.savedItemsCount || 0;
                }

            } else {
                throw new Error(profileData.message || 'Failed to load profile data');
            }

            const reviewsResponse = await fetch(`../backend/api/profile/get_reviews.php`);
            const reviewsResult = await reviewsResponse.json();

            if (reviewsResult.success) {
                this.reviewsData = reviewsResult.reviews;
            } else {
                throw new Error(reviewsResult.message || 'Failed to load reviews');
            }

        } catch (error) {
            console.error('Error loading profile data:', error);
            this.userData = { name: 'Error', email: 'Could not load data', image: '../assets/images/general-image/RamyRxr.png', address: '', memberSince: '', joinDate: '' };
            this.reviewsData = [];
        } finally {
            this.render();
            this.setupEventListeners(); 
        }
    }

    createNotificationContainer() {
        const existingContainer = document.querySelector('.global-notification-container');
        if (existingContainer) return;

        const container = document.createElement('div');
        container.className = 'notification-container global-notification-container';
        document.body.appendChild(container);
    }
    
    getDisplayImageUrl(imagePathFromPHP) {
        if (!imagePathFromPHP) {
            return '../assets/images/general-image/RamyRxr.png'; 
        }

        if (imagePathFromPHP.startsWith('../assets/') || imagePathFromPHP.startsWith('../backend/')) {
            return imagePathFromPHP;
        }

        if (imagePathFromPHP.includes('uploads/')) { 
            return '../' + imagePathFromPHP; 
        } 
        else { 
            return '../backend/uploads/products/' + imagePathFromPHP;
        }
    }

    render() {
        if (!this.userData || !this.currentUser) { 
            this.container.innerHTML = `<div class="loading-profile">Loading profile...</div>`;
            return;
        }
        const profileHTML = `
            <div class="profile-component">
                <div class="profile-page-container">
                    <div class="profile-header">
                        <h1>My Profile</h1>
                    </div>
                    
                    <div class="profile-content">
                        <div class="profile-sidebar">
                            <div class="user-info-card">
                                <div class="user-avatar">
                                    <img src="${this.getDisplayImageUrl(this.userData.image) || '../assets/images/general-image/RamyRxr.png'}" alt="${this.userData.name || 'User'}">
                                </div>
                                
                                <h2 class="user-name">${this.userData.name || this.currentUser.username || 'User'}</h2>
                                
                                <div class="user-location">
                                    <i class='bx bx-map'></i>
                                    <span>${this.userData.address || 'Location not set'}</span>
                                </div>
                                
                                <div class="user-member-since">
                                    Member since ${this.userData.memberSince || 'N/A'}
                                </div>
                                
                                <a href="../HTML-Pages/SettingsPage.html" class="edit-profile-btn">
                                    <i class='bx bx-edit'></i>
                                    Edit Profile
                                </a>
                                
                                <div class="user-stats">
                                    ${this.renderUserStats()}
                                </div>
                            </div>
                        </div>
                        
                        <div class="profile-main">
                            <div class="profile-tabs">
                                <button class="tab-btn ${this.activeTab === 'reviews' ? 'active' : ''}" data-tab="reviews">
                                    <i class='bx bx-star'></i> Reviews
                                </button>
                                <button class="tab-btn ${this.activeTab === 'activity' ? 'active' : ''}" data-tab="activity">
                                    <i class='bx bx-history'></i> Activity
                                </button>
                            </div>
                            
                            <div class="tab-content">
                                ${this.activeTab === 'reviews' ? this.renderReviewsTab() : this.renderActivityTab()}
                            </div>
                        </div>
                    </div>
                </div>
                
                ${this.renderEditModal()}
            </div>
        `;

        if (document.querySelector('.profile-component')) {
            document.querySelector('.profile-component').outerHTML = profileHTML;
        } else {
            this.container.insertAdjacentHTML('beforeend', profileHTML);
        }
    }

    renderUserStats() {
        let statsHTML = `
            <div class="stat-item">
                <i class='bx bx-envelope'></i>
                <div class="stat-value">${this.userData.email || 'N/A'}</div>
            </div>
            <div class="stat-item">
                <i class='bx bx-calendar-check'></i>
                <div class="stat-value">Joined on ${this.userData.joinDate || 'N/A'}</div>
            </div>
        `;
        if (this.currentUser.isAdmin) {
            statsHTML += `
                <div class="stat-item">
                    <i class='bx bx-package'></i>
                    <div class="stat-value" data-stats="orders-count">${this.adminStats.totalOrdersCount || 0} total orders</div>
                </div>
                <div class="stat-item">
                    <i class='bx bx-store'></i>
                    <div class="stat-value" data-stats="listed-count">${this.adminStats.totalListedItemsCount || 0} total listed items</div>
                </div>
                <div class="stat-item">
                    <i class='bx bx-star'></i>
                    <div class="stat-value" data-stats="reviews-count">${this.adminStats.totalReviewsCount || 0} total reviews</div>
                </div>
            `;
        } else {
            statsHTML += `
                <div class="stat-item">
                    <i class='bx bx-package'></i>
                    <div class="stat-value" data-stats="orders-count">${this.userStats.ordersCount || 0} orders</div>
                </div>
                <div class="stat-item">
                    <i class='bx bx-star'></i>
                    <div class="stat-value" data-stats="reviews-count">${this.userStats.reviewsCount || 0} reviews</div>
                </div>
            `;
        }
        return statsHTML;
    }

    renderReviewsTab() {
        if (!this.reviewsData || this.reviewsData.length === 0) {
            const message = this.currentUser.isAdmin 
                ? "No reviews found across all users." 
                : "You haven't written any reviews yet. Your product reviews will appear here once you share your thoughts.";
            const actionText = this.currentUser.isAdmin ? "View All Products" : "Browse Products";

            return `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class='bx bx-star'></i>
                    </div>
                    <h3 class="empty-state-title">No Reviews Yet</h3>
                    <p class="empty-state-message">${message}</p>
                    <a href="../HTML-Pages/HomePage.html" class="empty-state-action">
                        <i class='bx bx-shopping-bag'></i>
                        ${actionText}
                    </a>
                </div>
            `;
        }

        const reviewsHTML = this.reviewsData.map(review => {
            const stars = Array(5).fill(0).map((_, i) =>
                i < review.rating
                    ? '<i class="bx bxs-star"></i>'
                    : '<i class="bx bx-star"></i>'
            ).join('');

            const displayImageSrc = this.getDisplayImageUrl(review.productImage);
            
            const likesCount = review.likes_count || 0;
            const currentUserLikedThisReview = review.currentUserLiked || false;
            const likeIconClass = currentUserLikedThisReview ? 'bxs-like' : 'bx-like';

            // Determine if the current user is the author of the review
            const isOwnReview = this.currentUser.id === review.userId;

            return `
                <div class="review-item" data-id="${review.id}">
                    <div class="review-item-header">
                        <div class="product-image">
                            <img src="${displayImageSrc}" alt="${review.productName || 'Product'}">
                        </div>
                        <div class="review-details">
                            <h3 class="product-name">${review.productName || 'N/A'}</h3>
                            <div class="rating-date">
                                <div class="stars">${stars}</div>
                                <div class="review-date">${review.date}</div>
                            </div>
                            ${this.currentUser.isAdmin && review.reviewerUsername ? `<div class="reviewer-info-admin">Reviewed by: <strong>${review.reviewerUsername}</strong></div>` : ''}
                        </div>
                    </div>
                    
                    <div class="review-text">
                        <p class="review-content">${review.reviewText || 'No review text.'}</p>
                    </div>
                    
                    <div class="review-actions">
                        <div class="likes-display">
                            <i class='bx ${likeIconClass}'></i>
                            <span>${likesCount} ${likesCount === 1 ? 'Like' : 'Likes'}</span>
                        </div>
                        <div class="action-buttons">
                            <button class="view-product-btn" data-product-id="${review.productId}">
                                <i class='bx bx-link-external'></i>
                                View Product
                            </button>
                            ${isOwnReview || this.currentUser.isAdmin ? `
                            <button class="edit-review-btn" data-review-id="${review.id}">
                                <i class='bx bx-edit'></i>
                                Edit
                            </button>
                            <button class="delete-review-btn" data-review-id="${review.id}">
                                <i class='bx bx-trash'></i>
                                Delete
                            </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="reviews-container">
                ${reviewsHTML}
            </div>
        `;
    }

    renderActivityTab() {
        let activityItemsHTML = '';

        if (this.currentUser.isAdmin) {
            activityItemsHTML = `
                ${this.renderActivityItem(this.activityData.orders)}
                ${this.renderActivityItem(this.activityData.listedItems)}
                ${this.renderActivityItem(this.activityData.reviews, 'reviews')}
            `;
        } else {
            activityItemsHTML = `
                ${this.renderActivityItem(this.activityData.savedItems)}
                ${this.renderActivityItem(this.activityData.orders)}
                ${this.renderActivityItem(this.activityData.reviews, 'reviews')}
            `;
        }
        return `<div class="activity-container">${activityItemsHTML}</div>`;
    }

    renderActivityItem(item, tabTarget = null) {
        const link = tabTarget === 'reviews' ? '#' : item.link;
        const dataTabAttr = tabTarget === 'reviews' ? `data-tab-target="reviews"` : '';
        const itemClass = tabTarget === 'reviews' ? 'activity-item activity-reviews-link' : 'activity-item';

        return `
            <a href="${link}" class="${itemClass}" ${dataTabAttr}>
                <div class="activity-icon" style="${this.getActivityItemGradient(item.icon)}">
                    <i class='bx ${item.icon}'></i>
                </div>
                <div class="activity-info">
                    <div class="activity-title">${item.title}</div>
                    <div class="activity-count">${item.count} ${item.title.includes("Saved") || item.title.includes("Listed") ? "items" : item.title.toLowerCase()}</div>
                </div>
            </a>
        `;
    }

    getActivityItemGradient(icon) {
        if (icon.includes('bookmark') || icon.includes('heart')) return 'background: linear-gradient(135deg, #9c27b0, #6a0080);'; 
        if (icon.includes('package') || icon.includes('history')) return 'background: linear-gradient(135deg, #4caf50, #2e7d32);'; 
        if (icon.includes('store')) return 'background: linear-gradient(135deg, #ff9800, #e65100);'; 
        if (icon.includes('star')) return 'background: linear-gradient(135deg, #2196f3, #0d47a1);'; 
        return 'background: linear-gradient(135deg, #757575, #424242);'; 
    }


    renderEditModal() {
        return `
            <div class="edit-modal-backdrop">
                <div class="edit-review-modal">
                    <div class="modal-header">
                        <h3>Edit Your Review</h3>
                        <button class="close-modal-btn">
                            <i class='bx bx-x'></i>
                        </button>
                    </div>
                    
                    <div class="edit-product-info">
                        <div class="edit-product-image">
                            <img id="modal-product-image" src="" alt="">
                        </div>
                        <div>
                            <h4 class="edit-product-name" id="modal-product-name"></h4>
                            <div class="edit-review-date" id="modal-review-date"></div>
                        </div>
                    </div>
                    
                    <div class="edit-rating">
                        <h4>Your Rating :</h4>
                        <div class="star-rating">
                            <button class="star-btn" data-rating="1">
                                <i class='bx bxs-star'></i>
                            </button>
                            <button class="star-btn" data-rating="2">
                                <i class='bx bxs-star'></i>
                            </button>
                            <button class="star-btn" data-rating="3">
                                <i class='bx bxs-star'></i>
                            </button>
                            <button class="star-btn" data-rating="4">
                                <i class='bx bxs-star'></i>
                            </button>
                            <button class="star-btn" data-rating="5">
                                <i class='bx bxs-star'></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="edit-review-text">
                        <h4>Your Review :</h4>
                        <textarea id="edit-review-textarea" placeholder="Write your review here..."></textarea>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="discard-btn">Discard</button>
                        <button class="save-btn">Save Changes</button>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        document.removeEventListener('click', this.handleDocumentClick); 
        this.handleDocumentClick = this.handleDocumentClick.bind(this); 
        document.addEventListener('click', this.handleDocumentClick);

        const editModalBackdrop = document.querySelector('.edit-modal-backdrop');
        if (editModalBackdrop) {
            editModalBackdrop.removeEventListener('click', this.handleModalBackdropClick);
            this.handleModalBackdropClick = this.handleModalBackdropClick.bind(this);
            editModalBackdrop.addEventListener('click', this.handleModalBackdropClick);
        }
    }

    handleModalBackdropClick(e) {
        if (e.target === e.currentTarget) { 
            this.closeEditModal();
        }
    }


    handleDocumentClick(e) {
        const tabBtn = e.target.closest('.tab-btn');
        if (tabBtn) {
            this.activeTab = tabBtn.dataset.tab;
            this.render();
            this.setupEventListeners(); 
            return;
        }

        const activityReviewsLink = e.target.closest('.activity-reviews-link');
        if (activityReviewsLink) {
            e.preventDefault();
            this.activeTab = 'reviews';
            this.render();
            this.setupEventListeners();
            return;
        }

        const reviewItem = e.target.closest('.review-item');
        const actionBtn = e.target.closest('button'); 
        if (reviewItem && !actionBtn && !e.target.closest('.action-buttons')) { 
            reviewItem.classList.toggle('expanded');
            return;
        }

        const viewProductBtn = e.target.closest('.view-product-btn');
        if (viewProductBtn) {
            const productId = viewProductBtn.dataset.productId;
            window.location.href = `../HTML-Pages/ProductPage.html?id=${productId}`;
            return;
        }

        const editReviewBtn = e.target.closest('.edit-review-btn');
        if (editReviewBtn) {
            const reviewId = parseInt(editReviewBtn.dataset.reviewId);
            this.openEditModal(reviewId);
            return;
        }

        const deleteReviewBtn = e.target.closest('.delete-review-btn');
        if (deleteReviewBtn) {
            const reviewId = parseInt(deleteReviewBtn.dataset.reviewId);
            this.deleteReview(reviewId);
            return;
        }

        const closeModalBtn = e.target.closest('.close-modal-btn');
        if (closeModalBtn) {
            this.closeEditModal();
            return;
        }

        const discardBtn = e.target.closest('.discard-btn');
        if (discardBtn) {
            this.closeEditModal();
            return;
        }

        const saveBtn = e.target.closest('.save-btn');
        if (saveBtn) {
            this.saveReviewChanges();
            return;
        }

        const starBtn = e.target.closest('.star-btn');
        if (starBtn) {
            const rating = parseInt(starBtn.dataset.rating);
            this.updateStarRating(rating);
            return;
        }

        const closeNotificationBtn = e.target.closest('.close-notification-btn');
        if (closeNotificationBtn) {
            const notification = closeNotificationBtn.closest('.notification');
            if (notification) {
                notification.remove(); 
            }
            return;
        }
    }


    openEditModal(reviewId) {
        const review = this.reviewsData.find(r => r.id === reviewId);
        if (!review) return;

        this.currentEditReviewId = reviewId;

        const modal = document.querySelector('.edit-modal-backdrop');
        const productNameEl = document.getElementById('modal-product-name');
        const reviewDateEl = document.getElementById('modal-review-date');
        const productImageEl = document.getElementById('modal-product-image');
        const textareaEl = document.getElementById('edit-review-textarea');

        productNameEl.textContent = review.productName;
        reviewDateEl.textContent = `Reviewed on ${review.date}`;  
        productImageEl.src = this.getDisplayImageUrl(review.productImage);
        productImageEl.alt = review.productName;
        textareaEl.value = review.reviewText;

        this.updateStarRating(review.rating);

        modal.classList.add('active');
    }

    closeEditModal() {
        const modal = document.querySelector('.edit-modal-backdrop');
        modal.classList.remove('active');
        this.currentEditReviewId = null;
    }

    updateStarRating(rating) {
        const starBtns = document.querySelectorAll('.star-btn');

        starBtns.forEach((btn, index) => {
            const btnRating = parseInt(btn.dataset.rating);

            if (btnRating <= rating) {
                btn.classList.add('active');
                btn.querySelector('i').className = 'bx bxs-star';
            } else {
                btn.classList.remove('active');
                btn.querySelector('i').className = 'bx bx-star';
            }
        });

        this.currentEditRating = rating;
    }

    async saveReviewChanges() {
        if (!this.currentEditReviewId) return;

        const textareaEl = document.getElementById('edit-review-textarea');
        const newReviewText = textareaEl.value.trim();
        const newRating = this.currentEditRating;

        if (!newReviewText) {
            alert('Please enter a review text');
            return;
        }

        try {
            const response = await fetch('../backend/api/profile/update_review.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    review_id: this.currentEditReviewId,
                    rating: newRating,
                    review_text: newReviewText
                })
            });
            const result = await response.json();

            if (result.success) {
                this.showEditSuccessNotification(result.productName || 'Selected Product'); 
                this.closeEditModal();
                await this.loadProfileData(); 
            } else {
                throw new Error(result.message || 'Failed to save review');
            }
        } catch (error) {
            console.error('Error saving review:', error);
            alert(`Error: ${error.message}`);
        }
    }

    showEditSuccessNotification(productName) {
        const notificationContainer = document.querySelector('.global-notification-container');
        if (!notificationContainer) return;

        const notification = document.createElement('div');
        notification.className = 'notification fade-in';

        notification.innerHTML = `
            <div class="notification-content">
                <i class='bx bx-check-circle notification-icon'></i>
                <div class="notification-text">
                    <p>Your review for "${productName}" has been updated.</p>
                </div>
                <button class="close-notification-btn">
                    <i class='bx bx-x'></i>
                </button>
            </div>
        `;

        notificationContainer.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('fade-in');
            notification.classList.add('fade-out');

            setTimeout(() => {
                if (notification && notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    async deleteReview(reviewId) {
        if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch('../backend/api/profile/delete_review.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ review_id: reviewId })
            });
            const result = await response.json();

            if (result.success) {
                const notificationContainer = document.querySelector('.global-notification-container');
                if (notificationContainer) {
                    const notification = document.createElement('div');
                    notification.className = 'notification fade-in';
                    notification.innerHTML = `
                        <div class="notification-content">
                            <i class='bx bx-check-circle notification-icon'></i>
                            <div class="notification-text"><p>Review deleted successfully.</p></div>
                            <button class="close-notification-btn"><i class='bx bx-x'></i></button>
                        </div>`;
                    notificationContainer.appendChild(notification);
                    setTimeout(() => {
                        notification.classList.remove('fade-in');
                        notification.classList.add('fade-out');
                        setTimeout(() => notification.remove(), 300);
                    }, 3000);
                }
                await this.loadProfileData(); 
            } else {
                throw new Error(result.message || 'Failed to delete review');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            alert(`Error: ${error.message}`);
        }
    }
}