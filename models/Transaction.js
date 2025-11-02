const { Schema, model, Types } = require('mongoose')

const TransactionSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', index: true },
  type: { type: String, enum: ['deposit', 'withdraw', 'bet'] },
  amount: Number,
}, { timestamps: true })

module.exports = model('Transaction', TransactionSchema)