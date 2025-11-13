const { Schema, model } = require('mongoose')

const RouletteWinnerSchema = new Schema({
  number: { type: Number, required: true, min: 0, max: 36, index: true },
  color: { type: String, enum: ['green', 'red', 'black'] },
}, { timestamps: true })

module.exports = model('RouletteWinner', RouletteWinnerSchema)