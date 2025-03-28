<?php
class Product {
    private $id;
    private $name;
    private $description;
    private $price;
    private $image;
    private $category;

    public function __construct($id, $name, $description, $price, $image, $category) {
        $this->id = $id;
        $this->name = $name;
        $this->description = $description;
        $this->price = $price;
        $this->image = $image;
        $this->category = $category;
    }

    public function getId() {
        return $this->id;
    }

    public function getName() {
        return $this->name;
    }

    public function getDescription() {
        return $this->description;
    }

    public function getPrice() {
        return $this->price;
    }

    public function getImage() {
        return $this->image;
    }

    public function getCategory() {
        return $this->category;
    }

    public function setName($name) {
        $this->name = $name;
    }

    public function setDescription($description) {
        $this->description = $description;
    }

    public function setPrice($price) {
        $this->price = $price;
    }

    public function setImage($image) {
        $this->image = $image;
    }

    public function setCategory($category) {
        $this->category = $category;
    }

    public function save() {
        // Code to save the product to the database
    }

    public function delete() {
        // Code to delete the product from the database
    }

    public static function find($id) {
        // Code to find a product by its ID
    }

    public static function all() {
        // Code to retrieve all products from the database
    }
}
?>