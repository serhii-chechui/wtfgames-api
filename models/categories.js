import mongoose from "mongoose";

mongoose.set("debug", true);

const categorySchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    description: String,
    parent: mongoose.Schema.Types.ObjectId,
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
