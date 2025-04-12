export default class Profile {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.activeTab = 'reviews'; // Default tab

        // Mock user data (in real app would be fetched from API)
        this.userData = {
            name: 'Alex Johnson',
            image: '../assets/images/profile.jpg',
            address: 'San Francisco, CA',
            memberSince: 'April 2023',
            email: 'alex.johnson@example.com',
            joinDate: 'April 15, 2023',
            ordersPlaced: 28,
            totalReviews: 12,
            verified: true
        };

        // Mock review data
        this.reviewsData = [
            {
                id: 1,
                productName: 'Sony WH-1000XM4 Wireless Headphones',
                productImage: '../assets/images/products/headphones.jpg',
                rating: 5,
                date: 'March 10, 2023',
                reviewText: 'These headphones are amazing! The noise cancellation is top-notch, and the sound quality is incredible. Battery life is also excellent - I can use them for an entire workday without recharging. Highly recommended for anyone who works in a noisy environment or travels frequently.',
                helpful: 24,
                verified: true,
                productId: 'product1'
            },
            {
                id: 2,
                productName: 'Samsung Galaxy S24 Ultra',
                productImage: '../assets/images/products/galaxy.jpg',
                rating: 4,
                date: 'February 22, 2023',
                reviewText: 'Great phone with an excellent camera system. The S-Pen functionality is a nice bonus, but I do wish the battery life was a bit better. Still, it handles everything I throw at it with ease.',
                helpful: 18,
                verified: true,
                productId: 'product2'
            },
            {
                id: 3,
                productName: 'Apple MacBook Pro M3',
                productImage: '../assets/images/products/macbook.jpg',
                rating: 5,
                date: 'January 15, 2023',
                reviewText: 'The M3 MacBook Pro is incredibly fast and efficient. I can run multiple design applications simultaneously without any lag. The battery life is outstanding - I can work an entire day without plugging in. The display is also gorgeous with accurate colors. Definitely worth the investment for creative professionals.',
                helpful: 35,
                verified: true,
                productId: 'product3'
            }
        ];

        // Activity data
        this.activityData = {
            savedItems: {
                count: 15,
                icon: 'bx-bookmark',
                title: 'Saved Items',
                link: '../HTML-Pages/SavedItemsPage.html'
            },
            orders: {
                count: 28,
                icon: 'bx-package',
                title: 'Orders',
                link: '../HTML-Pages/OrderHistoryPage.html'
            },
            listedItems: {
                count: 5,
                icon: 'bx-store',
                title: 'Listed Items',
                link: '../HTML-Pages/SellingPage.html'
            }
        };

        this.render();
        this.setupEventListeners();
    }

    render() {
        const profileHTML = `
            <div class="profile-component">
                <div class="profile-page-container">
                    <div class="profile-header">
                        <h1>My Profile</h1>
                    </div>
                    
                    <div class="profile-content">
                        <!-- User info sidebar -->
                        <div class="profile-sidebar">
                            <div class="user-info-card">
                                <div class="user-avatar">
                                    ${this.userData.verified ? '<div class="verified-badge"><i class="bx bxs-check-circle"></i></div>' : ''}
                                    <img src="${this.userData.image}" alt="${this.userData.name}">
                                </div>
                                
                                <h2 class="user-name">${this.userData.name}</h2>
                                
                                <div class="user-location">
                                    <i class='bx bx-map'></i>
                                    <span>${this.userData.address}</span>
                                </div>
                                
                                <div class="user-member-since">
                                    Member since ${this.userData.memberSince}
                                </div>
                                
                                <a href="../HTML-Pages/SettingsPage.html" class="edit-profile-btn">
                                    <i class='bx bx-edit'></i>
                                    Edit Profile
                                </a>
                                
                                <div class="user-stats">
                                    <div class="stat-item">
                                        <div class="stat-label">Email</div>
                                        <div class="stat-value">${this.userData.email}</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-label">Joined</div>
                                        <div class="stat-value">${this.userData.joinDate}</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-label">Orders</div>
                                        <div class="stat-value">${this.userData.ordersPlaced}</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-label">Reviews</div>
                                        <div class="stat-value">${this.userData.totalReviews}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Main content area with tabs -->
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
            </div>
        `;

        // Create or update profile in the DOM
        if (document.querySelector('.profile-component')) {
            document.querySelector('.profile-component').outerHTML = profileHTML;
        } else {
            this.container.insertAdjacentHTML('beforeend', profileHTML);
        }

        // Check if any review needs truncation markers
        this.checkReviewOverflow();
    }

    renderReviewsTab() {
        if (this.reviewsData.length === 0) {
            return `
                <div class="empty-tab-message">
                    <i class='bx bx-star'></i>
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
                <div class="review-item" data-id="${review.id}">
                    <div class="review-item-header">
                        <div class="product-image">
                            <img src="${review.productImage}" alt="${review.productName}">
                        </div>
                        <div class="review-details">
                            <h3 class="product-name">${review.productName}</h3>
                            <div class="rating-date">
                                <div class="stars">${stars}</div>
                                <div class="review-date">${review.date}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="review-text">
                        <p class="review-content">${review.reviewText}</p>
                    </div>
                    
                    <div class="review-actions">
                        <div class="helpful">
                            <i class='bx bx-like'></i>
                            <span>${review.helpful} found this helpful</span>
                        </div>
                        <div class="action-buttons">
                            <button class="view-product-btn" data-product-id="${review.productId}">
                                <i class='bx bx-link-external'></i>
                                View Product
                            </button>
                            <button class="edit-review-btn" data-review-id="${review.id}">
                                <i class='bx bx-edit'></i>
                                Edit
                            </button>
                            <button class="delete-review-btn" data-review-id="${review.id}">
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
                ${reviewsHTML}
            </div>
        `;
    }

    renderActivityTab() {
        const { savedItems, orders, listedItems } = this.activityData;

        return `
            <div class="activity-container">
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class='bx ${savedItems.icon}'></i>
                    </div>
                    <div class="activity-info">
                        <div class="activity-title">${savedItems.title}</div>
                        <div class="activity-count">${savedItems.count} items</div>
                    </div>
                    <a href="${savedItems.link}" class="view-all-btn">
                        <i class='bx bx-chevron-right'></i>
                    </a>
                </div>
                
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class='bx ${orders.icon}'></i>
                    </div>
                    <div class="activity-info">
                        <div class="activity-title">${orders.title}</div>
                        <div class="activity-count">${orders.count} orders</div>
                    </div>
                    <a href="${orders.link}" class="view-all-btn">
                        <i class='bx bx-chevron-right'></i>
                    </a>
                </div>
                
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class='bx ${listedItems.icon}'></i>
                    </div>
                    <div class="activity-info">
                        <div class="activity-title">${listedItems.title}</div>
                        <div class="activity-count">${listedItems.count} items</div>
                    </div>
                    <a href="${listedItems.link}" class="view-all-btn">
                        <i class='bx bx-chevron-right'></i>
                    </a>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Tab switching
        document.addEventListener('click', e => {
            const tabBtn = e.target.closest('.tab-btn');
            if (tabBtn) {
                this.activeTab = tabBtn.dataset.tab;
                this.render();
                return;
            }

            // Review item click to expand/collapse
            const reviewItem = e.target.closest('.review-item');
            if (reviewItem && !e.target.closest('button')) {
                reviewItem.classList.toggle('expanded');
                return;
            }

            // View product button
            const viewProductBtn = e.target.closest('.view-product-btn');
            if (viewProductBtn) {
                const productId = viewProductBtn.dataset.productId;
                window.location.href = `../HTML-Pages/ProductPage.html?id=${productId}`;
                return;
            }

            // Edit review button
            const editReviewBtn = e.target.closest('.edit-review-btn');
            if (editReviewBtn) {
                const reviewId = parseInt(editReviewBtn.dataset.reviewId);
                this.editReview(reviewId);
                return;
            }

            // Delete review button
            const deleteReviewBtn = e.target.closest('.delete-review-btn');
            if (deleteReviewBtn) {
                const reviewId = parseInt(deleteReviewBtn.dataset.reviewId);
                this.deleteReview(reviewId);
                return;
            }
        });

        // Window resize - check review overflow
        window.addEventListener('resize', () => {
            this.checkReviewOverflow();
        });
    }

    checkReviewOverflow() {
        document.querySelectorAll('.review-content').forEach(content => {
            const reviewText = content.closest('.review-text');
            if (content.scrollHeight > content.clientHeight) {
                reviewText.classList.add('has-overflow');
            } else {
                reviewText.classList.remove('has-overflow');
            }
        });
    }

    editReview(reviewId) {
        alert(`Editing review ${reviewId}`);
        // In a real app, this would open a modal to edit the review
    }

    deleteReview(reviewId) {
        if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
            // Remove review from data
            this.reviewsData = this.reviewsData.filter(r => r.id !== reviewId);

            // Update total reviews count
            this.userData.totalReviews = this.reviewsData.length;

            // Re-render component
            this.render();

            alert('Review deleted successfully');
        }
    }
}