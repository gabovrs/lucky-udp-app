const { Schema, model } = require('mongoose')

const UserSchema = new Schema({
  username: { type: String, unique: true, index: true },
  password: String,
  balance: { type: Number, default: 0 },
}, { timestamps: true })

module.exports = model('User', UserSchema)