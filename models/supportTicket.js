const mongoose = require('mongoose')

const supportTicketSchema = new mongoose.Schema({
    userToken: {
        type: String,
        required: true
    },
    subject:{
        type: String,
        required:true
    },
    description:{
        type:String,
        required:true
    }
}, { versionKey: false })

module.exports = mongoose.model('SupportTicket', userSchema);