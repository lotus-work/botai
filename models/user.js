const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    profilePicture:{
        type:String,
        required:false,
        default:"http://www.mountainheavensella.com/wp-content/uploads/2018/12/default-user.png"
    },
    name:{
        type: String,
        required:true
    },
    emailAddress:{
        type:String,
        required:true
    },
    mobileNumber:{
        type:String,
        required:false,
        default:0
    }
}, { versionKey: false })

module.exports = mongoose.model('Users', userSchema);