const router = require('express').Router()
const { settle } = require('../games/roulette')
const { loadUser } = require('./auth')
const Transaction = require('../models/Transaction')
const RouletteWinner = require('../models/RouletteWinner')

router.get('/roulette', loadUser, async (req, res) => {
  const winners = await RouletteWinner.find().sort({ createdAt: -1 }).limit(12).lean();
  res.render('games/roulette', {
    title: 'Ruleta Europea',
    balance: '$' + req.user.balance.toLocaleString(),
    winners,
    hasWinners: winners.length > 0,
  })
})

router.post('/roulette', loadUser, async (req, res) => {
  const { betType } = req.body;
  let { selection, amount } = req.body;

  amount = Number(amount);
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Cantidad inválida' });
  }

  const user = req.user;

  if (user.balance < amount) {
    return res.status(400).json({ error: 'Saldo insuficiente' });
  }

  const result = settle({
    betType,
    selection,
    amount
  })

  const transaction = new Transaction({
    userId: user._id,
    type: 'bet',
  });
  if (result.payout > 0) {
    user.balance += result.payout;
    transaction.amount = result.payout;
  } else {
    user.balance -= amount;
    transaction.amount = -amount;
  }
  await user.save();
  await transaction.save();
  await RouletteWinner.create({ number: result.number, color: result.color });

  res.json({
    number: result.number,
    color: result.color,
    payout: result.payout,
    net: result.net,
    balance: user.balance,
  })
})

module.exports = router
