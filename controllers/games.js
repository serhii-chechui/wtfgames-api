import { default as mongoose } from "mongoose";
import asyncHandler from "express-async-handler";
import Game from "../models/game.js";
import { resizeImage } from "../middleware/resizeImages.js";
import { uploadFileToS3 } from "../middleware/s3Upload.js";
import { sendSuccess } from "../utils/apiResponse.js";

// @desc    Get all games
// @route   GET /api/games
// @access  Public
export const getAllGames = asyncHandler(async (req, res) => {
    try {
        const games = await Game.find();
        sendSuccess(res, games);
    } catch (ex) {
        res.status(500).json({ error: ex.message || "Internal Server Error" });
    }
});

// @desc    Get game by ID
// @route   GET /api/games:ID
// @access  Public
export const getGameById = asyncHandler(async (req, res) => {
    const game = await Game.findById(req.params.id);
    if (!game) {
        res.status(404);
        throw new Error(`Game with ID ${req.params.id} not found.`);
    }
    sendSuccess(res, game);
});

// @desc    Creates new game document
// @route   POST /api/games
// @access  Public
export const createGame = asyncHandler(async (req, res) => {
    // Friendly pre-check for the common case. The unique index on Title is the
    // real guard against the race between this check and the insert (a concurrent
    // create surfaces as E11000 -> 409 via errorMiddleware). No try/catch here:
    // asyncHandler forwards errors (including E11000) to errorMiddleware.
    const gameExists = await Game.findOne({ Title: req.body.Title }).exec();
    if (gameExists) {
        res.status(409);
        throw new Error(`Game with title '${req.body.Title}' already exists.`);
    }

    let thumbnailImg = null;
    if (req.file) {
        const resizedImage = await resizeImage(200, 200, req.file.buffer);
        thumbnailImg = await uploadFileToS3("games", resizedImage, req.file.originalname, req.file.mimetype);
    }

    const game = await Game.create({
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

    sendSuccess(res, game, 201);
});

// Fields a client may update. Excludes _id/timestamps and Thumbnail — the
// thumbnail is managed by the upload pipeline, not a raw body string.
const GAME_UPDATABLE_FIELDS = [
    "Title",
    "Description",
    "AppStoreUrl",
    "GooglePlayUrl",
    "SteamUrl",
    "ItchIOUrl",
    "CommingSoon",
];

export const updateGameById = asyncHandler(async (req, res) => {
    // No try/catch: asyncHandler forwards the exception to errorMiddleware.
    // Pick only allow-listed fields (guards against mass assignment) and run
    // schema validators on the update.
    const update = {};
    for (const field of GAME_UPDATABLE_FIELDS) {
        if (req.body[field] !== undefined) update[field] = req.body[field];
    }

    const updatedGame = await Game.findByIdAndUpdate(req.params.id, update, {
        new: true,
        runValidators: true,
        context: "query",
    });
    if (!updatedGame) {
        res.status(404);
        throw new Error("The game you want to update doesn't exist.");
    }
    sendSuccess(res, updatedGame);
});

// @desc    Deletes the game document
// @route   DELETE /api/games:id
// @access  Public
export const removeGameById = asyncHandler(async (req, res) => {
    const deletedGame = await Game.findByIdAndDelete(req.params.id);
    if (!deletedGame) {
        res.status(404);
        throw new Error(`The game with ID: ${req.params.id} doesn't exist.`);
    }
    sendSuccess(res, { message: `The game with ID: ${req.params.id} was deleted.` });
});
