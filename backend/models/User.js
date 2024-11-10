const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define User schema
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    idNumber: { type: String, required: true, unique: true },
    accountNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

// Hash password before saving the user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
  
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  
    next();
  });
  
  

// Method to compare entered password with the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
