import { z } from "zod";

// Multipart FormData sends booleans as the strings "true"/"false" (the admin
// panel's create forms use FormData); accept either a real boolean or those.
const formBoolean = z.union([z.boolean(), z.enum(["true", "false"]).transform((v) => v === "true")]);

// --- auth ---

// Login only needs a type guard (string, not an object like {"$ne": null}) —
// intentionally not z.email() so a real but unusual stored email still logs in.
export const loginSchema = z.object({
    email: z.string().min(1).max(254),
    password: z.string().min(1).max(200),
});

// --- users ---

export const createUserSchema = z.object({
    email: z.email().max(254),
    // Password policy preserved from the previous manual checks (min 3, max 32).
    password: z.string().min(3).max(32),
    mobile: z.string().min(1).max(32),
    role: z.enum(["owner", "admin", "marketing", "employee"]),
    firstname: z.string().min(1).max(100),
    lastname: z.string().min(1).max(100),
});

// --- games / applications (identical content shape) ---

const contentCreateShape = {
    Title: z.string().min(1).max(200),
    Description: z.string().min(1).max(5000),
    AppStoreUrl: z.string().max(2000).optional(),
    GooglePlayUrl: z.string().max(2000).optional(),
    SteamUrl: z.string().max(2000).optional(),
    ItchIOUrl: z.string().max(2000).optional(),
    CommingSoon: formBoolean,
};

// Updates are partial JSON (PATCH has no multipart), so every field is optional
// and CommingSoon is a real boolean. Thumbnail/_id are not accepted here.
const contentUpdateShape = {
    Title: z.string().min(1).max(200).optional(),
    Description: z.string().min(1).max(5000).optional(),
    AppStoreUrl: z.string().max(2000).optional(),
    GooglePlayUrl: z.string().max(2000).optional(),
    SteamUrl: z.string().max(2000).optional(),
    ItchIOUrl: z.string().max(2000).optional(),
    CommingSoon: z.boolean().optional(),
};

export const createGameSchema = z.object(contentCreateShape);
export const updateGameSchema = z.object(contentUpdateShape);
export const createApplicationSchema = z.object(contentCreateShape);
export const updateApplicationSchema = z.object(contentUpdateShape);
