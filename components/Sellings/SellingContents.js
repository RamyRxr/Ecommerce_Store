export default class SellingContents {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.activeTab = 'active';
        this.listings = [];
        this.soldItems = [];
        this.editingListing = null;
        this.isEditing = false;
        this.imageFiles = [];
        this.init();
    }

    async init() {
        await this.loadListings();
        await this.loadSoldItems();
        this.render();
        this.setupEventListeners();
    }

    async loadListings() {
        try {
            const response = await fetch('../backend/api/listings/get_listings.php');
            if (!response.ok) {
                throw new Error('Failed to fetch listings');
            }
            const data = await response.json();
            if (data.success) {
                this.listings = data.data.listings.map(listing => ({
                    id: listing.id,
                    title: listing.title,
                    description: listing.description,
                    price: parseFloat(listing.price),
                    category: listing.category,
                    condition: listing.condition,
                    brand: listing.brand,
                    model: listing.model,
                    quantity: parseInt(listing.quantity) || 0,
                    status: listing.status || 'active',
                    views: parseInt(listing.views) || 0,
                    dateListed: listing.created_at,
                    images: Array.isArray(listing.images) ? listing.images.map(img =>
                        `${img.includes('uploads/') ? '../' + img : '../backend/' + img}`
                    ) : ['../assets/images/products-images/placeholder.svg'],
                    shipping: listing.shipping,
                    localPickup: listing.local_pickup
                }));
            } else {
                throw new Error(data.message || 'Failed to parse listings data');
            }
        } catch (error) {
            console.error('Error loading listings:', error);
            this.showNotification({ title: 'Error', message: 'Could not load your listings.', type: 'error' });
            this.listings = [];
        }
    }

    async loadSoldItems() {
        try {
            const response = await fetch('../backend/api/listings/get_sold_items.php');
            if (!response.ok) {
                throw new Error('Failed to fetch sold items');
            }
            const data = await response.json();
            if (data.success) {
                this.soldItems = data.data;
            } else {
                throw new Error(data.message || 'Failed to parse sold items data');
            }
        } catch (error) {
            console.error('Error loading sold items:', error);
            this.showNotification({ title: 'Error', message: 'Could not load your sold items.', type: 'error' });
            this.soldItems = [];
        }
    }

    render() {
        const sellingContentHTML = `
            <div class="selling-content">
                <div class="main-content-container">
                    <div class="selling-header">
                        <h1>${this.isEditing ? 'Edit Your Listing' : 'Sell Your Tech'}</h1>
                        <p>${this.isEditing ? '' : `${this.listings.length} Active Listings`}</p>
                    </div>
                    
                    <div class="selling-tabs">
                        <button class="tab-button ${this.activeTab === 'create' ? 'active' : ''}" data-tab="create">
                            <i class='bx bx-plus-circle'></i>
                            Create Listing
                        </button>
                        <button class="tab-button ${this.activeTab === 'active' ? 'active' : ''}" data-tab="active">
                            <i class='bx bx-list-ul'></i>
                            Active Listings (${this.listings.length})
                        </button>
                        <button class="tab-button ${this.activeTab === 'sold' ? 'active' : ''}" data-tab="sold">
                            <i class='bx bx-check-circle'></i>
                            Sold Items (${this.soldItems.length})
                        </button>
                    </div>
                    
                    <div class="selling-content-body">
                        ${this.renderTabContent()}
                    </div>
                </div>
            </div>
        `;

        const sellingContentContainer = document.createElement('div');
        sellingContentContainer.innerHTML = sellingContentHTML;

        const existingSellingContent = document.querySelector('.selling-content');
        if (existingSellingContent) {
            existingSellingContent.replaceWith(sellingContentContainer.firstElementChild);
        } else {
            this.container.appendChild(sellingContentContainer.firstElementChild);
        }

        if (this.activeTab === 'create') {
            this.setupCreateTabEventListeners();
        }
    }

    renderTabContent() {
        switch (this.activeTab) {
            case 'create':
                return this.renderCreateTab();
            case 'active':
                return this.renderActiveTab();
            case 'sold':
                return this.renderSoldTab();
            default:
                return this.renderCreateTab();
        }
    }

    renderCreateTab() {
        const currentListing = this.editingListing;

        return `
            <div class="create-listing-container">
                <div class="create-listing-form">
                    <div class="form-section">
                        <h2>Product Details</h2>
                        <p>Provide information about the item you're selling.</p>
                        
                        <div class="form-group">
                            <label for="product-title">Product Title</label>
                            <input type="text" id="product-title" placeholder="Enter product title" value="${currentListing ? currentListing.title : ''}">
                        </div>
                        
                        <div class="form-row">
                            <div class="fancy-select-container">
                                <div class="form-group">
                                    <label for="product-category">Category</label>
                                </div>
                                <button type="button" class="fancy-select" id="category-select">
                                    <span id="selected-category">${currentListing ? this.getCategoryDisplayName(currentListing.category) : 'Select a category'}</span>
                                    <span class="fancy-select-icon">
                                        <i class='bx bx-chevron-down'></i>
                                    </span>
                                </button>
                                <div class="fancy-select-options" id="category-options">
                                    <div class="fancy-option ${currentListing && currentListing.category === 'smartphones' ? 'selected' : ''}" data-value="smartphones">
                                        <span class="fancy-option-icon"><i class='bx bx-mobile-alt'></i></span>
                                        <span>Smartphones</span>
                                    </div>
                                    <div class="fancy-option ${currentListing && currentListing.category === 'laptops' ? 'selected' : ''}" data-value="laptops">
                                        <span class="fancy-option-icon"><i class='bx bx-laptop'></i></span>
                                        <span>Laptops</span>
                                    </div>
                                    <div class="fancy-option ${currentListing && currentListing.category === 'tablets' ? 'selected' : ''}" data-value="tablets">
                                        <span class="fancy-option-icon"><i class='bx bx-tablet'></i></span>
                                        <span>Tablets</span>
                                    </div>
                                    <div class="fancy-option ${currentListing && currentListing.category === 'headphones' ? 'selected' : ''}" data-value="headphones">
                                        <span class="fancy-option-icon"><i class='bx bx-headphone'></i></span>
                                        <span>Headphones</span>
                                    </div>
                                    <div class="fancy-option ${currentListing && currentListing.category === 'cameras' ? 'selected' : ''}" data-value="cameras">
                                        <span class="fancy-option-icon"><i class='bx bx-camera'></i></span>
                                        <span>Cameras</span>
                                    </div>
                                    <div class="fancy-option ${currentListing && currentListing.category === 'accessories' ? 'selected' : ''}" data-value="accessories">
                                        <span class="fancy-option-icon"><i class='bx bx-plug'></i></span>
                                        <span>Accessories</span>
                                    </div>
                                    <div class="fancy-option ${currentListing && !['smartphones', 'laptops', 'tablets', 'headphones', 'cameras', 'accessories'].includes(currentListing.category) ? 'selected' : ''}" data-value="other">
                                        <span class="fancy-option-icon"><i class='bx bx-plus-circle'></i></span>
                                        <span>Other</span>
                                    </div>
                                </div>
                                <div class="other-input-container ${currentListing && !['smartphones', 'laptops', 'tablets', 'headphones', 'cameras', 'accessories'].includes(currentListing.category) ? 'active' : ''}" id="other-category-container">
                                    <input type="text" id="other-category" placeholder="Specify category" value="${currentListing && !['smartphones', 'laptops', 'tablets', 'headphones', 'cameras', 'accessories'].includes(currentListing.category) ? currentListing.category : ''}">
                                </div>
                            </div>
                            
                            <div class="fancy-select-container">
                                <div class="form-group">
                                    <label for="product-condition">Condition</label>
                                </div>
                                <button type="button" class="fancy-select" id="condition-select">
                                    <span id="selected-condition">${currentListing ? currentListing.condition : 'Select condition'}</span>
                                    <span class="fancy-select-icon">
                                        <i class='bx bx-chevron-down'></i>
                                    </span>
                                </button>
                                <div class="fancy-select-options" id="condition-options">
                                     <div class="fancy-option ${currentListing && currentListing.condition === 'New' ? 'selected' : ''}" data-value="New">
                                        <span class="fancy-option-icon"><i class='bx bx-package'></i></span>
                                        <span>New</span>
                                    </div>
                                    <div class="fancy-option ${currentListing && currentListing.condition === 'Like New' ? 'selected' : ''}" data-value="Like New">
                                        <span class="fancy-option-icon"><i class='bx bx-like'></i></span>
                                        <span>Like New</span>
                                    </div>
                                    <div class="fancy-option ${currentListing && currentListing.condition === 'Excellent' ? 'selected' : ''}" data-value="Excellent">
                                        <span class="fancy-option-icon"><i class='bx bx-check-circle'></i></span>
                                        <span>Excellent</span>
                                    </div>
                                    <div class="fancy-option ${currentListing && currentListing.condition === 'Good' ? 'selected' : ''}" data-value="Good">
                                        <span class="fancy-option-icon"><i class='bx bx-check'></i></span>
                                        <span>Good</span>
                                    </div>
                                    <div class="fancy-option ${currentListing && currentListing.condition === 'Used' ? 'selected' : ''}" data-value="Used">
                                        <span class="fancy-option-icon"><i class='bx bx-time'></i></span>
                                        <span>Used</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="product-description">Description</label>
                            <textarea id="product-description" placeholder="Describe your item in detail, including any flaws or issues">${currentListing ? currentListing.description : ''}</textarea>
                        </div>
                        
                        <div class="price-brand-model-row">
                            <div class="form-group">
                                <label for="product-price">Price ($)</label>
                                <input type="number" id="product-price" placeholder="0.00" min="0" step="0.01" value="${currentListing ? currentListing.price : ''}">
                            </div>
                            
                            <div class="fancy-select-container">
                                <div class="form-group">
                                    <label for="product-brand">Brand</label>
                                </div>
                                <button type="button" class="fancy-select" id="brand-select">
                                    <span id="selected-brand">${currentListing ? this.getBrandDisplayName(currentListing.brand) : 'Select a brand'}</span>
                                    <span class="fancy-select-icon">
                                        <i class='bx bx-chevron-down'></i>
                                    </span>
                                </button>
                                <div class="fancy-select-options" id="brand-options">
                                    <div class="fancy-option ${currentListing && currentListing.brand === 'apple' ? 'selected' : ''}" data-value="apple">
                                        <span class="fancy-option-icon"><i class='bx bxl-apple'></i></span>
                                        <span>Apple</span>
                                    </div>
                                    <div class="fancy-option ${currentListing && currentListing.brand === 'samsung' ? 'selected' : ''}" data-value="samsung">
                                        <span class="fancy-option-icon"><i class='bx bxs-component'></i></span>
                                        <span>Samsung</span>
                                    </div>
                                    <div class="fancy-option ${currentListing && currentListing.brand === 'sony' ? 'selected' : ''}" data-value="sony">
                                        <span class="fancy-option-icon"><i class='bx bxs-devices'></i></span>
                                        <span>Sony</span>
                                    </div>
                                    <div class="fancy-option ${currentListing && currentListing.brand === 'dell' ? 'selected' : ''}" data-value="dell">
                                        <span class="fancy-option-icon"><i class='bx bx-desktop'></i></span>
                                        <span>Dell</span>
                                    </div>
                                    <div class="fancy-option ${currentListing && currentListing.brand === 'lenovo' ? 'selected' : ''}" data-value="lenovo">
                                        <span class="fancy-option-icon"><i class='bx bx-laptop'></i></span>
                                        <span>Lenovo</span>
                                    </div>
                                    <div class="fancy-option ${currentListing && currentListing.brand === 'jbl' ? 'selected' : ''}" data-value="jbl">
                                        <span class="fancy-option-icon"><i class='bx bx-speaker'></i></span>
                                        <span>JBL</span>
                                    </div>
                                    <div class="fancy-option ${currentListing && currentListing.brand === 'canon' ? 'selected' : ''}" data-value="canon">
                                        <span class="fancy-option-icon"><i class='bx bx-camera'></i></span>
                                        <span>Canon</span>
                                    </div>
                                    <div class="fancy-option ${currentListing && !['apple', 'samsung', 'sony', 'dell', 'lenovo', 'jbl', 'canon'].includes(currentListing.brand) ? 'selected' : ''}" data-value="other">
                                        <span class="fancy-option-icon"><i class='bx bx-plus-circle'></i></span>
                                        <span>Other</span>
                                    </div>
                                </div>
                                <div class="other-input-container ${currentListing && !['apple', 'samsung', 'sony', 'dell', 'lenovo', 'jbl', 'canon'].includes(currentListing.brand) ? 'active' : ''}" id="other-brand-container">
                                    <input type="text" id="other-brand" placeholder="Specify brand" value="${currentListing && !['apple', 'samsung', 'sony', 'dell', 'lenovo', 'jbl', 'canon'].includes(currentListing.brand) ? currentListing.brand : ''}">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="product-model">Model</label>
                                <input type="text" id="product-model" placeholder="Enter model name/number" value="${currentListing ? currentListing.model : ''}">
                            </div>
                             <div class="form-group"> 
                                <label for="product-quantity">Quantity</label>
                                <input type="number" id="product-quantity" placeholder="1" min="0" step="1" value="${currentListing ? currentListing.quantity : '1'}">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h2>Listing Summary</h2>
                        <div class="listing-summary-container">
                            <div class="listing-option ${currentListing && currentListing.shipping && !currentListing.localPickup ? 'selected' : (!currentListing ? 'selected' : '')}" data-option="shipping">
                                <div class="option-radio">
                                    <div class="radio-dot ${currentListing && currentListing.shipping && !currentListing.localPickup ? 'selected' : (!currentListing ? 'selected' : '')}"></div>
                                </div>
                                <div class="option-details">
                                    <div class="option-name">Offer Shipping</div>
                                    <div class="option-description">Ship your item to buyers nationwide</div>
                                </div>
                            </div>
                            
                            <div class="listing-option ${currentListing && !currentListing.shipping && currentListing.localPickup ? 'selected' : ''}" data-option="pickup">
                                <div class="option-radio">
                                    <div class="radio-dot ${currentListing && !currentListing.shipping && currentListing.localPickup ? 'selected' : ''}"></div>
                                </div>
                                <div class="option-details">
                                    <div class="option-name">Local Pickup</div>
                                    <div class="option-description">Meet buyers locally for the exchange</div>
                                </div>
                            </div>
                            
                            <div class="listing-option ${currentListing && currentListing.shipping && currentListing.localPickup ? 'selected' : ''}" data-option="both">
                                <div class="option-radio">
                                    <div class="radio-dot ${currentListing && currentListing.shipping && currentListing.localPickup ? 'selected' : ''}"></div>
                                </div>
                                <div class="option-details">
                                    <div class="option-name">Both Options</div>
                                    <div class="option-description">Offer both shipping and local pickup</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h2>Product Images</h2>
                        <p>Add clear photos of your item from multiple angles.</p>
                        
                        <div class="image-upload-container">
                            <div class="image-upload-area" id="image-upload-area">
                                <i class='bx bx-image-add'></i>
                                <span>+ Add Images</span>
                                <input type="file" id="image-upload" multiple accept="image/*" style="display: none;">
                            </div>
                            <div class="image-preview-container" id="image-preview-container">
                                ${currentListing && currentListing.images ?
                                    currentListing.images.map(img => `
                                        <div class="image-preview">
                                            <img src="${img}" alt="Product image">
                                            <button type="button" class="remove-image-btn">
                                                <i class='bx bx-x'></i>
                                            </button>
                                        </div>
                                    `).join('')
                                : ''}
                            </div>
                        </div>
                        
                        <div class="image-tips">
                            <p><i class='bx bx-info-circle'></i> Tips:</p>
                            <ul>
                                <li>You can upload up to 8 images</li>
                                <li>First image will be used as the cover photo</li>
                                <li>Images should clearly show the condition of the item</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        ${this.isEditing ? `
                            <button class="save-draft-btn" id="update-draft-btn">
                                <i class='bx bx-save'></i>
                                Save as Draft
                            </button>
                            <button class="update-listing-btn" id="update-listing-btn">
                                <i class='bx bx-check-circle'></i>
                                Update Listing
                            </button>
                        ` : `
                            <button class="save-draft-btn">
                                <i class='bx bx-save'></i>
                                Save as Draft
                            </button>
                            <button class="publish-btn">
                                <i class='bx bx-upload'></i>
                                Publish Listing
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    renderActiveTab() {
        const activeListings = this.listings.filter(listing => listing.status === 'active' || listing.status === 'sold_out');

        if (activeListings.length === 0) {
            return `
                <div class="no-listings">
                    <div class="no-listings-icon">
                        <i class='bx bx-store-alt'></i>
                    </div>
                    <h3>No Active Listings</h3>
                    <p>Items you list for sale will appear here.</p>
                    <button class="create-listing-btn-empty" data-tab="create">
                        <i class='bx bx-plus-circle'></i> Create New Listing
                    </button>
                </div>
            `;
        }
        activeListings.sort((a, b) => {
            if (a.status === 'sold_out' && b.status !== 'sold_out') return 1;
            if (a.status !== 'sold_out' && b.status === 'sold_out') return -1;
            return new Date(b.dateListed) - new Date(a.dateListed);
        });

        return `
            <div class="listings-grid">
                ${activeListings.map(listing => {
            const dateListed = new Date(listing.dateListed);
            const formattedDate = dateListed.toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            });

            let statusBadge = listing.status === 'sold_out'
                ? `<span class="listing-status sold-out-badge"><i class='bx bx-purchase-tag-alt'></i> Sold Out</span>`
                : (listing.quantity <= 5 && listing.quantity > 0 ? `<span class="listing-status low-stock-badge"><i class='bx bx-error-circle'></i> Low Stock (${listing.quantity} left)</span>` : '');

            const imageUrl = listing.images && listing.images.length > 0
                ? listing.images[0]
                : '../assets/images/products-images/placeholder.svg';

            return `
                        <div class="listing-card ${listing.status === 'sold_out' ? 'sold-out-item' : ''}" data-id="${listing.id}">
                            <div class="listing-image">
                                <img src="${imageUrl}" alt="${listing.title}">
                                ${statusBadge}
                            </div>
                            <div class="listing-info">
                                <h3 class="listing-title">${listing.title}</h3>
                                <p class="listing-description">${listing.description.length > 52
                    ? listing.description.substring(0, 52) + '...'
                    : listing.description}</p>
                                <div class="listing-price">$${parseFloat(listing.price).toFixed(2)}</div>
                                <div class="listing-date">
                                    <i class='bx bx-calendar'></i>
                                    Listed on ${formattedDate}
                                </div>
                                ${listing.status !== 'sold_out' ? `
                                <div class="listing-quantity">
                                    <i class='bx bx-box'></i>
                                    ${listing.quantity} in stock
                                </div>
                                ` : ''}
                                <div class="listing-actions">
                                    ${listing.status !== 'sold_out' ? `
                                    <button class="edit-btn" data-id="${listing.id}">
                                        <i class='bx bx-edit'></i> Edit
                                    </button>
                                    ` : ''}
                                    <button class="remove-btn" data-id="${listing.id}">
                                        <i class='bx bx-trash'></i> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    }

    renderSoldTab() {
        if (this.soldItems.length === 0) {
            return `
                <div class="no-listings">
                    <div class="no-listings-icon">
                        <i class='bx bx-check-circle'></i>
                    </div>
                    <h3>No Sold Items Yet</h3>
                    <p>Items you've successfully sold will appear here.</p>
                </div>
            `;
        }

        return `
            <div class="listings-grid">
                ${this.soldItems.map(item => {
            const dateSold = new Date(item.dateSold);
            const formattedDate = dateSold.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            const rawImageFromSoldItem = item.images && item.images.length > 0 && item.images[0] ? item.images[0] : null;
            let finalImageUrl;

            if (rawImageFromSoldItem) {
                if (rawImageFromSoldItem.startsWith('http')) {
                    finalImageUrl = rawImageFromSoldItem;
                } else if (rawImageFromSoldItem.includes('uploads/')) {
                    finalImageUrl = '../' + rawImageFromSoldItem;
                } else if (rawImageFromSoldItem && !rawImageFromSoldItem.includes('/')) {
                    finalImageUrl = '../uploads/products/' + rawImageFromSoldItem;
                } else {
                    finalImageUrl = '../backend/' + rawImageFromSoldItem;
                }
            } else {
                finalImageUrl = '../assets/images/products-images/placeholder.svg';
            }

            return `
                        <div class="listing-card sold" data-id="${item.id}" data-product-id="${item.productId}">
                            <div class="listing-image">
                                <img src="${finalImageUrl}" alt="${item.title}">
                            </div>
                            <div class="listing-info">
                                <h3 class="listing-title">${item.title}</h3>
                                <p class="listing-description">${item.description && item.description.length > 52
                ? item.description.substring(0, 52) + '...'
                : item.description || ''}</p>
                                <div class="listing-price">Sold for: $${parseFloat(item.price).toFixed(2)}</div>
                                <div class="listing-date">
                                    <i class='bx bx-calendar-check'></i>
                                    Sold on ${formattedDate}
                                </div>
                                ${item.buyerUsername && item.buyerUsername !== 'N/A' ? `
                                <div class="listing-buyer">
                                    <i class='bx bx-user'></i>
                                    Buyer: ${item.buyerUsername}
                                </div>` : ''}
                                <div class="listing-actions">
                                    <button class="view-order-btn" data-order-id="${item.orderId}">
                                        <i class='bx bx-receipt'></i> View Order
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    }

    setupEventListeners() {
        document.addEventListener('click', e => {
            const tabButton = e.target.closest('.tab-button');
            if (tabButton) {
                this.activeTab = tabButton.dataset.tab;
                this.isEditing = false;
                this.editingListing = null;
                this.render();
            }

            if (e.target.closest('.create-listing-btn-empty')) {
                this.activeTab = 'create';
                this.isEditing = false;
                this.editingListing = null;
                this.imageFiles = [];
                this.render();
            }

            if (e.target.closest('.edit-btn')) {
                const listingId = parseInt(e.target.closest('.edit-btn').dataset.id);
                this.editListing(listingId);
            }

            if (e.target.closest('.remove-btn')) {
                const listingId = parseInt(e.target.closest('.remove-btn').dataset.id);
                this.removeListing(listingId);
            }

            if (e.target.closest('.view-order-btn')) {
                const orderId = e.target.closest('.view-order-btn').dataset.orderId;
                console.log("View Order ID:", orderId);
                alert(`Placeholder: View details for Order ID: ${orderId}. You would typically open a modal or navigate.`);
            }
        });
    }

    setupCreateTabEventListeners() {
        const categorySelect = document.getElementById('category-select');
        const categoryOptions = document.getElementById('category-options');
        const selectedCategory = document.getElementById('selected-category');
        const otherCategoryContainer = document.getElementById('other-category-container');

        if (categorySelect && categoryOptions) {
            categorySelect.addEventListener('click', () => {
                categorySelect.classList.toggle('active');
                categoryOptions.classList.toggle('active');
            });

            const categoryItems = categoryOptions.querySelectorAll('.fancy-option');
            categoryItems.forEach(item => {
                item.addEventListener('click', () => {
                    const value = item.dataset.value;
                    selectedCategory.textContent = item.querySelector('span:last-child').textContent;
                    categoryItems.forEach(opt => opt.classList.remove('selected'));
                    item.classList.add('selected');
                    otherCategoryContainer.classList.toggle('active', value === 'other');
                    categorySelect.classList.remove('active');
                    categoryOptions.classList.remove('active');
                });
            });
        }

        const conditionSelect = document.getElementById('condition-select');
        const conditionOptions = document.getElementById('condition-options');
        const selectedCondition = document.getElementById('selected-condition');

        if (conditionSelect && conditionOptions) {
            conditionSelect.addEventListener('click', () => {
                conditionSelect.classList.toggle('active');
                conditionOptions.classList.toggle('active');
            });
            const conditionItems = conditionOptions.querySelectorAll('.fancy-option');
            conditionItems.forEach(item => {
                item.addEventListener('click', () => {
                    selectedCondition.textContent = item.querySelector('span:last-child').textContent;
                    conditionItems.forEach(opt => opt.classList.remove('selected'));
                    item.classList.add('selected');
                    conditionSelect.classList.remove('active');
                    conditionOptions.classList.remove('active');
                });
            });
        }

        const brandSelect = document.getElementById('brand-select');
        const brandOptions = document.getElementById('brand-options');
        const selectedBrand = document.getElementById('selected-brand');
        const otherBrandContainer = document.getElementById('other-brand-container');

        if (brandSelect && brandOptions) {
            brandSelect.addEventListener('click', () => {
                brandSelect.classList.toggle('active');
                brandOptions.classList.toggle('active');
            });
            const brandItems = brandOptions.querySelectorAll('.fancy-option');
            brandItems.forEach(item => {
                item.addEventListener('click', () => {
                    const value = item.dataset.value;
                    selectedBrand.textContent = item.querySelector('span:last-child').textContent;
                    brandItems.forEach(opt => opt.classList.remove('selected'));
                    item.classList.add('selected');
                    otherBrandContainer.classList.toggle('active', value === 'other');
                    brandSelect.classList.remove('active');
                    brandOptions.classList.remove('active');
                });
            });
        }

        const listingOptions = document.querySelectorAll('.listing-option');
        listingOptions.forEach(option => {
            option.addEventListener('click', () => {
                listingOptions.forEach(opt => {
                    opt.classList.remove('selected');
                    opt.querySelector('.radio-dot').classList.remove('selected');
                });
                option.classList.add('selected');
                option.querySelector('.radio-dot').classList.add('selected');
            });
        });

        const imageUploadArea = document.getElementById('image-upload-area');
        const imageUploadInput = document.getElementById('image-upload');
        const imagePreviewContainer = document.getElementById('image-preview-container');

        if (imageUploadArea && imageUploadInput) {
            imageUploadArea.addEventListener('click', () => {
                imageUploadInput.click();
            });
            imageUploadInput.addEventListener('change', () => {
                this.handleImageUpload(imageUploadInput, imagePreviewContainer);
            });
        }

        document.addEventListener('click', e => {
            if (e.target.closest('.remove-image-btn')) {
                const imagePreview = e.target.closest('.image-preview');
                if (imagePreview) {
                    const imgSrc = imagePreview.querySelector('img').src;
                    if (this.editingListing && this.editingListing.images) {
                        this.editingListing.images = this.editingListing.images.filter(url => url !== imgSrc);
                    }
                    this.imageFiles = this.imageFiles.filter(file => file.previewUrl !== imgSrc);
                    imagePreview.remove();
                }
            }
        });


        const saveDraftBtn = document.querySelector('.save-draft-btn');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => {
                if (this.isEditing) {
                    this.updateListing(this.editingListing.id, true);
                } else {
                    this.saveListing('draft');
                }
            });
        }

        const publishBtn = document.querySelector('.publish-btn');
        if (publishBtn) {
            publishBtn.addEventListener('click', () => {
                this.saveListing('publish');
            });
        }

        const updateListingBtn = document.querySelector('.update-listing-btn');
        if (updateListingBtn) {
            updateListingBtn.addEventListener('click', () => {
                this.updateListing(this.editingListing.id);
            });
        }

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.fancy-select-container')) {
                document.querySelectorAll('.fancy-select-options.active').forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
                document.querySelectorAll('.fancy-select.active').forEach(select => {
                    select.classList.remove('active');
                });
            }
        });
    }

    handleImageUpload(inputElement, previewContainer) {
        const files = inputElement.files;
        if (!files || files.length === 0) return;

        const maxImages = 8;
        const currentImageCount = previewContainer.querySelectorAll('.image-preview').length + this.imageFiles.length;

        if (currentImageCount >= maxImages) {
            alert(`Maximum ${maxImages} images allowed.`);
            inputElement.value = '';
            return;
        }

        const filesToProcess = Array.from(files).slice(0, maxImages - currentImageCount);

        filesToProcess.forEach(file => {
            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const previewUrl = e.target.result;
                this.imageFiles.push({ file, previewUrl });

                const imagePreviewDiv = document.createElement('div');
                imagePreviewDiv.className = 'image-preview';
                imagePreviewDiv.innerHTML = `
                    <img src="${previewUrl}" alt="Product image">
                    <button type="button" class="remove-image-btn"><i class='bx bx-x'></i></button>
                `;
                previewContainer.appendChild(imagePreviewDiv);
            };
            reader.readAsDataURL(file);
        });
        inputElement.value = '';
    }

    async saveListing(type) {
        const formData = new FormData();

        formData.append('title', document.getElementById('product-title').value);
        formData.append('description', document.getElementById('product-description').value);
        formData.append('price', document.getElementById('product-price').value);
        formData.append('quantity', document.getElementById('product-quantity').value);

        const categoryOption = document.querySelector('#category-options .fancy-option.selected');
        let category = categoryOption ? categoryOption.dataset.value : '';
        if (category === 'other') category = document.getElementById('other-category').value;
        formData.append('category', category);

        const brandOption = document.querySelector('#brand-options .fancy-option.selected');
        let brand = brandOption ? brandOption.dataset.value : '';
        if (brand === 'other') brand = document.getElementById('other-brand').value;
        formData.append('brand', brand);

        const conditionOption = document.querySelector('#condition-options .fancy-option.selected');
        const condition = conditionOption ? conditionOption.dataset.value : '';
        formData.append('condition', condition);

        formData.append('model', document.getElementById('product-model').value);

        const selectedListingOption = document.querySelector('.listing-option.selected');
        const listingOptionValue = selectedListingOption ? selectedListingOption.dataset.option : 'shipping';
        formData.append('shipping', listingOptionValue === 'shipping' || listingOptionValue === 'both');
        formData.append('localPickup', listingOptionValue === 'pickup' || listingOptionValue === 'both');
        formData.append('status', type === 'draft' ? 'draft' : 'active');

        this.imageFiles.forEach((imgData, index) => {
            formData.append(`images[${index}]`, imgData.file);
        });

        if (!formData.get('title') || !formData.get('category') || !formData.get('condition') ||
            !formData.get('description') || !formData.get('price') || !formData.get('brand') ||
            !formData.get('model') || !formData.get('quantity') || parseInt(formData.get('quantity')) < 0) {
            alert('Please fill in all required fields. Quantity cannot be negative.');
            return;
        }

        try {
            const response = await fetch('../backend/api/listings/create_listing.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                await this.loadListings();
                alert('Listing created successfully!');
                this.imageFiles = [];
                this.activeTab = 'active';
                this.render();
            } else {
                throw new Error(data.message || 'Failed to create listing');
            }
        } catch (error) {
            console.error('Error creating listing:', error);
            alert('Error creating listing: ' + error.message);
        }
    }


    editListing(listingId) {
        const listingToEdit = this.listings.find(listing => listing.id === listingId);
        if (listingToEdit) {
            this.editingListing = { ...listingToEdit };
            this.isEditing = true;
            this.activeTab = 'create';
            this.imageFiles = [];
            this.render();
        } else {
            console.error("Listing not found for editing:", listingId);
        }
    }

    async updateListing(listingId, asDraft = false) {
        const title = document.getElementById('product-title').value;
        const categoryOption = document.querySelector('#category-options .fancy-option.selected');
        let category = categoryOption ? categoryOption.dataset.value : '';
        if (category === 'other') category = document.getElementById('other-category').value;

        const conditionOption = document.querySelector('#condition-options .fancy-option.selected');
        const condition = conditionOption ? conditionOption.dataset.value : '';
        const description = document.getElementById('product-description').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const quantity = parseInt(document.getElementById('product-quantity').value);

        const brandOption = document.querySelector('#brand-options .fancy-option.selected');
        let brand = brandOption ? brandOption.dataset.value : '';
        if (brand === 'other') brand = document.getElementById('other-brand').value;
        const model = document.getElementById('product-model').value;

        const selectedListingOption = document.querySelector('.listing-option.selected');
        const listingOptionValue = selectedListingOption ? selectedListingOption.dataset.option : 'shipping';
        const shipping = listingOptionValue === 'shipping' || listingOptionValue === 'both';
        const localPickup = listingOptionValue === 'pickup' || listingOptionValue === 'both';

        if (!title || !category || !condition || !description || isNaN(price) || price <= 0 || !brand || !model || isNaN(quantity) || quantity < 0) {
            alert('Please fill in all required fields. Price must be positive. Quantity cannot be negative.');
            return;
        }

        const formData = new FormData();
        formData.append('listing_id', listingId);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('category', category);
        formData.append('condition', condition);
        formData.append('brand', brand);
        formData.append('model', model);
        formData.append('quantity', quantity);
        formData.append('shipping', shipping);
        formData.append('localPickup', localPickup);
        formData.append('status', asDraft ? 'draft' : (quantity === 0 ? 'sold_out' : 'active'));

        const existingImageElements = document.querySelectorAll('#image-preview-container .image-preview img');
        const existingImageUrls = Array.from(existingImageElements)
            .map(img => img.src)
            .filter(src => !src.startsWith('data:'));
        existingImageUrls.forEach(url => formData.append('existing_images[]', url));

        this.imageFiles.forEach((imgData, index) => {
            formData.append(`new_images[${index}]`, imgData.file);
        });


        try {
            const response = await fetch('../backend/api/listings/update_listing.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                await this.loadListings();
                alert('Listing updated successfully!');
                this.editingListing = null;
                this.isEditing = false;
                this.imageFiles = [];
                this.activeTab = 'active';
                this.render();
            } else {
                throw new Error(data.message || 'Failed to update listing');
            }
        } catch (error) {
            console.error('Error updating listing:', error);
            alert('Error updating listing: ' + error.message);
        }
    }

    async removeListing(listingId) {
        if (confirm('Are you sure you want to remove this listing?')) {
            try {
                const formData = new FormData();
                formData.append('listing_id', listingId);

                const response = await fetch('../backend/api/listings/delete_listing.php', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    this.listings = this.listings.filter(item => item.id !== listingId);
                    this.render();
                    this.showNotification({
                        id: listingId,
                        title: 'Listing removed successfully'
                    });
                } else {
                    throw new Error(data.message || 'Failed to delete listing');
                }
            } catch (error) {
                console.error('Error deleting listing:', error);
                alert('Error deleting listing: ' + error.message);
            }
        }
    }

    showNotification(notificationData) {
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        const notification = document.createElement('div');
        notification.className = 'notification fade-in';
        notification.dataset.id = notificationData.id || Date.now();
        const iconClass = notificationData.type === 'error' ? 'bx-error-circle' : 'bx-check-circle';
        const titleText = notificationData.title || 'Success';
        const messageText = notificationData.message || 'Operation completed.';


        notification.innerHTML = `
            <div class="notification-content">
                <i class='bx ${iconClass} notification-icon ${notificationData.type === 'error' ? 'error' : ''}'></i>
                <div class="notification-text">
                    <p class="notification-title">${titleText}</p>
                    <p>${messageText}</p>
                </div>
                <button class="close-notification-btn">
                    <i class='bx bx-x'></i>
                </button>
            </div>
            <div class="notification-progress"></div>
        `;

        container.appendChild(notification);

        setTimeout(() => {
            this.removeNotification(notification.dataset.id);
        }, 5000);

        const closeBtn = notification.querySelector('.close-notification-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.removeNotification(notification.dataset.id);
            });
        }
    }

    removeNotification(id) {
        const notification = document.querySelector(`.notification[data-id="${id}"]`);
        if (notification) {
            notification.classList.remove('fade-in');
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
                if (!document.querySelector('.notification-container .notification')) {
                    document.querySelector('.notification-container')?.remove();
                }
            }, 300);
        }
    }

    viewSoldItemDetails(itemId) {
        const item = this.soldItems.find(i => i.id === itemId);
        if (item) {
            alert(`
                Title: ${item.title}
                Price: $${item.price.toFixed(2)}
                Date Sold: ${new Date(item.dateSold).toLocaleDateString()}
                
                This is a placeholder for a detailed view of sold item.
            `);
        }
    }

    getCategoryDisplayName(value) {
        const categories = {
            'smartphones': 'Smartphones',
            'laptops': 'Laptops',
            'tablets': 'Tablets',
            'headphones': 'Headphones',
            'cameras': 'Cameras',
            'accessories': 'Accessories'
        };
        return categories[value] || value || 'Select a category';
    }

    getBrandDisplayName(value) {
        const brands = {
            'apple': 'Apple',
            'samsung': 'Samsung',
            'sony': 'Sony',
            'dell': 'Dell',
            'lenovo': 'Lenovo',
            'jbl': 'JBL',
            'canon': 'Canon'
        };
        return brands[value] || value || 'Select a brand';
    }
}