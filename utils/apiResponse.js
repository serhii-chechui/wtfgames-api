// Unified success envelope: { success: true, data }. Errors use the mirror
// shape { success: false, error: { message, ... } } produced by errorMiddleware
// and the validate middleware.
export const sendSuccess = (res, data = null, status = 200) => res.status(status).json({ success: true, data });
