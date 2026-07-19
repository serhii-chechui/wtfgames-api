import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { seedUser, loginAgent, validGameBody } from "./helpers.js";

describe("games", () => {
    let agent;

    beforeEach(async () => {
        await seedUser({ email: "owner@wtf.test", password: "pass123", role: "owner" });
        agent = (await loginAgent(app, "owner@wtf.test", "pass123")).agent;
    });

    it("GET /games is public and returns the success envelope", async () => {
        const res = await request(app).get("/api/games");
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("POST /games requires authentication", async () => {
        const res = await request(app).post("/api/games").send(validGameBody());
        expect(res.status).toBe(401);
    });

    it("an authenticated user creates a game (201)", async () => {
        const res = await agent.post("/api/games").send(validGameBody({ Title: "Created Game" }));
        expect(res.status).toBe(201);
        expect(res.body.data.Title).toBe("Created Game");
    });

    it("rejects a missing Title with 400", async () => {
        const res = await agent.post("/api/games").send(validGameBody({ Title: "" }));
        expect(res.status).toBe(400);
    });

    it("rejects a duplicate Title with 409", async () => {
        await agent.post("/api/games").send(validGameBody({ Title: "Dup" }));
        const res = await agent.post("/api/games").send(validGameBody({ Title: "Dup" }));
        expect(res.status).toBe(409);
    });

    it("GET /games/:id is 404 for a missing id and 400 for a malformed id", async () => {
        expect((await request(app).get("/api/games/0123456789abcdef01234567")).status).toBe(404);
        expect((await request(app).get("/api/games/not-an-id")).status).toBe(400);
    });

    it("PATCH updates allowed fields and ignores unknown ones", async () => {
        const created = await agent.post("/api/games").send(validGameBody({ Title: "Patchable" }));
        const id = created.body.data._id;
        const res = await agent.patch(`/api/games/${id}`).send({ Description: "updated", evil: "x" });
        expect(res.status).toBe(200);
        expect(res.body.data.Description).toBe("updated");
        expect(res.body.data.evil).toBeUndefined();
    });

    it("DELETE removes a game; a second delete is 404", async () => {
        const created = await agent.post("/api/games").send(validGameBody({ Title: "Deletable" }));
        const id = created.body.data._id;
        expect((await agent.delete(`/api/games/${id}`)).status).toBe(200);
        expect((await agent.delete(`/api/games/${id}`)).status).toBe(404);
    });
});
