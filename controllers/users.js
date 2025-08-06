import { default as mongoose } from "mongoose";
import asyncHandler from "express-async-handler";
import { genSalt, hash } from "bcrypt";
import User from "../models/user.js";
import multer, { diskStorage } from "multer";

const storage = diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10485760,
    },
});

// @desc    Get all users
// @route   GET /api/users
// @access  Public
export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find()
        .find()
        .catch((err) => {
            console.log(err);
        });
    res.status(200).json(users);
});

// @desc    Get a speciefic user by id
// @route   GET /api/users:id
// @access  Public
export const getUserById = asyncHandler(async (req, res) => {
    const user = await findById(req.params.id);
    res.status(200).json(user);
});

// @desc    Creates a new category
// @route   POST /api/users:id
// @access  Private
export const createUser = asyncHandler(async (req, res) => {
    if (req.body.email === "") {
        res.status(400);
        throw new Error("E-mail is empty!");
    }

    if (req.body.password === "") {
        res.status(400);
        throw new Error("Password is empty!");
    }

    if (req.body.password.length < 3) {
        res.status(400);
        throw new Error("Password is too short!");
    }

    if (req.body.password.length > 32) {
        res.status(400);
        throw new Error("Password is too long!");
    }

    const userExists = await User.find({ email: req.body.email }).exec();

    console.log(`User exists: ${userExists.length}`);

    if (userExists.length > 0) {
        res.status(400);
        throw new Error(`User with the E-mail: ${req.body.email} is already exists.`);
    }

    const salt = await genSalt(10);
    const hashedPassword = await hash(req.body.password, salt);

    let user = await User.create({
        _id: new mongoose.Types.ObjectId(),
        email: req.body.email,
        password: hashedPassword,
        mobile: req.body.mobile,
        role: req.body.role,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
    });

    await user.save();

    res.status(201).json(user);
});

export const removeUserById = asyncHandler(async (req, res) => {
    await deleteOne({ _id: req.params.id });
    res.status(200).json({ message: `Deleted user with ID: ${req.params.id}` });
});
