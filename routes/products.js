const express = require("express");

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10485760
    }
});

const { checkAuth } = require('../middleware/check-auth');

const router = express.Router();

const {
    getAllProducts,
    getProductById,
    createProduct,
    removeProductById
} = require('../controllers/products');

router.route('/').get(getAllProducts).post(checkAuth, createProduct);
router.route('/:id').get(getProductById).delete(checkAuth, removeProductById);

module.exports = router;