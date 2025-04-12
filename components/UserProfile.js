export default class UserProfile {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.userData = {
            name: 'John Doe',
            image: '../assets/images/profile.jpg',
            address: 'New York City, USA',
            memberSince: 'April 2021',
            email: 'john.doe@example.com',
            joinDate: 'April 15, 2021',
            ordersPlaced: 42,
            totalReviews: 18,
            verified: true
        };
        this.activeTab = 'reviews'; // Default tab
        this.reviewsData = [
            {
                id: 1,
                productName: 'Sony WH-1000XM4 Wireless Headphones',
                productImage: '../assets/images/products/headphones.jpg',
                rating: 5,
                date: 'March 10, 2025',
                reviewText: 'These headphones are amazing! The noise cancellation is top-notch, and the sound quality is incredible. Battery life is also excellent - I can use them for an entire workday without recharging. Highly recommended for anyone who works in a noisy environment or travels frequently.',
                helpful: 24,
                verified: true
            },
            {
                id: 2,
                productName: 'Samsung Galaxy S22 Ultra',
                productImage: '../assets/images/products/galaxy.jpg',
                rating: 4,
                date: 'February 22, 2025',
                reviewText: 'Great phone with an excellent camera system. The S-Pen functionality is a nice bonus, but I do wish the battery life was a bit better. Still, it handles everything I throw at it with ease.',
                helpful: 18,
                verified: true
            },
            {
                id: 3,
                productName: 'Apple MacBook Pro M2',
                productImage: '../assets/images/products/macbook.jpg',
                rating: 5,
                date: 'January 15, 2025',
                reviewText: 'The M2 MacBook Pro is incredibly fast and efficient. I can run multiple design applications simultaneously without any lag. The battery life is outstanding - I can work an entire day without plugging in. The display is also gorgeous with accurate colors. Definitely worth the investment for creative professionals.',
                helpful: 35,
                verified: true
            },
            {
                id: 4,
                productName: 'Dell XPS 15 Laptop',
                productImage: '../assets/images/products/dell.jpg',
                rating: 3,
                date: 'December 5, 2024',
                reviewText: 'The Dell XPS 15 has a beautiful display and great build quality. However, I\'ve had some issues with the cooling system when running intensive applications. The fan noise can get quite loud during heavy workloads. Otherwise, it\'s a solid laptop for everyday use.',
                helpful: 12,
                verified: true
            }
        ];
        
        this.init();
    }
    
    init() {
        this.render();
        this.setupEventListeners();
    }
    
    render() {
        const profileHTML = `
            <div class="profile-content">
                <div class="main-content-container">
                    <div class="profile-header">
                        <h1>My Profile</h1>
                    </div>
                    
                    <div class="profile-main">
                        <div class="profile-info-card">
                            <div class="profile-image">
                                ${this.userData.verified ? '<div class="verified-badge"><i class="bx bxs-check-circle"></i></div>' : ''}
                                <img src="${this.userData.image}" alt="${this.userData.name}">
                            </div>
                            <h2 class="profile-name">${this.userData.name}</h2>
                            <div class="profile-location">
                                <i class='bx bx-map'></i>
                                <span>${this.userData.address}</span>
                            </div>
                            <div class="profile-member-since">
                                <span>Member since ${this.userData.memberSince}</span>
                            </div>
                            <a href="SettingsPage.html" class="edit-profile-btn">
                                <i class='bx bx-edit'></i>
                                Edit Profile
                            </a>
                            
                            <div class="profile-stats">
                                <div class="stat">
                                    <div class="stat-label">Email</div>
                                    <div class="stat-value">${this.userData.email}</div>
                                </div>
                                <div class="stat">
                                    <div class="stat-label">Joined</div>
                                    <div class="stat-value">${this.userData.joinDate}</div>
                                </div>
                                <div class="stat">
                                    <div class="stat-label">Orders</div>
                                    <div class="stat-value">${this.userData.ordersPlaced}</div>
                                </div>
                                <div class="stat">
                                    <div class="stat-label">Reviews</div>
                                    <div class="stat-value">${this.userData.totalReviews}</div>
                                </div>
                            </div>
                            
                            <div class="profile-quick-actions">
                                <a href="OrderHistoryPage.html" class="quick-action-btn">
                                    <i class='bx bx-package'></i>
                                    Recent Orders
                                </a>
                                <a href="SellingPage.html" class="quick-action-btn">
                                    <i class='bx bx-store'></i>
                                    Selling
                                </a>
                                <a href="SavedItemsPage.html" class="quick-action-btn">
                                    <i class='bx bx-bookmark'></i>
                                    Saved
                                </a>
                                <a href="CartPage.html" class="quick-action-btn">
                                    <i class='bx bx-cart'></i>
                                    Cart
                                </a>
                            </div>
                        </div>
                        
                        <div class="profile-content-section">
                            <div class="profile-tabs">
                                <button class="tab-button ${this.activeTab === 'reviews' ? 'active' : ''}" data-tab="reviews">
                                    <i class='bx bx-star'></i>
                                    <span>My Reviews</span>
                                </button>
                                <button class="tab-button ${this.activeTab === 'activity' ? 'active' : ''}" data-tab="activity">
                                    <i class='bx bx-history'></i>
                                    <span>Activity</span>
                                </button>
                            </div>
                            
                            <div class="profile-tab-content">
                                ${this.renderTabContent()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const profileContainer = document.createElement('div');
        profileContainer.innerHTML = profileHTML;
        
        const existingProfile = document.querySelector('.profile-content');
        if (existingProfile) {
            existingProfile.replaceWith(profileContainer.firstElementChild);
        } else {
            this.container.appendChild(profileContainer.firstElementChild);
        }
    }
    
    renderTabContent() {
        switch (this.activeTab) {
            case 'reviews':
                return this.renderReviewsTab();
            case 'activity':
                return this.renderActivityTab();
            default:
                return this.renderReviewsTab();
        }
    }
    
    renderReviewsTab() {
        if (this.reviewsData.length === 0) {
            return `
                <div class="no-content">
                    <i class='bx bx-star empty-icon'></i>
                    <h3>No reviews yet</h3>
                    <p>You haven't written any reviews yet. When you do, they'll appear here.</p>
                </div>
            `;
        }
        
        const reviewsHTML = this.reviewsData.map(review => {
            // Generate stars based on rating
            const stars = Array(5).fill(0).map((_, i) => 
                i < review.rating 
                    ? '<i class="bx bxs-star"></i>' 
                    : '<i class="bx bx-star"></i>'
            ).join('');
            
            return `
                <div class="review-card" data-id="${review.id}">
                    <div class="review-product">
                        <div class="product-image">
                            <img src="${review.productImage}" alt="${review.productName}">
                        </div>
                        <div class="product-info">
                            <div class="product-name">${review.productName}</div>
                            <div class="review-date">${review.date}</div>
                        </div>
                    </div>
                    <div class="review-rating">
                        <div class="stars">
                            ${stars}
                        </div>
                        ${review.verified ? '<span class="verified-purchase">Verified Purchase</span>' : ''}
                    </div>
                    <div class="review-text">
                        <p class="review-content">${review.reviewText}</p>
                        <button class="read-more-btn">Read more</button>
                    </div>
                    <div class="review-actions">
                        <div class="helpful-count">
                            <i class='bx bx-like'></i>
                            <span>${review.helpful} people found this helpful</span>
                        </div>
                        <div class="action-buttons">
                            <button class="edit-review-btn">
                                <i class='bx bx-edit'></i>
                                Edit
                            </button>
                            <button class="delete-review-btn">
                                <i class='bx bx-trash'></i>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        return `
            <div class="reviews-container">
                <div class="reviews-header">
                    <h2>My Reviews</h2>
                    <span class="reviews-count">(${this.reviewsData.length})</span>
                </div>
                
                <div class="reviews-list">
                    ${reviewsHTML}
                </div>
            </div>
        `;
    }
    
    renderActivityTab() {
        return `
            <div class="activity-container">
                <div class="activity-header">
                    <h2>Recent Activity</h2>
                </div>
                
                <div class="activity-timeline">
                    <div class="activity-item">
                        <div class="activity-icon order-icon">
                            <i class='bx bx-package'></i>
                        </div>
                        <div class="activity-details">
                            <div class="activity-title">Order Placed</div>
                            <div class="activity-description">You ordered Samsung Galaxy S22 Ultra</div>
                            <div class="activity-time">2 days ago</div>
                        </div>
                    </div>
                    
                    <div class="activity-item">
                        <div class="activity-icon review-icon">
                            <i class='bx bx-star'></i>
                        </div>
                        <div class="activity-details">
                            <div class="activity-title">Review Posted</div>
                            <div class="activity-description">You wrote a review for Sony WH-1000XM4</div>
                            <div class="activity-time">1 week ago</div>
                        </div>
                    </div>
                    
                    <div class="activity-item">
                        <div class="activity-icon delivery-icon">
                            <i class='bx bx-check-circle'></i>
                        </div>
                        <div class="activity-details">
                            <div class="activity-title">Order Delivered</div>
                            <div class="activity-description">Your order #TEC5721 has been delivered</div>
                            <div class="activity-time">1 week ago</div>
                        </div>
                    </div>
                    
                    <div class="activity-item">
                        <div class="activity-icon save-icon">
                            <i class='bx bx-bookmark'></i>
                        </div>
                        <div class="activity-details">
                            <div class="activity-title">Item Saved</div>
                            <div class="activity-description">You saved Apple MacBook Pro M2 to your wishlist</div>
                            <div class="activity-time">2 weeks ago</div>
                        </div>
                    </div>
                    
                    <div class="activity-item">
                        <div class="activity-icon shipping-icon">
                            <i class='bx bx-car'></i>
                        </div>
                        <div class="activity-details">
                            <div class="activity-title">Order Shipped</div>
                            <div class="activity-description">Your order #TEC5721 has been shipped</div>
                            <div class="activity-time">2 weeks ago</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    setupEventListeners() {
        // Tab switching
        document.addEventListener('click', e => {
            const tabButton = e.target.closest('.tab-button');
            if (tabButton) {
                this.activeTab = tabButton.dataset.tab;
                this.render();
            }
            
            // Read more button
            const readMoreBtn = e.target.closest('.read-more-btn');
            if (readMoreBtn) {
                const reviewText = readMoreBtn.parentElement;
                const reviewContent = reviewText.querySelector('.review-content');
                
                if (reviewText.classList.contains('expanded')) {
                    reviewText.classList.remove('expanded');
                    readMoreBtn.textContent = 'Read more';
                } else {
                    reviewText.classList.add('expanded');
                    readMoreBtn.textContent = 'Read less';
                }
            }
            
            // Edit review button
            const editReviewBtn = e.target.closest('.edit-review-btn');
            if (editReviewBtn) {
                const reviewId = editReviewBtn.closest('.review-card').dataset.id;
                this.openReviewEditor(parseInt(reviewId));
            }
            
            // Delete review button
            const deleteReviewBtn = e.target.closest('.delete-review-btn');
            if (deleteReviewBtn) {
                const reviewId = deleteReviewBtn.closest('.review-card').dataset.id;
                this.confirmDeleteReview(parseInt(reviewId));
            }
        });
        
        // After render, truncate long review texts
        this.truncateReviewTexts();
    }
    
    truncateReviewTexts() {
        document.querySelectorAll('.review-text').forEach(reviewText => {
            const content = reviewText.querySelector('.review-content');
            const readMoreBtn = reviewText.querySelector('.read-more-btn');
            
            // Show read more button only if content is overflowing
            if (content.scrollHeight > content.clientHeight) {
                readMoreBtn.style.display = 'block';
            } else {
                readMoreBtn.style.display = 'none';
            }
        });
    }
    
    openReviewEditor(reviewId) {
        const review = this.reviewsData.find(r => r.id === reviewId);
        if (!review) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content review-modal">
                <div class="modal-header">
                    <h2>Edit Review</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="review-product-info">
                        <div class="product-image">
                            <img src="${review.productImage}" alt="${review.productName}">
                        </div>
                        <div class="product-details">
                            <div class="product-name">${review.productName}</div>
                            <div class="review-date">Originally posted on ${review.date}</div>
                        </div>
                    </div>
                    
                    <div class="rating-input">
                        <label>Your Rating</label>
                        <div class="star-rating">
                            ${Array(5).fill(0).map((_, i) => 
                                `<i class="bx ${i < review.rating ? 'bxs-star' : 'bx-star'}" data-rating="${i + 1}"></i>`
                            ).join('')}
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="review-text">Your Review</label>
                        <textarea id="review-text" rows="6" placeholder="Write your review here...">${review.reviewText}</textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="cancel-btn">Cancel</button>
                    <button class="save-review-btn btn-animate">Save Changes</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Close modal function
        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        };
        
        // Modal event listeners
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.querySelector('.cancel-btn').addEventListener('click', closeModal);
        
        // Star rating
        modal.querySelectorAll('.star-rating i').forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                modal.querySelectorAll('.star-rating i').forEach((s, i) => {
                    s.className = i < rating ? 'bx bxs-star' : 'bx bx-star';
                });
            });
        });
        
        // Save review
        modal.querySelector('.save-review-btn').addEventListener('click', () => {
            const updatedRating = modal.querySelectorAll('.star-rating i.bxs-star').length;
            const updatedText = modal.querySelector('#review-text').value;
            
            if (updatedText.trim() === '') {
                alert('Please enter a review text');
                return;
            }
            
            // Update review data
            const index = this.reviewsData.findIndex(r => r.id === reviewId);
            if (index !== -1) {
                this.reviewsData[index].rating = updatedRating;
                this.reviewsData[index].reviewText = updatedText;
                this.reviewsData[index].date = 'Updated: ' + new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                
                this.showNotification({
                    title: 'Review Updated',
                    message: 'Your review has been updated successfully.',
                    type: 'success'
                });
                
                this.render();
            }
            
            closeModal();
        });
        
        // Handle outside click to close
        modal.addEventListener('click', e => {
            if (e.target === modal) closeModal();
        });
    }
    
    confirmDeleteReview(reviewId) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content confirm-modal">
                <div class="modal-header">
                    <h2>Confirm Deletion</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete this review? This action cannot be undone.</p>
                </div>
                <div class="modal-footer">
                    <button class="cancel-btn">Cancel</button>
                    <button class="delete-confirm-btn">Delete Review</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Close modal function
        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        };
        
        // Modal event listeners
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.querySelector('.cancel-btn').addEventListener('click', closeModal);
        
        // Confirm delete
        modal.querySelector('.delete-confirm-btn').addEventListener('click', () => {
            // Remove review from data
            this.reviewsData = this.reviewsData.filter(r => r.id !== reviewId);
            
            // Update total reviews count
            this.userData.totalReviews = this.reviewsData.length;
            
            this.showNotification({
                title: 'Review Deleted',
                message: 'Your review has been permanently deleted.',
                type: 'success'
            });
            
            this.render();
            closeModal();
        });
        
        // Handle outside click to close
        modal.addEventListener('click', e => {
            if (e.target === modal) closeModal();
        });
    }
    
    // Notification System
    setupNotificationContainer() {
        if (!document.querySelector('.notification-container')) {
            const container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
    }
    
    showNotification({ title, message, type = 'success', duration = 5000 }) {
        this.setupNotificationContainer();
        
        // Create notification container if it doesn't exist
        let container = document.querySelector('.notification-container');
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        const id = Date.now();
        notification.dataset.id = id;
        
        // Icon based on type
        let icon = 'bx-check-circle';
        if (type === 'error') icon = 'bx-error-circle';
        if (type === 'warning') icon = 'bx-error';
        if (type === 'info') icon = 'bx-info-circle';
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class='bx ${icon} notification-icon'></i>
                <div class="notification-text">
                    <p class="notification-title">${title}</p>
                    ${message ? `<p class="notification-message">${message}</p>` : ''}
                </div>
                <button class="close-notification-btn">
                    <i class='bx bx-x'></i>
                </button>
            </div>
            <div class="notification-progress"></div>
        `;
        
        // Add to container
        container.appendChild(notification);
        
        // Set up progress bar
        const progress = notification.querySelector('.notification-progress');
        setTimeout(() => {
            notification.classList.add('fade-in');
            progress.style.width = '0';
        }, 10);
        
        // Set up event listeners
        notification.querySelector('.close-notification-btn').addEventListener('click', () => {
            this.removeNotification(id);
        });
        
        // Auto-dismiss
        setTimeout(() => {
            this.removeNotification(id);
        }, duration);
    }
    
    removeNotification(id) {
        const notification = document.querySelector(`.notification[data-id="${id}"]`);
        if (notification) {
            notification.classList.remove('fade-in');
            notification.classList.add('fade-out');
            
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }
}