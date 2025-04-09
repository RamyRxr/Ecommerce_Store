export default class SellingContents {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.activeTab = 'create'; // Default tab
        this.listings = [];
        this.soldItems = [];
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
                        views: 48
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
                        views: 76
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
        return `
            <div class="create-listing-container">
                <div class="create-listing-form">
                    <div class="form-section">
                        <h2>Product Details</h2>
                        <p>Provide information about the item you're selling.</p>
                        
                        <div class="form-group">
                            <label for="product-title">Product Title</label>
                            <input type="text" id="product-title" placeholder="Enter product title">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="product-category">Category</label>
                                <select id="product-category">
                                    <option value="">Select a category</option>
                                    <option value="smartphones">Smartphones</option>
                                    <option value="laptops">Laptops</option>
                                    <option value="tablets">Tablets</option>
                                    <option value="headphones">Headphones</option>
                                    <option value="cameras">Cameras</option>
                                    <option value="accessories">Accessories</option>
                                    <option value="other">Other</option>
                                </select>
                                <input type="text" id="other-category" placeholder="Specify category" class="hidden">
                            </div>
                            
                            <div class="form-group">
                                <label for="product-condition">Condition</label>
                                <select id="product-condition">
                                    <option value="">Select condition</option>
                                    <option value="New">New</option>
                                    <option value="Like New">Like New</option>
                                    <option value="Excellent">Excellent</option>
                                    <option value="Good">Good</option>
                                    <option value="Used">Used</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="product-description">Description</label>
                            <textarea id="product-description" placeholder="Describe your item in detail, including any flaws or issues"></textarea>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="product-price">Price ($)</label>
                                <input type="number" id="product-price" placeholder="0.00" min="0" step="0.01">
                            </div>
                            
                            <div class="form-group">
                                <label for="product-brand">Brand</label>
                                <select id="product-brand">
                                    <option value="">Select a brand</option>
                                    <option value="apple">Apple</option>
                                    <option value="samsung">Samsung</option>
                                    <option value="sony">Sony</option>
                                    <option value="dell">Dell</option>
                                    <option value="lenovo">Lenovo</option>
                                    <option value="jbl">JBL</option>
                                    <option value="canon">Canon</option>
                                    <option value="other">Other</option>
                                </select>
                                <input type="text" id="other-brand" placeholder="Specify brand" class="hidden">
                            </div>
                            
                            <div class="form-group">
                                <label for="product-model">Model</label>
                                <input type="text" id="product-model" placeholder="Enter model name/number">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h2>Listing Summary</h2>
                        <div class="form-group checkbox-group">
                            <label class="checkbox-container">
                                <input type="checkbox" id="offer-shipping" checked>
                                <span class="checkmark"></span>
                                Offer Shipping
                            </label>
                            
                            <label class="checkbox-container">
                                <input type="checkbox" id="local-pickup">
                                <span class="checkmark"></span>
                                Local Pickup
                            </label>
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
                            <div class="image-preview-container" id="image-preview-container"></div>
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
                        <button class="save-draft-btn">
                            <i class='bx bx-save'></i>
                            Save as Draft
                        </button>
                        <button class="publish-btn">
                            <i class='bx bx-upload'></i>
                            Publish Listing
                        </button>
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

            return `
                        <div class="listing-card" data-id="${listing.id}">
                            <div class="listing-image">
                                <img src="${listing.images[0]}" alt="${listing.title}">
                                <span class="views-count">
                                    <i class='bx bx-show'></i>
                                    ${listing.views} views
                                </span>
                            </div>
                            <div class="listing-info">
                                <h3 class="listing-title">${listing.title}</h3>
                                <p class="listing-description">${listing.description.length > 52 ?
                    listing.description.substring(0, 52) + '...' :
                    listing.description}</p>
                                <div class="listing-meta">
                                    <div class="listing-price">$${listing.price.toFixed(2)}</div>
                                    <div class="listing-date">Listed on ${formattedDate}</div>
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
                                <p class="listing-description">${item.description.length > 52 ?
                    item.description.substring(0, 52) + '...' :
                    item.description}</p>
                                <div class="listing-meta">
                                    <div class="listing-price">$${item.price.toFixed(2)}</div>
                                    <div class="listing-date">Sold on ${formattedDate}</div>
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
        // Setup category selection event listener
        const categorySelect = document.getElementById('product-category');
        const otherCategoryInput = document.getElementById('other-category');

        if (categorySelect && otherCategoryInput) {
            categorySelect.addEventListener('change', () => {
                if (categorySelect.value === 'other') {
                    otherCategoryInput.classList.remove('hidden');
                } else {
                    otherCategoryInput.classList.add('hidden');
                }
            });
        }

        // Setup brand selection event listener
        const brandSelect = document.getElementById('product-brand');
        const otherBrandInput = document.getElementById('other-brand');

        if (brandSelect && otherBrandInput) {
            brandSelect.addEventListener('change', () => {
                if (brandSelect.value === 'other') {
                    otherBrandInput.classList.remove('hidden');
                } else {
                    otherBrandInput.classList.add('hidden');
                }
            });
        }

        // Setup image upload area
        const imageUploadArea = document.getElementById('image-upload-area');
        const imageUploadInput = document.getElementById('image-upload');
        const imagePreviewContainer = document.getElementById('image-preview-container');

        if (imageUploadArea && imageUploadInput && imagePreviewContainer) {
            imageUploadArea.addEventListener('click', () => {
                imageUploadInput.click();
            });

            imageUploadInput.addEventListener('change', () => {
                this.handleImageUpload(imageUploadInput, imagePreviewContainer);
            });
        }

        // Setup form action buttons
        const saveDraftBtn = document.querySelector('.save-draft-btn');
        const publishBtn = document.querySelector('.publish-btn');

        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => {
                this.saveListing('draft');
            });
        }

        if (publishBtn) {
            publishBtn.addEventListener('click', () => {
                this.saveListing('publish');
            });
        }
    }

    handleImageUpload(inputElement, previewContainer) {
        const files = inputElement.files;
        if (!files || files.length === 0) return;

        // Clear existing previews if needed
        // previewContainer.innerHTML = '';

        // Limit to 8 images
        const maxImages = 8;
        const existingImages = previewContainer.querySelectorAll('.image-preview').length;
        const filesToProcess = Math.min(files.length, maxImages - existingImages);

        for (let i = 0; i < filesToProcess; i++) {
            const file = files[i];

            // Create a preview element
            const previewElement = document.createElement('div');
            previewElement.className = 'image-preview';

            // Add a remove button
            const removeButton = document.createElement('button');
            removeButton.className = 'remove-image-btn';
            removeButton.innerHTML = '<i class="bx bx-x"></i>';
            removeButton.addEventListener('click', () => {
                previewElement.remove();
            });

            // Create an image element
            const img = document.createElement('img');
            const reader = new FileReader();

            reader.onload = function (e) {
                img.src = e.target.result;
            };

            reader.readAsDataURL(file);

            previewElement.appendChild(img);
            previewElement.appendChild(removeButton);
            previewContainer.appendChild(previewElement);
        }
    }

    saveListing(type) {
        // Get form values
        const title = document.getElementById('product-title').value;
        const category = document.getElementById('product-category').value;
        const otherCategory = document.getElementById('other-category').value;
        const condition = document.getElementById('product-condition').value;
        const description = document.getElementById('product-description').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const brand = document.getElementById('product-brand').value;
        const otherBrand = document.getElementById('other-brand').value;
        const model = document.getElementById('product-model').value;
        const shipping = document.getElementById('offer-shipping').checked;
        const localPickup = document.getElementById('local-pickup').checked;

        // Validate form (basic validation)
        if (!title || (!category || (category === 'other' && !otherCategory)) || !condition ||
            !description || isNaN(price) || price <= 0 ||
            (!brand || (brand === 'other' && !otherBrand)) || !model) {
            alert('Please fill in all required fields');
            return;
        }

        // Get uploaded image previews (in a real app, you'd upload these to a server)
        const imagePreviews = document.querySelectorAll('#image-preview-container .image-preview img');
        if (imagePreviews.length === 0) {
            alert('Please upload at least one image');
            return;
        }

        // For demo purposes, we'll just use placeholder images
        const images = [];
        if (category === 'smartphones') {
            images.push("../assets/images/products-images/product-2.svg");
        } else if (category === 'laptops') {
            images.push("../assets/images/products-images/product-3.svg");
        } else if (category === 'tablets') {
            images.push("../assets/images/products-images/product-4.svg");
        } else if (category === 'headphones') {
            images.push("../assets/images/products-images/product-1.svg");
        } else if (category === 'cameras') {
            images.push("../assets/images/products-images/product-5.svg");
        } else {
            images.push("../assets/images/products-images/product-6.svg");
        }

        // Create a new listing object
        const newListing = {
            id: Date.now(), // Use timestamp as ID
            title,
            description,
            price,
            category: category === 'other' ? otherCategory : category,
            condition,
            brand: brand === 'other' ? otherBrand : brand,
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
        const listing = this.listings.find(item => item.id === listingId);
        if (!listing) return;

        // Switch to create tab but in edit mode
        this.activeTab = 'create';
        this.render();

        // Populate form with listing data
        document.getElementById('product-title').value = listing.title;

        const categorySelect = document.getElementById('product-category');
        const otherCategoryInput = document.getElementById('other-category');

        // Set category
        if (['smartphones', 'laptops', 'tablets', 'headphones', 'cameras', 'accessories'].includes(listing.category)) {
            categorySelect.value = listing.category;
            otherCategoryInput.classList.add('hidden');
        } else {
            categorySelect.value = 'other';
            otherCategoryInput.value = listing.category;
            otherCategoryInput.classList.remove('hidden');
        }

        document.getElementById('product-condition').value = listing.condition;
        document.getElementById('product-description').value = listing.description;
        document.getElementById('product-price').value = listing.price;

        const brandSelect = document.getElementById('product-brand');
        const otherBrandInput = document.getElementById('other-brand');

        // Set brand
        if (['apple', 'samsung', 'sony', 'dell', 'lenovo', 'jbl', 'canon'].includes(listing.brand)) {
            brandSelect.value = listing.brand;
            otherBrandInput.classList.add('hidden');
        } else {
            brandSelect.value = 'other';
            otherBrandInput.value = listing.brand;
            otherBrandInput.classList.remove('hidden');
        }

        document.getElementById('product-model').value = listing.model;
        document.getElementById('offer-shipping').checked = listing.shipping;
        document.getElementById('local-pickup').checked = listing.localPickup;

        // Add image preview
        const imagePreviewContainer = document.getElementById('image-preview-container');
        if (imagePreviewContainer) {
            // Clear existing previews
            imagePreviewContainer.innerHTML = '';

            // Add previews for each image
            listing.images.forEach(imgSrc => {
                const previewElement = document.createElement('div');
                previewElement.className = 'image-preview';

                const removeButton = document.createElement('button');
                removeButton.className = 'remove-image-btn';
                removeButton.innerHTML = '<i class="bx bx-x"></i>';
                removeButton.addEventListener('click', () => {
                    previewElement.remove();
                });

                const img = document.createElement('img');
                img.src = imgSrc;

                previewElement.appendChild(img);
                previewElement.appendChild(removeButton);
                imagePreviewContainer.appendChild(previewElement);
            });
        }

        // Replace save buttons with update button
        const formActions = document.querySelector('.form-actions');
        if (formActions) {
            formActions.innerHTML = `
                <button class="save-draft-btn">
                    <i class='bx bx-save'></i>
                    Save as Draft
                </button>
                <button class="update-listing-btn" data-id="${listingId}">
                    <i class='bx bx-refresh'></i>
                    Update Listing
                </button>
            `;

            const updateBtn = document.querySelector('.update-listing-btn');
            if (updateBtn) {
                updateBtn.addEventListener('click', () => {
                    this.updateListing(listingId);
                });
            }

            const saveDraftBtn = document.querySelector('.save-draft-btn');
            if (saveDraftBtn) {
                saveDraftBtn.addEventListener('click', () => {
                    this.updateListing(listingId, true);
                });
            }
        }
    }

    updateListing(listingId, asDraft = false) {
        // Find the listing index
        const index = this.listings.findIndex(item => item.id === listingId);
        if (index === -1) return;

        // Get form values (similar to saveListing)
        // ...same form validation as in saveListing method

        const title = document.getElementById('product-title').value;
        const category = document.getElementById('product-category').value;
        const otherCategory = document.getElementById('other-category').value;
        const condition = document.getElementById('product-condition').value;
        const description = document.getElementById('product-description').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const brand = document.getElementById('product-brand').value;
        const otherBrand = document.getElementById('other-brand').value;
        const model = document.getElementById('product-model').value;
        const shipping = document.getElementById('offer-shipping').checked;
        const localPickup = document.getElementById('local-pickup').checked;

        // Basic validation
        if (!title || (!category || (category === 'other' && !otherCategory)) || !condition ||
            !description || isNaN(price) || price <= 0 ||
            (!brand || (brand === 'other' && !otherBrand)) || !model) {
            alert('Please fill in all required fields');
            return;
        }

        // Update the listing (keep original images, ID, and view count)
        this.listings[index] = {
            ...this.listings[index], // Keep original properties
            title,
            description,
            price,
            category: category === 'other' ? otherCategory : category,
            condition,
            brand: brand === 'other' ? otherBrand : brand,
            model,
            shipping,
            localPickup,
            status: asDraft ? 'draft' : 'active'
        };

        // Save to localStorage
        localStorage.setItem('activeListings', JSON.stringify(this.listings));

        // Show confirmation
        alert('Listing updated successfully!');

        // Switch back to active listings tab
        this.activeTab = 'active';
        this.render();
    }

    removeListing(listingId) {
        // Find the listing
        const index = this.listings.findIndex(item => item.id === listingId);
        if (index === -1) return;

        // Store the listing for undo functionality
        const removedListing = this.listings[index];

        // Remove from listings array
        this.listings.splice(index, 1);

        // Save to localStorage
        localStorage.setItem('activeListings', JSON.stringify(this.listings));

        // Update the UI
        this.render();

        // Show notification with undo option
        this.showNotification(removedListing);
    }

    showNotification(listing) {
        // Create notification container if it doesn't exist
        let notificationContainer = document.querySelector('.notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-container global-notification-container';
            document.body.appendChild(notificationContainer);
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification fade-in';
        notification.dataset.id = listing.id;

        notification.innerHTML = `
            <div class="notification-content">
                <i class='bx bx-check-circle notification-icon'></i>
                <div class="notification-text">
                    <p>"${listing.title}" removed from listings</p>
                    <button class="undo-btn" data-id="${listing.id}">Undo</button>
                    <span class="notification-time">5s</span>
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
            void progressBar.offsetWidth; // Force reflow
            progressBar.style.width = '100%';
            setTimeout(() => {
                progressBar.style.width = '0%';
            }, 50);
        }

        // Update countdown timer
        const timeDisplay = notification.querySelector('.notification-time');
        let timeLeft = 5;
        const timerInterval = setInterval(() => {
            timeLeft--;
            if (timeDisplay) timeDisplay.textContent = `${timeLeft}s`;
            if (timeLeft <= 0) clearInterval(timerInterval);
        }, 1000);

        // Set timeout to permanently delete
        const deleteTimeout = setTimeout(() => {
            this.removeNotification(listing.id);
            clearInterval(timerInterval);
        }, 5000);

        // Add event listeners for the notification
        notification.querySelector('.close-notification-btn').addEventListener('click', () => {
            clearTimeout(deleteTimeout);
            clearInterval(timerInterval);
            this.removeNotification(listing.id);
        });

        notification.querySelector('.undo-btn').addEventListener('click', () => {
            this.undoRemove(listing, deleteTimeout, timerInterval);
        });
    }

    undoRemove(listing, timeout, interval) {
        // Clear timeouts
        clearTimeout(timeout);
        clearInterval(interval);

        // Add listing back
        this.listings.push(listing);

        // Sort by date added (newest first)
        this.listings.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));

        // Save to localStorage
        localStorage.setItem('activeListings', JSON.stringify(this.listings));

        // Remove notification
        this.removeNotification(listing.id);

        // Re-render UI
        this.render();
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
        const item = this.soldItems.find(item => item.id === itemId);
        if (!item) return;

        // In a real app, you would show a modal or navigate to a details page
        // For now, we'll just display an alert
        alert(`
            Item: ${item.title}
            Price: $${item.price}
            Condition: ${item.condition}
            Description: ${item.description}
            Sold Date: ${new Date(item.dateSold).toLocaleDateString()}
        `);
    }
}
