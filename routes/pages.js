const router = require('express').Router()
const { loadUser } = require('./auth')
const Transaction = require('../models/Transaction')

// Ruta principal que redirige al home
router.get('/', (req, res) => {
  // const username = req.cookies.username
  // if (!username) {
  // }
  // res.redirect('/profile')
  return res.render('pages/home', {
    title: 'Inicio',
    year: new Date().getFullYear()
  })
})

const transactionsLabel = {
  deposit: 'Depósito',
  withdraw: 'Retiro',
  bet: 'Apuesta',
}

router.get('/profile', loadUser, async (req, res) => {
  const user = req.user
  // Obtener transacciones como objetos planos y ordenadas por fecha desc
  const tx = await Transaction.find({ userId: user._id }).sort({ createdAt: -1 })

  const transactions = tx.map(t => ({
    createdAt: t.createdAt,
    type: transactionsLabel[t.type] || t.type,
    amount: t.amount,
  }))

  res.render('pages/profile', {
    title: 'Perfil',
    userName: user.username,
    createdAt: user.createdAt,
    balance: '$' + user.balance.toLocaleString(),
    transactions,
    hasTransactions: transactions.length > 0,
  })
})

router.get('/info', (req, res) => {
  res.render('pages/info', {
    title: 'Información',
  })
})

module.exports = router
