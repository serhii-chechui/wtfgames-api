const asyncHandler = require('express-async-handler');
const { default: mongoose } = require("mongoose");
const GiftCertificate = require('../models/gift-certificate');

// @desc    Get all certificates
// @route   GET /api/gift-certificates
// @access  Public
const getAllCertificates = asyncHandler(async (req, res) => {
    const certificates = await GiftCertificate.find();
    res.status(200).json(certificates);
});

// @desc    Get all categories
// @route   GET /api/gift-certificates:id
// @access  Public
const getCertificateById = asyncHandler(async (req, res) => {
    const certificate = await GiftCertificate.findById(req.params.id);
    res.status(200).json(certificate);
});

// @desc    Creates a new certificate
// @route   POST /api/gift-certificates
// @access  Private
const createCertificate = asyncHandler(async (req, res, next) => {

    const certificate = await GiftCertificate.create({
        _id: new mongoose.Types.ObjectId(),
        email: req.body.email,
        status: "new",
        value: req.body.value
    });

    req.certificate = certificate;
    next();
});

// @desc    Delete a speciefic certificate by id.
// @route   DELETE /api/gift-certificates:id
// @access  Private
const removeCertificateById = asyncHandler(async (req, res) => {
    await GiftCertificate.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: `Gift certificate with ID ${req.params.id} was deleted.` });
});

// @desc    Redeem a speciefic certificate by id.
// @route   GET /api/gift-certificates/redeem/:id
// @access  Public
const redeemCertificate = asyncHandler(async (req, res) => {

    const certificateId = req.params.id;

    const certificate = await GiftCertificate.findOne({ _id: certificateId });

    if (certificate) {
        switch (certificate.status) {
            case 'new':
                await GiftCertificate.findOneAndUpdate({ _id: certificateId }, { status: 'redeemed' }, { new: true });
                res.status(200).json({ message: `Gift certificate with id: ${certificateId} war redeemed!` });
                break;
            case 'expired':
                res.status(500).json({ message: `Gift Certificate with id: ${certificateId} has been expired!` });
                break;
            case 'redeemed':
                res.status(500).json({ message: `Gift Certificate with id: ${certificateId} has been already used!` });
                break;
        }
    } else {
        res.status(404).json({ message: `Gift Certificate with id: ${certificateId} couldn't be found!` });
    }
});

module.exports = {
    getAllCertificates,
    getCertificateById,
    createCertificate,
    removeCertificateById,
    redeemCertificate
};