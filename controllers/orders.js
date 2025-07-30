const express = require("express");
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose').set('debug', true);

const Order = require('../models/order');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Public
const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find();
    if (orders) {
        res.status(200).json(orders);
    } else {
        res.status(404);
        throw new Error('Sorry, but there is no any kind of data for your request.');
    }
});

// @desc    Get a speciefic orders by id
// @route   GET /api/orders:id
// @access  Public
const getOrderById = asyncHandler(async (req, res) => {

    const order = await Order.findById(req.params.id);

    if (order) {
        res.status(200).json(order);
    } else {
        res.status(404).json({ message: `No valid entry found for provided ID: ${req.params.id}` });
    }
});

// @desc    Creates a new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {

    const order = await Order.create({
        _id: new mongoose.Types.ObjectId(),
        customer: mongoose.Types.ObjectId(req.body.customerId),
        products: mongoose.Types.ObjectId(req.body.products),
        status: 'created'
    });

    res.status(201).json(order);
});

// @desc    Delete a speciefic order by id.
// @route   DELETE /api/orders:id
// @access  Private
const removeOrderById = asyncHandler(async (req, res) => {
    await Order.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: `Deleted order with ID: ${req.params.id}` });
});

module.exports = {
    getAllOrders,
    getOrderById,
    createOrder,
    removeOrderById
};