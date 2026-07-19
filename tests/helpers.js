import bcrypt from "bcrypt";
import mongoose from "mongoose";
import request from "supertest";
import User from "../models/user.js";

// Seed a user directly (bypassing the owner-only create endpoint), hashing the
// password the same way the app does so login works.
export async function seedUser({
    email = "owner@wtf.test",
    password = "pass123",
    role = "owner",
    mobile = "100",
    firstname = "Test",
    lastname = "User",
} = {}) {
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
        _id: new mongoose.Types.ObjectId(),
        email,
        password: hashed,
        role,
        mobile,
        firstname,
        lastname,
    });
    return { user, password };
}

// Returns a supertest agent carrying the auth cookie for the given credentials.
export async function loginAgent(app, email, password) {
    const agent = request.agent(app);
    const res = await agent.post("/api/auth/login").send({ email, password });
    return { agent, res };
}

// Valid request bodies for create endpoints.
export const validUserBody = (overrides = {}) => ({
    email: "new@wtf.test",
    password: "pass1234",
    mobile: "555",
    role: "admin",
    firstname: "New",
    lastname: "User",
    ...overrides,
});

export const validGameBody = (overrides = {}) => ({
    Title: "My Game",
    Description: "A game.",
    CommingSoon: false,
    ...overrides,
});
