const express = require("express");

const {
    getAllCertificates,
    getCertificateById,
    createCertificate,
    removeCertificateById,
    redeemCertificate
} = require('../controllers/gift-certificate');

const mailer = require('../middleware/mailer');
const { checkAuth } = require('../middleware/check-auth');

const router = express.Router();

router.get('/', getAllCertificates);
router.get('/redeem/:id', redeemCertificate);

router.get('/:id', checkAuth, getCertificateById);
router.post('/', checkAuth, createCertificate, mailer.sendEmail);

router.delete('/:id', removeCertificateById);

module.exports = router;