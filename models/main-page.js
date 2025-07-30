const mongoose = require('mongoose').set('debug', true);

const mainPageSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    headerImage: { type: String }
});

module.exports = mongoose.model('MainPage', mainPageSchema);