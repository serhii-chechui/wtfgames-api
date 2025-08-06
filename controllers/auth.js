import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import User from "../models/user.js";

export const login = asyncHandler(async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email }).exec();

        if (!user) {
            res.status(404);
            throw new Error(`User with E-mail: ${req.body.email} hasn't found.`);
        }

        const password = await bcrypt.compare(req.body.password, user.password);

        if (!password) {
            res.status(401);
            throw new Error(`Wrong password!`);
        }

        const token = jsonwebtoken.sign(
            {
                email: user.email,
                userId: user._id,
            },
            process.env.JWT_PRIVATE,
            {
                algorithm: "HS256",
                expiresIn: "1h",
            }
        );

        if (!token) {
            return res.status(401).res(new Error(`JWT wasn't processed properly.`));
        }

        res.status(200).json({ message: "Authentication completed!", token: token });
    } catch (err) {
        res.status(500).send(err);
    }
});
