import { default as mongoose } from "mongoose";
import asyncHandler from "express-async-handler";
import Application from "../models/applications.js";
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
    const application = await Application.findById(req.params.id);
    if (!application) {
        res.status(404);
        throw new Error(`Application with ID ${req.params.id} not found.`);
    }
    res.status(200).json(application);
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
// Fields a client may update. Excludes _id/timestamps and Thumbnail — the
// thumbnail is managed by the upload pipeline, not a raw body string.
const APPLICATION_UPDATABLE_FIELDS = [
    "Title",
    "Description",
    "AppStoreUrl",
    "GooglePlayUrl",
    "SteamUrl",
    "ItchIOUrl",
    "CommingSoon",
];

export const updateApplicationById = asyncHandler(async (req, res) => {
    // No try/catch: asyncHandler forwards the exception to errorMiddleware.
    // Pick only allow-listed fields (guards against mass assignment) and run
    // schema validators on the update.
    const update = {};
    for (const field of APPLICATION_UPDATABLE_FIELDS) {
        if (req.body[field] !== undefined) update[field] = req.body[field];
    }

    const updatedApplication = await Application.findByIdAndUpdate(req.params.id, update, {
        new: true,
        runValidators: true,
        context: "query",
    });
    if (!updatedApplication) {
        res.status(404);
        throw new Error("The application you want to update doesn't exist.");
    }
    res.status(200).json(updatedApplication);
});

// @desc    Deletes application document
// @route   DELETE /api/applications/:id
// @access  Public
export const removeApplicationById = asyncHandler(async (req, res) => {
    const deletedApplication = await Application.findByIdAndDelete(req.params.id);
    if (!deletedApplication) {
        res.status(404);
        throw new Error(`Application with ID: ${req.params.id} doesn't exist.`);
    }
    res.status(200).json({ message: `Application with ID: ${req.params.id} was deleted.` });
});
