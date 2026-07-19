import { default as mongoose } from "mongoose";
import asyncHandler from "express-async-handler";
import Game from "../models/game.js";
import winston from "winston";
import { resizeImage } from "../middleware/resizeImages.js";
import { uploadFileToS3 } from "../middleware/s3Upload.js";

// @desc    Get all games
// @route   GET /api/games
// @access  Public
export const getAllGames = asyncHandler(async (req, res) => {
    try {
        const games = await Game.find();
        res.status(200).json(games);
    } catch (ex) {
        res.status(500).json({ error: ex.message || "Internal Server Error" });
    }
});

// @desc    Get game by ID
// @route   GET /api/games:ID
// @access  Public
export const getGameById = asyncHandler(async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) return res.status(400).send("Issue with finding the game by id");
        res.status(200).json(game);
    } catch (ex) {
        winston.log("info");
        res.status(500).json({ error: ex.message || "Internal Server Error" });
    }
});

// @desc    Creates new game document
// @route   POST /api/games
// @access  Public
export const createGame = asyncHandler(async (req, res) => {
    try {
        console.log(req.body.Title);
        const gameExists = await Game.findOne({ Title: req.body.Title }).exec();
        if (gameExists) return res.status(409).send(`Game with with title: ${req.body.Title} is already exists.`);

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

        await game.save();

        res.status(201).json(game);
    } catch (ex) {
        throw new Error(ex);
    }
});

export const updateGameById = asyncHandler(async (req, res) => {
    // Без try/catch: asyncHandler сам передаст исключение в errorMiddleware.
    // Раньше catch проглатывал ошибку без ответа — запрос висел до таймаута.
    const updatedGame = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true, timestamps: true });
    if (!updatedGame) {
        res.status(404);
        throw new Error("The game you want to update doesn't exist.");
    }
    res.status(200).json(updatedGame);
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
    res.status(200).json({ message: `The game with ID: ${req.params.id} was deleted.` });
});
