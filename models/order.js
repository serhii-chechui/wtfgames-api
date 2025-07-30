const mongoose = require('mongoose').set('debug', true);

const orderSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }],
    status: { type: String, enum: ['created', 'formed', 'purchased', 'completed'], required: true },
});

module.exports = mongoose.model('Order', orderSchema);