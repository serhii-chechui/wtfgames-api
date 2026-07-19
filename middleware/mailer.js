import nodemailer from "nodemailer";

// Reusable SMTP transporter, created once at module load. Configured via env
// (ADMIN_MAIL / ADMIN_PASS — a Gmail app password). Credentials are never logged.
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.ADMIN_MAIL,
        pass: process.env.ADMIN_PASS,
    },
});

/**
 * Send an email. Throws on failure so the caller can decide how to respond;
 * it never crashes the process.
 *
 * @param {Object} options
 * @param {string} options.to - Recipient address.
 * @param {string} options.subject - Subject line.
 * @param {string} [options.text] - Plain-text body.
 * @param {string} [options.html] - HTML body.
 * @param {Array<Object>} [options.attachments] - Nodemailer attachments.
 * @returns {Promise<import("nodemailer").SentMessageInfo>}
 */
export async function sendEmail({ to, subject, text, html, attachments }) {
    if (!process.env.ADMIN_MAIL || !process.env.ADMIN_PASS) {
        throw new Error("Email is not configured (ADMIN_MAIL/ADMIN_PASS are missing).");
    }
    if (!to || !subject) {
        throw new Error("Email requires 'to' and 'subject'.");
    }

    return transporter.sendMail({
        from: process.env.ADMIN_MAIL,
        to,
        subject,
        text,
        html,
        attachments,
    });
}

export default sendEmail;
