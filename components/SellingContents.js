export default class SellingContents {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.activeTab = 'create';
        this.listings = [];
        this.soldItems = [];
        this.editingListingId = null;
        this.init();
    }

    async init() {
        await this.loadListings();
        this.render();
        this.setupEventListeners();
    }

    async loadListings() {
        try {
            // Load active listings from localStorage
            const activeListingsJson = localStorage.getItem('activeListings');
            if (activeListingsJson) {
                this.listings = JSON.parse(activeListingsJson);
            } else {
                // Demo data if no listings exist
                this.listings = [
                    {
                        id: 1,
                        title: "iPhone 13 Pro",
                        description: "Excellent condition iPhone 13 Pro, 256GB storage, graphite color, with original box and accessories.",
                        price: 799.99,
                        category: "smartphones",
                        condition: "Excellent",
                        brand: "apple",
                        model: "iPhone 13 Pro",
                        images: ["../assets/images/products-images/product-2.svg"],
                        shipping: true,
                        localPickup: false,
                        dateAdded: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                        views: 48,
                        status: 'active'
                    },
                    {
                        id: 2,
                        title: "MacBook Pro 16\" 2021",
                        description: "Like new MacBook Pro 16\" with M1 Pro chip, 16GB RAM, 512GB SSD. Space gray with AppleCare+ until 2024.",
                        price: 2199.99,
                        category: "laptops",
                        condition: "Like New",
                        brand: "apple",
                        model: "MacBook Pro 16\" 2021",
                        images: ["../assets/images/products-images/product-3.svg"],
                        shipping: true,
                        localPickup: true,
                        dateAdded: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                        views: 76,
                        status: 'active'
                    }
                ];
                localStorage.setItem('activeListings', JSON.stringify(this.listings));
            }

            // Load sold items from localStorage
            const soldItemsJson = localStorage.getItem('soldListings');
            if (soldItemsJson) {
                this.soldItems = JSON.parse(soldItemsJson);
            } else {
                // Demo data if no sold items exist
                this.soldItems = [
                    {
                        id: 3,
                        title: "Sony WH-1000XM4",
                        description: "Noise-cancelling headphones in perfect condition with case and all accessories.",
                        price: 249.99,
                        category: "headphones",
                        condition: "Excellent",
                        brand: "sony",
                        model: "WH-1000XM4",
                        images: ["../assets/images/products-images/product-1.svg"],
                        shipping: true,
                        localPickup: false,
                        dateSold: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
                    }
                ];
                localStorage.setItem('soldListings', JSON.stringify(this.soldItems));
            }
        } catch (error) {
            console.error('Error loading listings:', error);
            this.listings = [];
            this.soldItems = [];
        }
    }

    render() {
        const sellingContentHTML = `
            <div class="selling-content">
                <div class="main-content-container">
                    <div class="selling-header">
                        <h1>Sell Your Tech</h1>
                        <p>${this.listings.length} Active Listings</p>
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

        // Check if selling content already exists
        const existingSellingContent = document.querySelector('.selling-content');
        if (existingSellingContent) {
            existingSellingContent.replaceWith(sellingContentContainer.firstElementChild);
        } else {
            this.container.appendChild(sellingContentContainer.firstElementChild);
        }

        // Set up tab-specific event listeners
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
        const isEditing = this.editingListingId !== null;
        let editingListing = null;
        
        if (isEditing) {
            editingListing = this.listings.find(listing => listing.id === this.editingListingId);
            if (!editingListing) {
                this.editingListingId = null;
            }
        }

        return `
            <div class="create-listing-container">
                <div class="create-listing-form">
                    <div class="form-section">
                        <h2>Product Details</h2>
                        <p>Provide information about the item you're selling.</p>
                        
                        <div class="form-group">
                            <label for="product-title">Product Title</label>
                            <input type="text" id="product-title" placeholder="Enter product title" value="${isEditing && editingListing ? editingListing.title : ''}">
                        </div>
                        
                        <div class="form-row">
                            <div class="fancy-select-container">
                                <div class="form-group">
                                    <label for="product-category">Category</label>
                                </div>
                                <button type="button" class="fancy-select" id="category-select">
                                    <span id="selected-category">${isEditing && editingListing ? this.getCategoryDisplayName(editingListing.category) : 'Select a category'}</span>
                                    <span class="fancy-select-icon">
                                        <i class='bx bx-chevron-down'></i>
                                    </span>
                                </button>
                                <div class="fancy-select-options" id="category-options">
                                    <div class="fancy-option ${isEditing && editingListing && editingListing.category === 'smartphones' ? 'selected' : ''}" data-value="smartphones">
                                        <span class="fancy-option-icon"><i class='bx bx-mobile-alt'></i></span>
                                        <span>Smartphones</span>
                                    </div>
                                    <div class="fancy-option ${isEditing && editingListing && editingListing.category === 'laptops' ? 'selected' : ''}" data-value="laptops">
                                        <span class="fancy-option-icon"><i class='bx bx-laptop'></i></span>
                                        <span>Laptops</span>
                                    </div>
                                    <div class="fancy-option ${isEditing && editingListing && editingListing.category === 'tablets' ? 'selected' : ''}" data-value="tablets">
                                        <span class="fancy-option-icon"><i class='bx bx-tablet'></i></span>
                                        <span>Tablets</span>
                                    </div>
                                    <div class="fancy-option ${isEditing && editingListing && editingListing.category === 'headphones' ? 'selected' : ''}" data-value="headphones">
                                        <span class="fancy-option-icon"><i class='bx bx-headphone'></i></span>
                                        <span>Headphones</span>
                                    </div>
                                    <div class="fancy-option ${isEditing && editingListing && editingListing.category === 'cameras' ? 'selected' : ''}" data-value="cameras">
                                        <span class="fancy-option-icon"><i class='bx bx-camera'></i></span>
                                        <span>Cameras</span>
                                    </div>
                                    <div class="fancy-option ${isEditing && editingListing && editingListing.category === 'accessories' ? 'selected' : ''}" data-value="accessories">
                                        <span class="fancy-option-icon"><i class='bx bx-plug'></i></span>
                                        <span>Accessories</span>
                                    </div>
                                    <div class="fancy-option ${isEditing && editingListing && !['smartphones', 'laptops', 'tablets', 'headphones', 'cameras', 'accessories'].includes(editingListing.category) ? 'selected' : ''}" data-value="other">
                                        <span class="fancy-option-icon"><i class='bx bx-plus-circle'></i></span>
                                        <span>Other</span>
                                    </div>
                                </div>
                                <div class="other-input-container ${isEditing && editingListing && !['smartphones', 'laptops', 'tablets', 'headphones', 'cameras', 'accessories'].includes(editingListing.category) ? 'active' : ''}" id="other-category-container">
                                    <input type="text" id="other-category" placeholder="Specify category" value="${isEditing && editingListing && !['smartphones', 'laptops', 'tablets', 'headphones', 'cameras', 'accessories'].includes(editingListing.category) ? editingListing.category : ''}">
                                </div>
                            </div>
                            
                            <div class="fancy-select-container">
                                <div class="form-group">
                                    <label for="product-condition">Condition</label>
                                </div>
                                <button type="button" class="fancy-select" id="condition-select">
                                    <span id="selected-condition">${isEditing && editingListing ? editingListing.condition : 'Select condition'}</span>
                                    <span class="fancy-select-icon">
                                        <i class='bx bx-chevron-down'></i>
                                    </span>
                                </button>
                                <div class="fancy-select-options" id="condition-options">
                                    <div class="fancy-option ${isEditing && editingListing && editingListing.condition === 'New' ? 'selected' : ''}" data-value="New">
                                        <span class="fancy-option-icon"><i class='bx bx-package'></i></span>
                                        <span>New</span>
                                    </div>
                                    <div class="fancy-option ${isEditing && editingListing && editingListing.condition === 'Like New' ? 'selected' : ''}" data-value="Like New">
                                        <span class="fancy-option-icon"><i class='bx bx-like'></i></span>
                                        <span>Like New</span>
                                    </div>
                                    <div class="fancy-option ${isEditing && editingListing && editingListing.condition === 'Excellent' ? 'selected' : ''}" data-value="Excellent">
                                        <span class="fancy-option-icon"><i class='bx bx-check-circle'></i></span>
                                        <span>Excellent</span>
                                    </div>
                                    <div class="fancy-option ${isEditing && editingListing && editingListing.condition === 'Good' ? 'selected' : ''}" data-value="Good">
                                        <span class="fancy-option-icon"><i class='bx bx-check'></i></span>
                                        <span>Good</span>
                                    </div>
                                    <div class="fancy-option ${isEditing && editingListing && editingListing.condition === 'Used' ? 'selected' : ''}" data-value="Used">
                                        <span class="fancy-option-icon"><i class='bx bx-time'></i></span>
                                        <span>Used</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="product-description">Description</label>
                            <textarea id="product-description" placeholder="Describe your item in detail, including any flaws or issues">${isEditing && editingListing ? editingListing.description : ''}</textarea>
                        </div>
                        
                        <div class="price-brand-model-row">
                            <div class="form-group">
                                <label for="product-price">Price ($)</label>
                                <input type="number" id="product-price" placeholder="0.00" min="0" step="0.01" value="${isEditing && editingListing ? editingListing.price : ''}">
                            </div>
                            
                            <div class="fancy-select-container">
                                <div class="form-group">
                                    <label for="product-brand">Brand</label>
                                </div>
                                <button type="button" class="fancy-select" id="brand-select">
                                    <span id="selected-brand">${isEditing && editingListing ? this.getBrandDisplayName(editingListing.brand) : 'Select a brand'}</span>
                                    <span class="fancy-select-icon">
                                        <i class='bx bx-chevron-down'></i>
                                    </span>
                                </button>
                                <div class="fancy-select-options" id="brand-options">
                                    <div class="fancy-option ${isEditing && editingListing && editingListing.brand === 'apple' ? 'selected' : ''}" data-value="apple">
                                        <span class="fancy-option-icon"><i class='bx bxl-apple'></i></span>
                                        <span>Apple</span>
                                    </div>
                                    <div class="fancy-option ${isEditing && editingListing && editingListing.brand === 'samsung' ? 'selected' : ''}" data-value="samsung">
                                        <span class="fancy-option-icon"><i class='bx bxs-component'></i></span>
                                        <span>Samsung</span>
                                    </div>
                                    <div class="fancy-option ${isEditing && editingListing && editingListing.brand === 'sony' ? 'selected' : ''}" data-value="sony">
                                        <span class="fancy-option-icon"><i class='bx bxs-devices'></i></span>
                                        <span>Sony</span>
                                    </div>
                                    <div class="fancy-option ${isEditing && editingListing && editingListing.brand === 'dell' ? 'selected' : ''}" data-value="dell">
                                        <span class="fancy-option-icon"><i class='bx bx-desktop'></i></span>
                                        <span>Dell</span>
                                    </div>
                                    <div class="fancy-option ${isEditing && editingListing && editingListing.brand === 'lenovo' ? 'selected' : ''}" data-value="lenovo">
                                        <span class="fancy-option-icon"><i class='bx bx-laptop'></i></span>
                                        <span>Lenovo</span>
                                    </div>
                                    <div class="fancy-option ${isEditing && editingListing && editingListing.brand === 'jbl' ? 'selected' : ''}" data-value="jbl">
                                        <span class="fancy-option-icon"><i class='bx bx-speaker'></i></span>
                                        <span>JBL</span>
                                    </div>
                                    <div class="fancy-option ${isEditing && editingListing && editingListing.brand === 'canon' ? 'selected' : ''}" data-value="canon">
                                        <span class="fancy-option-icon"><i class='bx bx-camera'></i></span>
                                        <span>Canon</span>
                                    </div>
                                    <div class="fancy-option ${isEditing && editingListing && !['apple', 'samsung', 'sony', 'dell', 'lenovo', 'jbl', 'canon'].includes(editingListing.brand) ? 'selected' : ''}" data-value="other">
                                        <span class="fancy-option-icon"><i class='bx bx-plus-circle'></i></span>
                                        <span>Other</span>
                                    </div>
                                </div>
                                <div class="other-input-container ${isEditing && editingListing && !['apple', 'samsung', 'sony', 'dell', 'lenovo', 'jbl', 'canon'].includes(editingListing.brand) ? 'active' : ''}" id="other-brand-container">
                                    <input type="text" id="other-brand" placeholder="Specify brand" value="${isEditing && editingListing && !['apple', 'samsung', 'sony', 'dell', 'lenovo', 'jbl', 'canon'].includes(editingListing.brand) ? editingListing.brand : ''}">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="product-model">Model</label>
                                <input type="text" id="product-model" placeholder="Enter model name/number" value="${isEditing && editingListing ? editingListing.model : ''}">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h2>Listing Summary</h2>
                        <div class="listing-summary-container">
                            <div class="listing-option ${isEditing && editingListing && editingListing.shipping && !editingListing.localPickup ? 'selected' : (!isEditing ? 'selected' : '')}" data-option="shipping">
                                <div class="option-radio">
                                    <div class="radio-dot ${isEditing && editingListing && editingListing.shipping && !editingListing.localPickup ? 'selected' : (!isEditing ? 'selected' : '')}"></div>
                                </div>
                                <div class="option-details">
                                    <div class="option-name">Offer Shipping</div>
                                    <div class="option-description">Ship your item to buyers nationwide</div>
                                </div>
                            </div>
                            
                            <div class="listing-option ${isEditing && editingListing && !editingListing.shipping && editingListing.localPickup ? 'selected' : ''}" data-option="pickup">
                                <div class="option-radio">
                                    <div class="radio-dot ${isEditing && editingListing && !editingListing.shipping && editingListing.localPickup ? 'selected' : ''}"></div>
                                </div>
                                <div class="option-details">
                                    <div class="option-name">Local Pickup</div>
                                    <div class="option-description">Meet buyers locally for the exchange</div>
                                </div>
                            </div>
                            
                            <div class="listing-option ${isEditing && editingListing && editingListing.shipping && editingListing.localPickup ? 'selected' : ''}" data-option="both">
                                <div class="option-radio">
                                    <div class="radio-dot ${isEditing && editingListing && editingListing.shipping && editingListing.localPickup ? 'selected' : ''}"></div>
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
                                ${isEditing && editingListing && editingListing.images ? 
                                    editingListing.images.map(img => `
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
                        ${isEditing ? `
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
        if (this.listings.length === 0) {
            return `
                <div class="no-listings">
                    <div class="no-listings-icon">
                        <i class='bx bx-package'></i>
                    </div>
                    <h3>No Active Listings</h3>
                    <p>You don't have any active listings yet. Create a new listing to start selling.</p>
                    <button class="create-listing-btn">
                        <i class='bx bx-plus-circle'></i>
                        Create New Listing
                    </button>
                </div>
            `;
        }

        return `
            <div class="listings-grid">
                ${this.listings.map(listing => {
                    const dateAdded = new Date(listing.dateAdded);
                    const formattedDate = dateAdded.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    });

                    const statusBadge = listing.status === 'draft'
                        ? `<div class="listing-status draft">Draft</div>`
                        : `<div class="listing-status active">Active</div>`;

                    return `
                        <div class="listing-card" data-id="${listing.id}">
                            <div class="listing-image">
                                <img src="${listing.images[0]}" alt="${listing.title}">
                                ${statusBadge}
                                <span class="views-count">
                                    <i class='bx bx-show'></i>
                                    ${listing.views} views
                                </span>
                            </div>
                            <div class="listing-info">
                                <h3 class="listing-title">${listing.title}</h3>
                                <p class="listing-description">${listing.description.length > 52
                                    ? listing.description.substring(0, 52) + '...'
                                    : listing.description}</p>
                                <div class="listing-price">$${listing.price.toFixed(2)}</div>
                                <div class="listing-date">
                                    <i class='bx bx-calendar'></i>
                                    Listed on ${formattedDate}
                                </div>
                                <div class="listing-actions">
                                    <button class="edit-btn" data-id="${listing.id}">
                                        <i class='bx bx-edit'></i>
                                        Edit
                                    </button>
                                    <button class="remove-btn" data-id="${listing.id}">
                                        <i class='bx bx-trash'></i>
                                        Remove
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
                    <h3>No Sold Items</h3>
                    <p>Items you've sold will appear here.</p>
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

                    return `
                        <div class="listing-card sold" data-id="${item.id}">
                            <div class="listing-image">
                                <img src="${item.images[0]}" alt="${item.title}">
                                <span class="sold-tag">SOLD</span>
                            </div>
                            <div class="listing-info">
                                <h3 class="listing-title">${item.title}</h3>
                                <p class="listing-description">${item.description.length > 52
                                    ? item.description.substring(0, 52) + '...'
                                    : item.description}</p>
                                <div class="listing-price">$${item.price.toFixed(2)}</div>
                                <div class="listing-date">
                                    <i class='bx bx-check-circle'></i>
                                    Sold on ${formattedDate}
                                </div>
                                <div class="listing-actions">
                                    <button class="view-details-btn" data-id="${item.id}">
                                        <i class='bx bx-show'></i>
                                        View Details
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
        // Tab switching
        document.addEventListener('click', e => {
            const tabButton = e.target.closest('.tab-button');
            if (tabButton) {
                this.activeTab = tabButton.dataset.tab;
                this.editingListingId = null; // Cancel editing when switching tabs
                this.render();
            }

            // Handle create new listing button in empty state
            if (e.target.closest('.create-listing-btn')) {
                this.activeTab = 'create';
                this.render();
            }

            // Handle edit listing
            if (e.target.closest('.edit-btn')) {
                const listingId = parseInt(e.target.closest('.edit-btn').dataset.id);
                this.editListing(listingId);
            }

            // Handle remove listing
            if (e.target.closest('.remove-btn')) {
                const listingId = parseInt(e.target.closest('.remove-btn').dataset.id);
                this.removeListing(listingId);
            }

            // Handle view details of sold item
            if (e.target.closest('.view-details-btn')) {
                const itemId = parseInt(e.target.closest('.view-details-btn').dataset.id);
                this.viewSoldItemDetails(itemId);
            }
        });
    }

    setupCreateTabEventListeners() {
        // Setup fancy select for category
        const categorySelect = document.getElementById('category-select');
        const categoryOptions = document.getElementById('category-options');
        const selectedCategory = document.getElementById('selected-category');
        const otherCategoryContainer = document.getElementById('other-category-container');
        const otherCategoryInput = document.getElementById('other-category');

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

                    // Highlight selected option
                    categoryItems.forEach(opt => opt.classList.remove('selected'));
                    item.classList.add('selected');

                    // Handle "Other" option
                    if (value === 'other') {
                        otherCategoryContainer.classList.add('active');
                    } else {
                        otherCategoryContainer.classList.remove('active');
                    }

                    // Close dropdown
                    categorySelect.classList.remove('active');
                    categoryOptions.classList.remove('active');
                });
            });
        }

        // Setup fancy select for condition
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

                    // Highlight selected option
                    conditionItems.forEach(opt => opt.classList.remove('selected'));
                    item.classList.add('selected');

                    // Close dropdown
                    conditionSelect.classList.remove('active');
                    conditionOptions.classList.remove('active');
                });
            });
        }

        // Setup fancy select for brand
        const brandSelect = document.getElementById('brand-select');
        const brandOptions = document.getElementById('brand-options');
        const selectedBrand = document.getElementById('selected-brand');
        const otherBrandContainer = document.getElementById('other-brand-container');
        const otherBrandInput = document.getElementById('other-brand');

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

                    // Highlight selected option
                    brandItems.forEach(opt => opt.classList.remove('selected'));
                    item.classList.add('selected');

                    // Handle "Other" option
                    if (value === 'other') {
                        otherBrandContainer.classList.add('active');
                    } else {
                        otherBrandContainer.classList.remove('active');
                    }

                    // Close dropdown
                    brandSelect.classList.remove('active');
                    brandOptions.classList.remove('active');
                });
            });
        }

        // Setup listing options (shipping/pickup)
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

        // Image upload functionality
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

        // Remove image button event listener
        document.addEventListener('click', e => {
            if (e.target.closest('.remove-image-btn')) {
                const imagePreview = e.target.closest('.image-preview');
                if (imagePreview) {
                    imagePreview.remove();
                }
            }
        });

        // Save as draft button
        const saveDraftBtn = document.querySelector('.save-draft-btn');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => {
                if (this.editingListingId) {
                    this.updateListing(this.editingListingId, true); // Save as draft
                } else {
                    this.saveListing('draft');
                }
            });
        }

        // Publish button or Update listing button
        const publishBtn = document.querySelector('.publish-btn');
        if (publishBtn) {
            publishBtn.addEventListener('click', () => {
                this.saveListing('publish');
            });
        }

        const updateListingBtn = document.querySelector('.update-listing-btn');
        if (updateListingBtn) {
            updateListingBtn.addEventListener('click', () => {
                this.updateListing(this.editingListingId);
            });
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            // Check if click is outside a fancy-select component
            if (!e.target.closest('.fancy-select-container')) {
                document.querySelectorAll('.fancy-select-options').forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
                document.querySelectorAll('.fancy-select').forEach(select => {
                    select.classList.remove('active');
                });
            }
        });
    }

    handleImageUpload(inputElement, previewContainer) {
        const files = inputElement.files;
        if (!files || files.length === 0) return;

        const maxImages = 8;
        const currentImages = previewContainer.querySelectorAll('.image-preview').length;
        const allowedFiles = Math.min(files.length, maxImages - currentImages);

        if (currentImages >= maxImages) {
            alert('Maximum 8 images allowed');
            return;
        }

        for (let i = 0; i < allowedFiles; i++) {
            const file = files[i];
            if (!file.type.startsWith('image/')) continue;

            const reader = new FileReader();
            reader.onload = (e) => {
                const imagePreview = document.createElement('div');
                imagePreview.className = 'image-preview';
                imagePreview.innerHTML = `
                    <img src="${e.target.result}" alt="Product image">
                    <button type="button" class="remove-image-btn">
                        <i class='bx bx-x'></i>
                    </button>
                `;
                previewContainer.appendChild(imagePreview);
            };
            reader.readAsDataURL(file);
        }

        // Reset input so same file can be selected again
        inputElement.value = '';
    }

    saveListing(type) {
        // Get form values
        const title = document.getElementById('product-title').value;
        
        // Get category from fancy select
        const categoryOption = document.querySelector('#category-options .fancy-option.selected');
        let category = categoryOption ? categoryOption.dataset.value : '';
        if (category === 'other') {
            category = document.getElementById('other-category').value;
        }
        
        // Get condition from fancy select
        const conditionOption = document.querySelector('#condition-options .fancy-option.selected');
        const condition = conditionOption ? conditionOption.dataset.value : '';
        
        const description = document.getElementById('product-description').value;
        const price = parseFloat(document.getElementById('product-price').value);
        
        // Get brand from fancy select
        const brandOption = document.querySelector('#brand-options .fancy-option.selected');
        let brand = brandOption ? brandOption.dataset.value : '';
        if (brand === 'other') {
            brand = document.getElementById('other-brand').value;
        }
        
        const model = document.getElementById('product-model').value;
        
        // Get listing option
        const selectedListingOption = document.querySelector('.listing-option.selected');
        const listingOption = selectedListingOption ? selectedListingOption.dataset.option : 'shipping';
        
        // Determine shipping and local pickup based on listing option
        const shipping = listingOption === 'shipping' || listingOption === 'both';
        const localPickup = listingOption === 'pickup' || listingOption === 'both';
        
        // Validate form (basic validation)
        if (!title || !category || !condition ||
            !description || isNaN(price) || price <= 0 || !brand || !model) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Get uploaded image previews
        const imagePreviews = document.querySelectorAll('#image-preview-container .image-preview img');
        if (imagePreviews.length === 0) {
            alert('Please upload at least one image');
            return;
        }
        
        // Use the actual uploaded images instead of placeholders
        const images = [];
        imagePreviews.forEach(img => {
            images.push(img.src); // Store the data URL of the uploaded image
        });
        
        // Create a new listing object
        const newListing = {
            id: Date.now(), // Use timestamp as ID
            title,
            description,
            price,
            category,
            condition,
            brand,
            model,
            images,
            shipping,
            localPickup,
            dateAdded: new Date().toISOString(),
            views: 0, // Start with 0 views
            status: type === 'publish' ? 'active' : 'draft'
        };
        
        // Add to listings and save to localStorage
        this.listings.push(newListing);
        localStorage.setItem('activeListings', JSON.stringify(this.listings));
        
        // Show confirmation and reset form
        alert(type === 'publish' ? 'Listing published successfully!' : 'Listing saved as draft');
        
        // Switch to active listings tab
        this.activeTab = 'active';
        this.render();
    }

    editListing(listingId) {
        this.editingListingId = listingId;
        this.activeTab = 'create';
        this.render();
    }

    updateListing(listingId, asDraft = false) {
        // Find the listing index
        const index = this.listings.findIndex(item => item.id === listingId);
        if (index === -1) return;
        
        // Get form values (similar to saveListing)
        const title = document.getElementById('product-title').value;
        
        // Get category from fancy select
        const categoryOption = document.querySelector('#category-options .fancy-option.selected');
        let category = categoryOption ? categoryOption.dataset.value : '';
        if (category === 'other') {
            category = document.getElementById('other-category').value;
        }
        
        // Get condition from fancy select
        const conditionOption = document.querySelector('#condition-options .fancy-option.selected');
        const condition = conditionOption ? conditionOption.dataset.value : '';
        
        const description = document.getElementById('product-description').value;
        const price = parseFloat(document.getElementById('product-price').value);
        
        // Get brand from fancy select
        const brandOption = document.querySelector('#brand-options .fancy-option.selected');
        let brand = brandOption ? brandOption.dataset.value : '';
        if (brand === 'other') {
            brand = document.getElementById('other-brand').value;
        }
        
        const model = document.getElementById('product-model').value;
        
        // Get listing option
        const selectedListingOption = document.querySelector('.listing-option.selected');
        const listingOption = selectedListingOption ? selectedListingOption.dataset.option : 'shipping';
        
        // Determine shipping and local pickup based on listing option
        const shipping = listingOption === 'shipping' || listingOption === 'both';
        const localPickup = listingOption === 'pickup' || listingOption === 'both';
        
        // Basic validation
        if (!title || !category || !condition ||
            !description || isNaN(price) || price <= 0 || !brand || !model) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Get the current images from the preview container
        const imagePreviews = document.querySelectorAll('#image-preview-container .image-preview img');
        const images = Array.from(imagePreviews).map(img => img.src);
        
        // Update the listing (keep ID and view count)
        this.listings[index] = {
            ...this.listings[index], // Keep original properties
            title,
            description,
            price,
            category,
            condition,
            brand,
            model,
            shipping,
            localPickup,
            images, // Use the updated images
            status: asDraft ? 'draft' : 'active'
        };
        
        // Save to localStorage
        localStorage.setItem('activeListings', JSON.stringify(this.listings));
        
        // Show confirmation
        alert('Listing updated successfully!');
        
        // Reset editing state and switch back to active listings tab
        this.editingListingId = null;
        this.activeTab = 'active';
        this.render();
    }

    removeListing(listingId) {
        if (confirm('Are you sure you want to remove this listing?')) {
            // Find the listing
            const index = this.listings.findIndex(item => item.id === listingId);
            if (index !== -1) {
                // Remove from listings array
                this.listings.splice(index, 1);
                
                // Update localStorage
                localStorage.setItem('activeListings', JSON.stringify(this.listings));
                
                // Re-render the active listings tab
                this.render();
                
                // Show confirmation
                this.showNotification({
                    id: listingId,
                    title: 'Listing removed successfully'
                });
            }
        }
    }

    showNotification(listing) {
        // Create notification container if it doesn't exist
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification fade-in';
        notification.dataset.id = listing.id;
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class='bx bx-check-circle notification-icon'></i>
                <div class="notification-text">
                    <p>Listing removed successfully</p>
                </div>
                <button class="close-notification-btn">
                    <i class='bx bx-x'></i>
                </button>
            </div>
            <div class="notification-progress"></div>
        `;
        
        // Add to container
        container.appendChild(notification);
        
        // Set up auto-dismiss timer
        setTimeout(() => {
            this.removeNotification(listing.id);
        }, 3000);
        
        // Add event listener for close button
        const closeBtn = notification.querySelector('.close-notification-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.removeNotification(listing.id);
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
        
        return categories[value] || value;
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
        
        return brands[value] || value;
    }
}