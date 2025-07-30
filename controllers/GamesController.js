import { default as mongoose } from "mongoose";
import asyncHandler from "express-async-handler";
import Game from "../models/GameModel.js";

export const getAllGames = asyncHandler(async (req, res) => {
    const games = await Game.find()
        .find()
        .catch((err) => {
            console.log(err);
        });
    res.status(200).json(games);
});

export const getGameById = asyncHandler(async (req, res) => {
    const game = await Game.findById(req.params.id);
    res.status(200).json(game);
});

export const createGame = asyncHandler(async (req, res) => {
    const gameExists = await Game.findOne({ title: req.body.title }).exec();

    console.log(`Game exists: ${gameExists}`);

    if (gameExists) {
        res.status(400);
        throw new Error(`Game with the title: ${req.body.title} is already exists.`);
    }

    let game = await Game.create({
        _id: new mongoose.Types.ObjectId(),
        Title: req.body.title,
        Description: req.body.description,
        Thumbnail: req.body.thumbnail,
        AppStoreUrl: req.body.appStoreUrl,
        GooglePlayUrl: req.body.googlePlayUrl,
        SteamUrl: req.body.steamUrl,
        ItchIOUrl: req.body.itchIOUrl,
        CommingSoon: req.body.commingSoon,
    });

    await game.save();

    res.status(201).json(game);
});

export const removeGameById = asyncHandler(async (req, res) => {
    await Game.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: `Deleted game with ID: ${req.params.id}` });
});
