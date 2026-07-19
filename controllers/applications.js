import { default as mongoose } from "mongoose";
import asyncHandler from "express-async-handler";
import Application from "../models/applications.js";
import winston from "winston";
import { resizeImage } from "../middleware/resizeImages.js";
import { uploadFileToS3 } from "../middleware/s3Upload.js";

// @desc    Get all applications
// @route   GET /api/applications
// @access  Public
export const getAllApplications = asyncHandler(async (req, res) => {
    try {
        const applications = await Application.find();
        res.status(200).json(applications);
    } catch (ex) {
        res.status(500).json({ error: ex.message || "Internal Server Error" });
    }
});

// @desc    Get application by ID
// @route   GET /api/applications/:id
// @access  Public
export const getApplicationById = asyncHandler(async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) return res.status(404).send("Application not found.");
        res.status(200).json(application);
    } catch (ex) {
        winston.log("info");
        res.status(500).json({ error: ex.message || "Internal Server Error" });
    }
});

// @desc    Creates new application document
// @route   POST /api/applications
// @access  Public
export const createApplication = asyncHandler(async (req, res) => {
    try {
        const applicationExists = await Application.findOne({ Title: req.body.Title }).exec();
        if (applicationExists) return res.status(409).send(`Application with title: ${req.body.Title} already exists.`);

        let thumbnailImg = null;

        if (req.file) {
            const resizedImage = await resizeImage(200, 200, req.file.buffer);
            thumbnailImg = await uploadFileToS3("applications", resizedImage, req.file.originalname, req.file.mimetype);
        }

        const application = await Application.create({
            _id: new mongoose.Types.ObjectId(),
            Title: req.body.Title,
            Description: req.body.Description,
            Thumbnail: thumbnailImg,
            AppStoreUrl: req.body.AppStoreUrl,
            GooglePlayUrl: req.body.GooglePlayUrl,
            SteamUrl: req.body.SteamUrl,
            ItchIOUrl: req.body.ItchIOUrl,
            CommingSoon: req.body.CommingSoon,
        });

        await application.save();

        res.status(201).json(application);
    } catch (ex) {
        throw new Error(ex);
    }
});

// @desc    Updates application by ID
// @route   PUT /api/applications/:id
// @access  Public
export const updateApplicationById = asyncHandler(async (req, res) => {
    try {
        const updatedApplication = await Application.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            timestamps: true,
        });
        if (!updatedApplication) return res.status(404).send("The application you want to update doesn't exist.");
        res.status(200).json(updatedApplication);
    } catch (ex) {
        console.error(ex.message);
    }
});

// @desc    Deletes application document
// @route   DELETE /api/applications/:id
// @access  Public
export const removeApplicationById = asyncHandler(async (req, res) => {
    try {
        const deletedApplication = await Application.findByIdAndDelete(req.params.id);
        if (!deletedApplication) return res.status(404).send(`Application with ID: ${req.params.id} doesn't exist.`);

        res.status(200).json({ message: `Application with ID: ${req.params.id} was deleted.` });
    } catch (ex) {
        console.error(ex.message);
    }
});
