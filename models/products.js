const mongoose = require('mongoose').set('debug', true);

const productSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    description: { type: String, required: true },
    productImage: { type: String },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    price: { type: Number, required: true },
    units: { type: String, enum: ['unit'], required: true }
});

module.exports = mongoose.model('Product', productSchema);