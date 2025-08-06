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
        const gameExists = await Game.findOne({ Title: req.body.title }).exec();
        if (gameExists) return res.status(409).send(`Game with with title: ${req.body.title} is already exists.`);

        let thumbnailImg = null;
        if (req.file) {
            const resizedImage = await resizeImage(200, 200, req.file.buffer);
            thumbnailImg = await uploadFileToS3("games", resizedImage, req.file.originalname, req.file.mimetype);
        }

        const game = await Game.create({
            _id: new mongoose.Types.ObjectId(),
            Title: req.body.title,
            Description: req.body.description,
            Thumbnail: thumbnailImg,
            AppStoreUrl: req.body.appStoreUrl,
            GooglePlayUrl: req.body.googlePlayUrl,
            SteamUrl: req.body.steamUrl,
            ItchIOUrl: req.body.itchIOUrl,
            CommingSoon: req.body.commingSoon,
        });

        await game.save();

        res.status(201).json(game);
    } catch (ex) {
        throw new Error(ex);
    }
});

export const updateGameById = asyncHandler(async (req, res) => {
    try {
        const updatedGame = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true, timestamps: true });
        if (!updatedGame) return res.sendStatus(404).send("The game you want to update doesn't exists.");
        res.status(200).send(updatedGame);
    } catch (ex) {
        console.error(ex.message);
    }
});

// @desc    Deletes the game document
// @route   DELETE /api/games:id
// @access  Public
export const removeGameById = asyncHandler(async (req, res) => {
    try {
        const deletedGame = await Game.findByIdAndDelete(req.params.id);
        if (!deletedGame) return res.status(404).send(`The game with ID: ${req.params.id} doesn't exists.`);

        res.status(200).json({ message: `The game with ID: ${req.params.id} was deleted.` });
    } catch (ex) {
        console.error(ex.message);
    }
});
