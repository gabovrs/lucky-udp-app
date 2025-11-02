const router = require('express').Router()
const { loadUser } = require('./auth')
const Transaction = require('../models/Transaction')

router.get('/deposit', loadUser, async (req, res) => {
  res.render('pages/deposit', {
    title: 'Depositar',
    balance: '$' + req.user.balance.toLocaleString(),
  })
})

router.get('/withdraw', loadUser, async (req, res) => {
  res.render('pages/withdraw', {
    title: 'Retirar',
    balance: '$' + req.user.balance.toLocaleString(),
  })
})

router.post('/deposit', loadUser, async (req, res) => {
  const amount = parseFloat(req.body.amount)

  if (isNaN(amount) || amount <= 0) {
    return res.status(400).render('pages/deposit', {
      title: 'Depositar',
      error: 'Cantidad inválida',
    })
  }

  const user = req.user
  user.balance += amount
  await user.save()

  await Transaction.create({
    userId: user._id,
    type: 'deposit',
    amount
  })

  res.redirect('/profile')
})

router.post('/withdraw', loadUser, async (req, res) => {
  const amount = parseFloat(req.body.amount)

  if (isNaN(amount) || amount <= 0) {
    return res.status(400).render('pages/withdraw', {
      title: 'Retirar',
      error: 'Cantidad inválida',
    })
  }

  const user = req.user
  if (user.balance < amount) {
    return res.status(400).render('pages/withdraw', {
      title: 'Retirar',
      error: 'Saldo insuficiente',
    })
  }

  user.balance -= amount
  await user.save()

  await Transaction.create({
    userId: user._id,
    type: 'withdraw',
    amount: -amount
  })

  res.redirect('/profile')
})

// Exportar un router válido aunque no haya rutas activas
module.exports = router
