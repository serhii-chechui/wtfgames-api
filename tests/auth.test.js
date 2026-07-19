import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { seedUser, loginAgent } from "./helpers.js";

describe("auth", () => {
    beforeEach(async () => {
        await seedUser({ email: "owner@wtf.test", password: "secret123", role: "owner" });
    });

    it("logs in with valid credentials and returns the user without password", async () => {
        const res = await request(app).post("/api/auth/login").send({ email: "owner@wtf.test", password: "secret123" });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.user.email).toBe("owner@wtf.test");
        expect(res.body.data.user.password).toBeUndefined();
        expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("rejects a wrong password with 401", async () => {
        const res = await request(app).post("/api/auth/login").send({ email: "owner@wtf.test", password: "wrong" });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it("rejects an unknown email with 401", async () => {
        const res = await request(app).post("/api/auth/login").send({ email: "nobody@wtf.test", password: "secret123" });
        expect(res.status).toBe(401);
    });

    it("rejects a NoSQL-injection object email with 400", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: { $ne: null }, password: "x" });
        expect(res.status).toBe(400);
        expect(res.body.error.message).toBe("Validation failed");
    });

    it("rejects missing fields with 400", async () => {
        const res = await request(app).post("/api/auth/login").send({});
        expect(res.status).toBe(400);
    });

    it("GET /me requires authentication", async () => {
        const res = await request(app).get("/api/auth/me");
        expect(res.status).toBe(401);
    });

    it("GET /me returns the current user with a valid cookie", async () => {
        const { agent } = await loginAgent(app, "owner@wtf.test", "secret123");
        const res = await agent.get("/api/auth/me");
        expect(res.status).toBe(200);
        expect(res.body.data.user.email).toBe("owner@wtf.test");
    });

    it("logout clears the session", async () => {
        const { agent } = await loginAgent(app, "owner@wtf.test", "secret123");
        const out = await agent.post("/api/auth/logout");
        expect(out.status).toBe(200);
        const me = await agent.get("/api/auth/me");
        expect(me.status).toBe(401);
    });
});
