const express = require("express");
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose').set('debug', true);

const Product = require('../models/products');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find();
    res.status(200).json(products);
});

// @desc    Get a speciefic products by id
// @route   GET /api/products:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {

    const product = await Product.findById(req.params.id);

    if (product) {
        res.status(200).json(product);
    } else {
        res.status(404).json({ message: `No valid entry found for provided ID: ${req.params.id}` });
    }
});

// @desc    Get a speciefic products by category
// @route   GET /api/products:category
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {

    const products = await Product.find({ category: req.params.category });

    if (products) {
        res.status(200).json(products);
    } else {
        res.status(404).json({ message: `No valid entry found for provided category: ${req.params.category}` });
    }
});

// @desc    Creates a new product
// @route   POST /api/products
// @access  Private
const createProduct = asyncHandler(async (req, res) => {

    const product = await Product.create({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        description: req.body.description,
        productImage: null,
        category: req.body.category,
        price: req.body.price,
        units: req.body.units
    });

    res.status(201).json(product);
});

// @desc    Delete a speciefic product by id.
// @route   DELETE /api/products:id
// @access  Private
const removeProductById = asyncHandler(async (req, res) => {
    await Product.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: `Deleted product with ID: ${req.params.id}` });
});

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    removeProductById
};