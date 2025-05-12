# TechBay E-commerce Web Project

TechBay is a full-featured e-commerce platform designed for buying and selling tech products. It includes user authentication, product listings, shopping cart functionality, order processing, user reviews, and an administrative interface for managing products.

## 🚀 Project Overview

This project is built using a combination of frontend technologies (HTML, CSS, JavaScript) and a PHP backend with a MySQL database. It aims to provide a seamless and interactive user experience for both buyers and sellers.

## ✨ Features

*   **User Authentication**: Secure login and registration system.
*   **Product Listings**: Sellers can create, update, and manage product listings.
*   **Product Browsing & Search**: Users can explore products with filtering and search capabilities.
*   **Shopping Cart**: Persistent shopping cart for users.
*   **Saved Items**: Users can save items for later viewing.
*   **Checkout Process**: Multi-step checkout with order summary.
*   **Order History**: Users can view their past orders.
*   **Product Reviews & Ratings**: Users can review products and view ratings.
*   **User Profiles**: View and manage user profile information.
*   **Admin Functionality**: Admins have special privileges for managing listings and users.
*   **Responsive Design**: Adapts to various screen sizes.
*   **Dark Mode**: Theme preference for users.

## 📂 Installation and Setup

Follow these steps to set up and run the project locally:

1.  **Install XAMPP**:
    *   Download and install XAMPP from [Apache Friends](https://www.apachefriends.org/index.html). This will provide you with Apache (web server), MySQL (database), and PHP.
    *   During installation, ensure you select Apache and MySQL.

2.  **Clone the Repository**:
    *   Open your XAMPP installation directory (e.g., `C:\xampp`).
    *   Navigate to the `htdocs` folder (e.g., `C:\xampp\htdocs`).
    *   Clone this GitHub repository into the `htdocs` folder. You can name the project folder `Project-Web` (or as it is currently named in your setup).
        ```sh
        cd C:\xampp\htdocs
        git clone <your-repository-url> Project-Web
        ```

3.  **Start Apache and MySQL**:
    *   Open the XAMPP Control Panel.
    *   Start the **Apache** and **MySQL** modules.

4.  **Create the Database**:
    *   Open your web browser and go to `http://localhost/phpmyadmin`.
    *   Click on "New" in the left sidebar to create a new database.
    *   Enter the database name as `ecommerce_store` and click "Create".

5.  **Import the Database Schema**:
    *   Select the `ecommerce_store` database you just created in phpMyAdmin.
    *   Click on the "Import" tab.
    *   Click "Choose File" and select the `schema.sql` file located in the root of your project directory (e.g., `C:\xampp\htdocs\Project-Web\schema.sql`).
    *   Click "Go" at the bottom of the page to import the schema. This will create all the necessary tables.

6.  **Configure Database Connection (if necessary)**:
    *   The project is configured to use the username `Ramy` and password `Ramy2024` for the database `ecommerce_store` on `localhost`.
    *   If your MySQL setup uses different credentials, you will need to update them in the `backend/config/database.php` file:
        ```php
        // filepath: backend/config/database.php
        // ...
        private $host = "localhost";
        private $db_name = "ecommerce_store";
        private $username = "your_mysql_username"; // Change if needed
        private $password = "your_mysql_password"; // Change if needed
        // ...
        ```

7.  **Access the Project**:
    *   Open your web browser and navigate to:
        `http://localhost/Project-Web/HTML-Pages/login.html`
    *   You can also start by exploring other pages like `signup.html` or `ExplorePage.html`.

## 🏗️ Project Structure

The project is organized into the following main directories:

*   **`/HTML-Pages/`**: Contains the primary HTML files for different views of the application (e.g., `login.html`, `ExplorePage.html`, `CartPage.html`, `ItemDetailsPage.html`).
*   **`/assets/`**: Stores static resources.
    *   `css/`: Contains all CSS stylesheets for styling the application (e.g., `styles.css`, `CartStyle.css`, `ProfileStyle.css`).
    *   `js/`: Contains global JavaScript files or utility scripts (e.g., `admin-check.js`).
    *   `images/`: Holds general site images, icons, and potentially placeholder product images.
*   **`/components/`**: Houses JavaScript modules (classes) that define the structure and behavior of various UI components and features (e.g., `Profile/Profile.js`, `Cart/CartContents.js`, `ItemDetails/ItemDetails.js`, `Sellings/SellingContents.js`). These components are typically imported and used by the scripts in the `/pages/` directory.
*   **`/pages/`**: Contains JavaScript files that act as entry points or controllers for specific HTML pages. They initialize components and manage page-specific logic (e.g., `LoginPage.js`, `ExplorePage.js`).
*   **`/backend/`**: Contains all server-side PHP scripts.
    *   `api/`: Subdivided by functionality (e.g., `auth/`, `products/`, `cart/`, `listings/`, `profile/`, `orders/`), these directories contain PHP scripts that handle API requests, interact with the database, and return JSON responses.
    *   `config/`: Includes configuration files, most notably `database.php` for database connection settings.
    *   `uploads/`: Default directory for storing user-uploaded files such as product images (`products/`) and user profile pictures (`users/`).
*   **`schema.sql`**: (Located in the project root) SQL file containing the database schema, used to set up the tables and their structures.
*   **`README.md`**: This file, providing information about the project.

## 🗃️ Database Relations Overview

The `ecommerce_store` database consists of several interconnected tables to manage users, products, orders, and other e-commerce functionalities. Here's a high-level overview of key tables and their relationships:

*   **`users`**: Stores user information.
    *   `id` (Primary Key)
    *   `username`, `password_hash`, `email`, `profile_image`, `address`, `city`, `state`, `zip_code`, `country`, `is_admin`, `created_at`.

*   **`products`**: Contains details about each product.
    *   `id` (Primary Key)
    *   `seller_id` (Foreign Key to `users.id`)
    *   `title`, `description`, `price`, `category`, `condition`, `brand`, `model`, `quantity` (stock), `shipping`, `local_pickup`, `status`, `views`, `created_at`.

*   **`product_images`**: Stores paths to product images.
    *   `id` (Primary Key)
    *   `product_id` (Foreign Key to `products.id`)
    *   `image_url`, `display_order`.

*   **`reviews`**: Holds user reviews for products.
    *   `id` (Primary Key)
    *   `user_id` (Foreign Key to `users.id`)
    *   `product_id` (Foreign Key to `products.id`)
    *   `rating` (1-5), `review_text`, `likes_count`, `created_at`.

*   **`review_likes`**: Tracks which users liked which reviews.
    *   `id` (Primary Key)
    *   `review_id` (Foreign Key to `reviews.id`)
    *   `user_id` (Foreign Key to `users.id`)

*   **`cart_items`**: Manages items currently in users' shopping carts.
    *   `id` (Primary Key)
    *   `user_id` (Foreign Key to `users.id`)
    *   `product_id` (Foreign Key to `products.id`)
    *   `quantity`.

*   **`saved_items`**: Stores items that users have saved for later.
    *   `id` (Primary Key)
    *   `user_id` (Foreign Key to `users.id`)
    *   `product_id` (Foreign Key to `products.id`)
    *   `saved_at`.

*   **`orders`**: Contains header information for each order.
    *   `id` (Primary Key)
    *   `user_id` (Foreign Key to `users.id`)
    *   `total_price`, `shipping_method`, `shipping_cost`, `shipping_address`, `shipping_city`, `shipping_state`, `shipping_zip`, `shipping_country`, `payment_method`, `status` (e.g., 'processing', 'shipped', 'delivered'), `order_date`.

*   **`order_items`**: Details each product within an order.
    *   `id` (Primary Key)
    *   `order_id` (Foreign Key to `orders.id`)
    *   `product_id` (Foreign Key to `products.id`)
    *   `product_title` (snapshot of title at time of order)
    *   `quantity`, `price` (price per unit at time of order).

Relationships are primarily enforced through foreign keys, linking, for example, products to their sellers (users), reviews to users and products, and order items back to specific orders and products.
