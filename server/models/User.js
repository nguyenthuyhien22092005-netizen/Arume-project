const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    googleId: { type: String },
    avatar: { type: String },
    resetPasswordCode: { type: String },
    resetPasswordExpiry: { type: Date },
    memberTier: {
        type: String,
        enum: ['MEMBER', 'GOLD', 'VIP'],
        default: 'MEMBER'
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    defaultAddress: {
        name: String,
        phone: String,
        address: String,
        province: String,
        district: String
    }
}, { timestamps: true });

// Mongoose 7+ / Express 5: async pre-save không cần next()
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

module.exports = mongoose.model('User', userSchema);
