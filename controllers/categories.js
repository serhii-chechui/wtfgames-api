import express from "express";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Category from "../models/categories.js";

// Enable mongoose debug mode
mongoose.set("debug", true);

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find().catch((err) => {
        console.log(err);
    });

    let parentCategories = [];
    let childCategoriesUnsorted = [];

    categories.forEach((element) => {
        const newCategoryElement = {
            _id: element._id,
            name: element.name,
            description: element.description,
            parent: element.parent,
            children: [],
        };

        if (!newCategoryElement.parent) {
            parentCategories.push(newCategoryElement);
        } else {
            childCategoriesUnsorted.push(newCategoryElement);
        }
    });

    parentCategories.forEach((parentCategory) => {
        childCategoriesUnsorted.forEach((child) => {
            if (parentCategory._id.equals(child.parent)) {
                parentCategory.children.push(child);
            }
        });
    });

    res.status(200).json(parentCategories);
});

// @desc    Get all categories as flat list
// @route   GET /api/categories/list
// @access  Public
export const getCategoriesList = asyncHandler(async (req, res) => {
    const categories = await Category.find().catch((err) => {
        console.log(err);
    });
    res.status(200).json(categories);
});

// @desc    Get a specific category by ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (category) {
        res.status(200).json(category);
    } else {
        res.status(404).json({ message: `No valid entry found for provided ID: ${req.params.id}` });
    }
});

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private
export const createCategory = asyncHandler(async (req, res) => {
    let parent = req.body.parent;

    if (parent === "null" || parent === "") {
        parent = null;
    } else {
        parent = new mongoose.Types.ObjectId(req.body.parent);
    }

    const category = await Category.create({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        description: req.body.description,
        parent: parent,
    });

    res.status(201).json(category);
});

// @desc    Delete a specific category by ID
// @route   DELETE /api/categories/:id
// @access  Private
export const removeCategoryById = asyncHandler(async (req, res) => {
    await Category.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: `Deleted category with ID: ${req.params.id}` });
});
