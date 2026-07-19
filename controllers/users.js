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
    // User.findById (previously an undefined findById was called → always 500).
    // password is auto-excluded from the query thanks to select:false in the schema.
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error(`User with ID ${req.params.id} not found.`);
    }
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

    // The role comes from the request body — validate it against an allow-list,
    // otherwise a client could send an arbitrary value (mass assignment). The
    // endpoint is already guarded by requireRole("owner"), but this explicit
    // check also rejects an invalid/empty role.
    const ALLOWED_ROLES = ["owner", "admin", "marketing", "employee"];
    if (!ALLOWED_ROLES.includes(req.body.role)) {
        res.status(400);
        throw new Error("Invalid or missing role.");
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

    // Never expose the password hash: select:false does not affect a document
    // created in memory via create(), so build a safe shape explicitly.
    res.status(201).json({
        _id: user._id,
        email: user.email,
        role: user.role,
        firstname: user.firstname,
        lastname: user.lastname,
        mobile: user.mobile,
    });
});

export const removeUserById = asyncHandler(async (req, res) => {
    // User.deleteOne (previously an undefined deleteOne was called → always 500).
    const result = await User.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) {
        res.status(404);
        throw new Error(`User with ID ${req.params.id} not found.`);
    }
    res.status(200).json({ message: `Deleted user with ID: ${req.params.id}` });
});
