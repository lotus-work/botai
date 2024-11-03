const mongoose = require('mongoose');
const { Schema } = mongoose;

const organizationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
}, { 
    versionKey: false,
    timestamps: true // Enable timestamps here
});

const Organizations = mongoose.model('Organizations', organizationSchema);
module.exports = {
    Organizations
};
