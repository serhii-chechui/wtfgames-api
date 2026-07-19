import { default as mongoose } from "mongoose";
import asyncHandler from "express-async-handler";
import { genSalt, hash } from "bcrypt";
import User from "../models/user.js";
import multer, { diskStorage } from "multer";
import { sendSuccess } from "../utils/apiResponse.js";

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
    // password is auto-excluded by select:false. Errors propagate to
    // errorMiddleware (the previous double .find().catch swallowed them).
    const users = await User.find();
    sendSuccess(res, users);
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
    sendSuccess(res, user);
});

// @desc    Creates a new user
// @route   POST /api/users
// @access  Private (owner)
export const createUser = asyncHandler(async (req, res) => {
    // req.body is validated by createUserSchema (see routes/users.js): fields are
    // present, typed, and role is restricted to the allowed enum (mass-assignment
    // safe). Unknown keys are stripped by the schema.
    const { email, password, mobile, role, firstname, lastname } = req.body;

    // Friendly pre-check; the unique index on email is the real guard (a race
    // surfaces as E11000 -> 409 via errorMiddleware).
    const userExists = await User.find({ email }).exec();
    if (userExists.length > 0) {
        res.status(409);
        throw new Error(`User with the email ${email} already exists.`);
    }

    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    const user = await User.create({
        _id: new mongoose.Types.ObjectId(),
        email,
        password: hashedPassword,
        mobile,
        role,
        firstname,
        lastname,
    });

    // Never expose the password hash: select:false does not affect a document
    // created in memory via create(), so build a safe shape explicitly.
    sendSuccess(
        res,
        {
            _id: user._id,
            email: user.email,
            role: user.role,
            firstname: user.firstname,
            lastname: user.lastname,
            mobile: user.mobile,
        },
        201
    );
});

export const removeUserById = asyncHandler(async (req, res) => {
    // User.deleteOne (previously an undefined deleteOne was called → always 500).
    const result = await User.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) {
        res.status(404);
        throw new Error(`User with ID ${req.params.id} not found.`);
    }
    sendSuccess(res, { message: `Deleted user with ID: ${req.params.id}` });
});
