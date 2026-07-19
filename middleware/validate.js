// Validate req.body against a Zod schema. On failure, respond 400 with a list
// of field errors. On success, replace req.body with the parsed data (unknown
// keys stripped, values coerced) so handlers work with clean, typed input.
export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: result.error.issues.map((issue) => ({
                field: issue.path.join(".") || "(body)",
                message: issue.message,
            })),
        });
    }
    req.body = result.data;
    next();
};
