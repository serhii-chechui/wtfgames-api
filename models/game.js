import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
    {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            auto: true, // Optional: Mongoose can auto-generate _id if not provided
        },
        Title: { type: String, required: true, lowercase: false, trim: true },
        Description: { type: String, required: true, lowercase: false, trim: true },
        Thumbnail: { type: String, required: false, lowercase: false, trim: true },
        AppStoreUrl: { type: String, required: false, lowercase: true, trim: true },
        GooglePlayUrl: { type: String, required: false, lowercase: true, trim: true },
        SteamUrl: { type: String, required: false, lowercase: true, trim: true },
        ItchIOUrl: { type: String, required: false, lowercase: true, trim: true },
        CommingSoon: { type: Boolean, required: true },
    },
    { timestamps: true }
);

const Game = mongoose.model("Game", gameSchema);

export default Game;
