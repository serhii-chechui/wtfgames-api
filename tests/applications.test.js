import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
import { seedUser, loginAgent } from "./helpers.js";

// Applications share their controller/schema logic with games, so this is a
// focused smoke test of the public read, auth gate, and unique-Title guard.
describe("applications", () => {
    const body = (overrides = {}) => ({ Title: "My App", Description: "An app.", CommingSoon: false, ...overrides });

    it("GET /applications is public and returns the success envelope", async () => {
        const res = await request(app).get("/api/applications");
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("POST /applications requires authentication", async () => {
        const res = await request(app).post("/api/applications").send(body());
        expect(res.status).toBe(401);
    });

    it("an owner creates an application and a duplicate Title is 409", async () => {
        await seedUser({ email: "owner@wtf.test", password: "pass123", role: "owner" });
        const agent = (await loginAgent(app, "owner@wtf.test", "pass123")).agent;
        expect((await agent.post("/api/applications").send(body({ Title: "Unique" }))).status).toBe(201);
        expect((await agent.post("/api/applications").send(body({ Title: "Unique" }))).status).toBe(409);
    });
});
