const express = require("express");
const { checkAuth } = require('../middleware/check-auth');
const router = express.Router();

const {
    getAllOrders,
    getOrderById,
    createOrder,
    removeOrderById
} = require('../controllers/orders');

router.route('/').get(checkAuth, getAllOrders).post(checkAuth, createOrder);
router.route('/:id').get(checkAuth, getOrderById).delete(checkAuth, removeOrderById);

module.exports = router;