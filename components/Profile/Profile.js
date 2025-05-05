export default class Profile {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.activeTab = 'reviews'; // Default tab

        // User data (unchanged)
        this.userData = {
            name: 'Alex Johnson',
            image: '../assets/images/general-image/RamyRxr.png',
            address: 'San Francisco, CA',
            memberSince: 'April 2023',
            email: 'alex.johnson@example.com',
            joinDate: 'April 15, 2023',
            ordersPlaced: 28,
            totalReviews: 12,
            verified: true
        };

        // Default mock review data
        const defaultReviews = [
            {
                id: 1,
                productName: 'Sony WH-1000XM4 Wireless Headphones',
                productImage: '../assets/images/products-images/headphone-1.jpg',
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
                productImage: '../assets/images/products-images/product-5.svg',
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
                productImage: '../assets/images/products-images/product-3.svg',
                rating: 5,
                date: 'January 15, 2023',
                reviewText: 'The M3 MacBook Pro is incredibly fast and efficient. I can run multiple design applications simultaneously without any lag. The battery life is outstanding - I can work an entire day without plugging in. The display is also gorgeous with accurate colors. Definitely worth the investment for creative professionals.',
                helpful: 35,
                verified: true,
                productId: 'product3'
            }
        ];

        // Reviews data loading (unchanged)
        this.reviewsData = this.loadReviewsFromStorage() || defaultReviews;
        this.userData.totalReviews = this.reviewsData.length;

        // Activity data with dynamic counts
        this.activityData = {
            savedItems: {
                icon: 'bx-bookmark',
                title: 'Saved Items',
                link: '../HTML-Pages/SavedPage.html',
                count: 0 // Will be updated dynamically
            },
            orders: {
                icon: 'bx-package',
                title: 'Orders',
                link: '../HTML-Pages/HistoryPage.html',
                count: 0 // Will be updated dynamically
            },
            listedItems: {
                icon: 'bx-store',
                title: 'Listed Items',
                link: '../HTML-Pages/SellingPage.html',
                count: 0 // Will be updated dynamically
            }
        };

        // Load activity counts
        this.loadActivityCounts();

        // Track deletions for undo functionality
        this.deletedReviews = {};
        this.deleteTimers = {};
        this.progressIntervals = {};

        this.createNotificationContainer(); // Create global notification container
        this.render();
        this.setupEventListeners();
    }

    // Create a global notification container
    createNotificationContainer() {
        // Remove any existing notification container
        const existingContainer = document.querySelector('.global-notification-container');
        if (existingContainer) return;

        // Create a new container appended to body
        const container = document.createElement('div');
        container.className = 'notification-container global-notification-container';
        document.body.appendChild(container);
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
                                        <i class='bx bx-envelope'></i>
                                        <div class="stat-value">${this.userData.email}</div>
                                    </div>
                                    <div class="stat-item">
                                        <i class='bx bx-calendar-check'></i>
                                        <div class="stat-value">Joined on ${this.userData.joinDate}</div>
                                    </div>
                                    <div class="stat-item">
                                        <i class='bx bx-package'></i>
                                        <div class="stat-value">${this.userData.ordersPlaced} orders</div>
                                    </div>
                                    <div class="stat-item">
                                        <i class='bx bx-store'></i>
                                        <div class="stat-value" data-stats="listed-count">${this.activityData.listedItems.count} listed items</div>
                                    </div>
                                    <div class="stat-item">
                                        <i class='bx bx-star'></i>
                                        <div class="stat-value" data-stats="reviews-count">${this.userData.totalReviews} reviews</div>
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
                
                <!-- Edit Review Modal -->
                ${this.renderEditModal()}
            </div>
        `;

        // Create or update profile in the DOM
        if (document.querySelector('.profile-component')) {
            document.querySelector('.profile-component').outerHTML = profileHTML;
        } else {
            this.container.insertAdjacentHTML('beforeend', profileHTML);
        }
    }

    renderReviewsTab() {
        if (this.reviewsData.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class='bx bx-star'></i>
                    </div>
                    <h3 class="empty-state-title">No Reviews Yet</h3>
                    <p class="empty-state-message">You haven't written any reviews yet. Your product reviews will appear here once you share your thoughts.</p>
                    <a href="../HTML-Pages/HomePage.html" class="empty-state-action">
                        <i class='bx bx-shopping-bag'></i>
                        Browse Products
                    </a>
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
                <a href="${savedItems.link}?tab=saved" class="activity-item">
                    <div class="activity-icon" style="background: linear-gradient(135deg, #9c27b0, #6a0080);">
                        <i class='bx ${savedItems.icon}'></i>
                    </div>
                    <div class="activity-info">
                        <div class="activity-title">${savedItems.title}</div>
                        <div class="activity-count">${savedItems.count} items</div>
                    </div>
                </a>
                
                <a href="${orders.link}?tab=orders" class="activity-item">
                    <div class="activity-icon" style="background: linear-gradient(135deg, #4caf50, #2e7d32);">
                        <i class='bx ${orders.icon}'></i>
                    </div>
                    <div class="activity-info">
                        <div class="activity-title">${orders.title}</div>
                        <div class="activity-count">${orders.count} orders</div>
                    </div>
                </a>
                
                <a href="${listedItems.link}?tab=selling" class="activity-item">
                    <div class="activity-icon" style="background: linear-gradient(135deg, #ff9800, #e65100);">
                        <i class='bx ${listedItems.icon}'></i>
                    </div>
                    <div class="activity-info">
                        <div class="activity-title">${listedItems.title}</div>
                        <div class="activity-count">${listedItems.count} items</div>
                    </div>
                </a>
            </div>
        `;
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
            const actionBtn = e.target.closest('button');
            if (reviewItem && !actionBtn) {
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
                this.openEditModal(reviewId);
                return;
            }

            // Delete review button
            const deleteReviewBtn = e.target.closest('.delete-review-btn');
            if (deleteReviewBtn) {
                const reviewId = parseInt(deleteReviewBtn.dataset.reviewId);
                this.deleteReview(reviewId);
                return;
            }

            // Close edit modal
            const closeModalBtn = e.target.closest('.close-modal-btn');
            if (closeModalBtn) {
                this.closeEditModal();
                return;
            }

            // Discard changes
            const discardBtn = e.target.closest('.discard-btn');
            if (discardBtn) {
                this.closeEditModal();
                return;
            }

            // Save review changes
            const saveBtn = e.target.closest('.save-btn');
            if (saveBtn) {
                this.saveReviewChanges();
                return;
            }

            // Star rating buttons
            const starBtn = e.target.closest('.star-btn');
            if (starBtn) {
                const rating = parseInt(starBtn.dataset.rating);
                this.updateStarRating(rating);
                return;
            }

            // Undo button in notification
            const undoBtn = e.target.closest('.undo-btn');
            if (undoBtn) {
                const reviewId = parseInt(undoBtn.dataset.id);
                this.undoDelete(reviewId);
                return;
            }

            // Close notification button
            const closeNotificationBtn = e.target.closest('.close-notification-btn');
            if (closeNotificationBtn) {
                const notification = closeNotificationBtn.closest('.notification');
                const reviewId = parseInt(notification.dataset.id);

                this.removeNotification(reviewId);
                this.permanentlyDeleteReview(reviewId);
                return;
            }
        });

        // Extra click handler for modal backdrop to close modal when clicking outside
        const editModalBackdrop = document.querySelector('.edit-modal-backdrop');
        if (editModalBackdrop) {
            editModalBackdrop.addEventListener('click', (e) => {
                if (e.target === editModalBackdrop) {
                    this.closeEditModal();
                }
            });
        }

        // Listen for storage changes to update counts
        window.addEventListener('storage', (event) => {
            if (['savedItems', 'orderHistory', 'activeListings', 'soldItems'].includes(event.key)) {
                this.loadActivityCounts();
                this.updateActivityCountsInUI();
            }
        });

        // Listen for custom events from other components
        document.addEventListener('savedItemsUpdated', () => {
            this.loadActivityCounts();
            this.updateActivityCountsInUI();
        });

        document.addEventListener('ordersUpdated', () => {
            this.loadActivityCounts();
            this.updateActivityCountsInUI();
        });

        document.addEventListener('listingsUpdated', () => {
            this.loadActivityCounts();
            this.updateActivityCountsInUI();
        });
    }

    // Method to open the edit modal
    openEditModal(reviewId) {
        const review = this.reviewsData.find(r => r.id === reviewId);
        if (!review) return;

        // Set current review ID being edited
        this.currentEditReviewId = reviewId;

        // Get modal elements
        const modal = document.querySelector('.edit-modal-backdrop');
        const productNameEl = document.getElementById('modal-product-name');
        const reviewDateEl = document.getElementById('modal-review-date');
        const productImageEl = document.getElementById('modal-product-image');
        const textareaEl = document.getElementById('edit-review-textarea');

        // Set initial values
        productNameEl.textContent = review.productName;
        reviewDateEl.textContent = `Reviewed on ${review.date}`;  // Add the date here
        productImageEl.src = review.productImage;
        productImageEl.alt = review.productName;
        textareaEl.value = review.reviewText;

        // Set star rating
        this.updateStarRating(review.rating);

        // Show modal with animation
        modal.classList.add('active');
    }

    // Method to close the edit modal
    closeEditModal() {
        const modal = document.querySelector('.edit-modal-backdrop');
        modal.classList.remove('active');
        this.currentEditReviewId = null;
    }

    // Method to update star rating in the modal
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

        // Store the current rating
        this.currentEditRating = rating;
    }

    // Method to save review changes
    saveReviewChanges() {
        if (!this.currentEditReviewId) return;

        const textareaEl = document.getElementById('edit-review-textarea');
        const newReviewText = textareaEl.value.trim();
        const newRating = this.currentEditRating;

        // Validate
        if (!newReviewText) {
            alert('Please enter a review text');
            return;
        }

        // Find and update the review
        const reviewIndex = this.reviewsData.findIndex(r => r.id === this.currentEditReviewId);
        if (reviewIndex !== -1) {
            this.reviewsData[reviewIndex].reviewText = newReviewText;
            this.reviewsData[reviewIndex].rating = newRating;

            // Update date to today
            const today = new Date();
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            this.reviewsData[reviewIndex].date = today.toLocaleDateString('en-US', options);

            // Save to localStorage
            this.saveReviewsToStorage();

            // Close modal and re-render
            this.closeEditModal();
            this.render();

            // Show success notification
            this.showEditSuccessNotification(this.reviewsData[reviewIndex].productName);
        }
    }

    // Method to show edit success notification
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

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('fade-in');
            notification.classList.add('fade-out');

            setTimeout(() => {
                // Check if notification still exists before removing
                if (notification && notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    // Method to delete a review with undo functionality
    deleteReview(reviewId) {
        // Find the review in the array
        const reviewIndex = this.reviewsData.findIndex(r => r.id === reviewId);
        if (reviewIndex === -1) return;

        // Store the review for potential undo
        this.deletedReviews[reviewId] = {
            review: this.reviewsData[reviewIndex],
            index: reviewIndex,
            timestamp: new Date().getTime()
        };

        // Remove from array
        this.reviewsData.splice(reviewIndex, 1);

        // Update total reviews count
        this.userData.totalReviews = this.reviewsData.length;

        // Re-render
        this.render();

        // Show notification
        this.showDeleteNotification(reviewId);

        // Set timer for permanent deletion - 5 seconds
        if (this.deleteTimers[reviewId]) {
            clearTimeout(this.deleteTimers[reviewId]);
        }

        this.deleteTimers[reviewId] = setTimeout(() => {
            this.permanentlyDeleteReview(reviewId);
        }, 5000);
    }

    // Method to show delete notification
    showDeleteNotification(reviewId) {
        const notificationContainer = document.querySelector('.global-notification-container');
        if (!notificationContainer) return;

        const reviewData = this.deletedReviews[reviewId].review;
        const notification = document.createElement('div');
        notification.className = 'notification fade-in';
        notification.dataset.id = reviewId;

        // Calculate time remaining - 5 seconds
        const secondsRemaining = 5;

        notification.innerHTML = `
            <div class="notification-content">
                <i class='bx bx-check-circle notification-icon'></i>
                <div class="notification-text">
                    <p>Review for "${reviewData.productName}" has been deleted.</p>
                    <button class="undo-btn" data-id="${reviewId}">Undo</button>
                    <span class="notification-time">${secondsRemaining}s</span>
                </div>
                <button class="close-notification-btn">
                    <i class='bx bx-x'></i>
                </button>
            </div>
            <div class="notification-progress"></div>
        `;

        notificationContainer.appendChild(notification);

        // Initialize progress bar
        const progressBar = notification.querySelector('.notification-progress');
        if (progressBar) {
            // Use CSS transition for smooth animation
            progressBar.style.transition = 'width 5s linear';

            // Force a reflow before changing width
            void progressBar.offsetWidth;

            // Start with full width
            progressBar.style.width = '100%';

            // Set width to 0 after a tiny delay
            setTimeout(() => {
                progressBar.style.width = '0%';
            }, 50);
        }

        // Create countdown timer
        const timeDisplay = notification.querySelector('.notification-time');
        let timeLeft = secondsRemaining;

        this.progressIntervals[reviewId] = setInterval(() => {
            timeLeft--;

            if (timeDisplay) {
                timeDisplay.textContent = `${timeLeft}s`;
            }

            if (timeLeft <= 0) {
                clearInterval(this.progressIntervals[reviewId]);
                delete this.progressIntervals[reviewId];

                // Add this line to automatically remove notification when timer ends
                this.removeNotification(reviewId);
            }
        }, 1000);
    }

    // Method to undo a review deletion
    undoDelete(reviewId) {
        if (!this.deletedReviews[reviewId]) return;

        // Clear timers
        if (this.deleteTimers[reviewId]) {
            clearTimeout(this.deleteTimers[reviewId]);
            delete this.deleteTimers[reviewId];
        }

        // Clear progress intervals
        if (this.progressIntervals[reviewId]) {
            clearInterval(this.progressIntervals[reviewId]);
            delete this.progressIntervals[reviewId];
        }

        // Get the deleted review info
        const { review, index } = this.deletedReviews[reviewId];

        // Restore review at original position if possible
        if (index <= this.reviewsData.length) {
            this.reviewsData.splice(index, 0, review);
        } else {
            this.reviewsData.push(review);
        }

        // Remove from deleted reviews
        delete this.deletedReviews[reviewId];

        // Update total reviews count
        this.userData.totalReviews = this.reviewsData.length;

        // Save to localStorage
        this.saveReviewsToStorage();

        // Remove notification
        this.removeNotification(reviewId);

        // Re-render
        this.render();
    }

    // Method to permanently delete a review
    permanentlyDeleteReview(reviewId) {
        // Clear progress interval if it exists
        if (this.progressIntervals[reviewId]) {
            clearInterval(this.progressIntervals[reviewId]);
            delete this.progressIntervals[reviewId];
        }

        // Also clear any pending timers
        if (this.deleteTimers[reviewId]) {
            clearTimeout(this.deleteTimers[reviewId]);
            delete this.deleteTimers[reviewId];
        }

        // Clear from tracking objects
        delete this.deletedReviews[reviewId];

        // Make sure the notification is removed
        this.removeNotification(reviewId);

        // Save the current reviews state to localStorage
        this.saveReviewsToStorage();
    }

    // Method to remove a notification
    removeNotification(reviewId) {
        const notification = document.querySelector(`.notification[data-id="${reviewId}"]`);
        if (!notification) return;

        notification.classList.remove('fade-in');
        notification.classList.add('fade-out');

        setTimeout(() => {
            // Check if notification still exists before removing
            if (notification && notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }

    // Method to load reviews from localStorage
    loadReviewsFromStorage() {
        try {
            const savedReviews = localStorage.getItem('userReviews');
            return savedReviews ? JSON.parse(savedReviews) : null;
        } catch (error) {
            console.error('Error loading reviews from storage:', error);
            return null;
        }
    }

    // Method to save reviews to localStorage
    saveReviewsToStorage() {
        try {
            localStorage.setItem('userReviews', JSON.stringify(this.reviewsData));
        } catch (error) {
            console.error('Error saving reviews to storage:', error);
        }
    }

    // Add this new method to load activity counts from localStorage
    loadActivityCounts() {
        try {
            // Load saved items count
            const savedItems = localStorage.getItem('savedItems');
            if (savedItems) {
                const items = JSON.parse(savedItems);
                this.activityData.savedItems.count = items.length;
            }

            // Load orders count (from purchase history)
            const orderHistory = localStorage.getItem('orderHistory');
            if (orderHistory) {
                const orders = JSON.parse(orderHistory);
                this.activityData.orders.count = orders.length;
            }

            // Load listed items count (active + sold from selling page)
            const activeListings = localStorage.getItem('activeListings');
            const soldItems = localStorage.getItem('soldItems');

            let listedCount = 0;

            if (activeListings) {
                listedCount += JSON.parse(activeListings).length;
            }

            if (soldItems) {
                listedCount += JSON.parse(soldItems).length;
            }

            this.activityData.listedItems.count = listedCount;

        } catch (error) {
            console.error('Error loading activity counts:', error);
        }
    }

    // Add new method to update counts in UI without full re-render
    updateActivityCountsInUI() {
        // Update activity counts in the UI
        const savedItemsCount = document.querySelector('[data-activity="saved-count"]');
        if (savedItemsCount) {
            savedItemsCount.textContent = `${this.activityData.savedItems.count} items`;
        }

        const ordersCount = document.querySelector('[data-activity="orders-count"]');
        if (ordersCount) {
            ordersCount.textContent = `${this.activityData.orders.count} orders`;
        }

        const listedItemsCount = document.querySelector('[data-activity="listed-count"]');
        if (listedItemsCount) {
            listedItemsCount.textContent = `${this.activityData.listedItems.count} items`;
        }

        // Also update user stats
        const reviewsCount = document.querySelector('[data-stats="reviews-count"]');
        if (reviewsCount) {
            reviewsCount.textContent = `${this.userData.totalReviews} reviews`;
        }

        const listedStatsCount = document.querySelector('[data-stats="listed-count"]');
        if (listedStatsCount) {
            listedStatsCount.textContent = `${this.activityData.listedItems.count} listed items`;
        }
    }
}

// Create three sample reviews with different product types
const sampleReviews = [
    {
        id: 1,
        productName: 'Sony WH-1000XM5 Wireless Headphones',
        productImage: '../assets/images/products-images/headphone-1.jpg',
        rating: 5,
        date: 'April 2, 2025',
        reviewText: 'These are the best headphones I\'ve ever owned! The noise cancellation is incredible - I can\'t hear anything around me when I\'m working. The sound quality is crisp and balanced with deep bass that doesn\'t overwhelm. Battery life lasts me almost a full work week. The comfort level is also impressive, I can wear them for hours without any discomfort. Highly recommend for anyone working in noisy environments.',
        helpful: 47,
        verified: true,
        productId: 'product1'
    },
    {
        id: 2,
        productName: 'Apple MacBook Air M3',
        productImage: '../assets/images/products-images/product-3.svg',
        rating: 4,
        date: 'March 15, 2025',
        reviewText: 'The new M3 MacBook Air is lightning fast and the battery life is amazing. I can easily get through a full day of work without needing to charge it. The display is gorgeous with vibrant colors and excellent contrast. Only giving 4 stars because I wish it had more ports - still need dongles for most connections which is annoying. Otherwise, it\'s a fantastic laptop for both work and entertainment.',
        helpful: 28,
        verified: true,
        productId: 'product3'
    },
    {
        id: 3,
        productName: 'Samsung S25 Ultra Smartphone',
        productImage: '../assets/images/products-images/product-5.svg',
        rating: 5,
        date: 'February 10, 2025',
        reviewText: 'This phone exceeds all my expectations! The camera system is mind-blowing - the photos I\'ve taken look professional. The 200MP main sensor captures incredible detail, and the 10x optical zoom is fantastic for travel photography. The display is bright enough to use even in direct sunlight with excellent color accuracy. Battery easily lasts all day even with heavy use. The S-Pen is a nice bonus feature that I\'ve found myself using more than expected. Worth every penny if you\'re looking for the best Android experience possible.',
        helpful: 63,
        verified: true,
        productId: 'product5'
    }
];

// Save to localStorage
localStorage.setItem('userReviews', JSON.stringify(sampleReviews));

// Confirm the save was successful
console.log('Sample reviews added to localStorage! Refresh the page to see them.');