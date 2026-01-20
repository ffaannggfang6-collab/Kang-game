const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    username: String,
    credits: { type: Number, default: 0 },
    profileImage: { type: String, default: 'default.png' },
    isApproved: { type: Boolean, default: false }, // ตรวจรูปโดย Admin
    role: { type: String, default: 'player' }
});
module.exports = mongoose.model('User', UserSchema);
