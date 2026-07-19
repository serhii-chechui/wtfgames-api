import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { seedUser, loginAgent, validUserBody } from "./helpers.js";

describe("users / RBAC", () => {
    let ownerAgent;
    let employeeAgent;

    beforeEach(async () => {
        await seedUser({ email: "owner@wtf.test", password: "pass123", role: "owner" });
        await seedUser({ email: "emp@wtf.test", password: "pass123", role: "employee" });
        ownerAgent = (await loginAgent(app, "owner@wtf.test", "pass123")).agent;
        employeeAgent = (await loginAgent(app, "emp@wtf.test", "pass123")).agent;
    });

    it("POST /users requires authentication", async () => {
        const res = await request(app).post("/api/users").send(validUserBody());
        expect(res.status).toBe(401);
    });

    it("an employee cannot create users (403)", async () => {
        const res = await employeeAgent.post("/api/users").send(validUserBody());
        expect(res.status).toBe(403);
    });

    it("an owner creates a user (201) without leaking the password", async () => {
        const res = await ownerAgent.post("/api/users").send(validUserBody({ email: "created@wtf.test" }));
        expect(res.status).toBe(201);
        expect(res.body.data.email).toBe("created@wtf.test");
        expect(res.body.data.password).toBeUndefined();
    });

    it("rejects an invalid role (mass assignment) with 400", async () => {
        const res = await ownerAgent.post("/api/users").send(validUserBody({ email: "x@wtf.test", role: "superadmin" }));
        expect(res.status).toBe(400);
    });

    it("rejects a duplicate email with 409", async () => {
        const res = await ownerAgent.post("/api/users").send(validUserBody({ email: "owner@wtf.test" }));
        expect(res.status).toBe(409);
    });

    it("listing users is owner/admin only and never includes passwords", async () => {
        expect((await employeeAgent.get("/api/users")).status).toBe(403);
        const res = await ownerAgent.get("/api/users");
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.every((u) => u.password === undefined)).toBe(true);
    });

    it("GET /users/:id returns a user; a missing id is 404", async () => {
        const list = await ownerAgent.get("/api/users");
        const id = list.body.data[0]._id;
        expect((await ownerAgent.get(`/api/users/${id}`)).status).toBe(200);
        expect((await ownerAgent.get("/api/users/0123456789abcdef01234567")).status).toBe(404);
    });

    it("DELETE /users/:id removes the user; a second delete is 404", async () => {
        const created = await ownerAgent.post("/api/users").send(validUserBody({ email: "del@wtf.test" }));
        const id = created.body.data._id;
        expect((await ownerAgent.delete(`/api/users/${id}`)).status).toBe(200);
        expect((await ownerAgent.delete(`/api/users/${id}`)).status).toBe(404);
    });
});
