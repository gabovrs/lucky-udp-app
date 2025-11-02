const router = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/User')

function mustLogOut(req, res, next) {
  const username = req.cookies.username
  if (username) {
    return res.redirect('/profile')
  }
  next()
}

function mustAuth(req, res, next) {
  const username = req.cookies.username
  if (!username) {
    return res.redirect('/login')
  }
  next()
}

async function loadUser(req, res, next) {
  const username = req.cookies.username

  req.user = await User.findOne({ username })

  if (!req.user) {
    return res.redirect('/login')
  }

  next()
}

router.get('/login', mustLogOut, (req, res) => {
  res.render('pages/login', {
    title: 'Iniciar Sesión',
  })
})

router.get('/register', mustLogOut, (req, res) => {
  res.render('pages/register', {
    title: 'Registrarse',
  })
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body

  const user = await User.findOne({ username })
  if (!user) {
    return res.status(400).render('pages/login', { title: 'Iniciar sesión', error: 'Credenciales inválidas' });
  }
  const ok = await bcrypt.compare(password, user.password)
  if (!ok) {
    return res.status(400).render('pages/login', { title: 'Iniciar sesión', error: 'Credenciales inválidas' });
  }

  res.cookie('username', user.username, {
    httpOnly: true,
  })
  res.redirect('/')
})

router.post('/register', async (req, res) => {
  const { username, password, password2 } = req.body

  if (password !== password2) {
    return res.status(400).render('pages/register', { title: 'Registrarse', error: 'Las contraseñas no coinciden' })
  }

  const existingUser = await User.findOne({ username })
  if (existingUser) {
    return res.status(400).render('pages/register', {
      title: 'Registrarse',
      error: 'El nombre de usuario ya está en uso',
    })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  await User.create({ username, password: hashedPassword })

  res.redirect('/login')
})

router.post('/logout', (req, res) => {
  res.clearCookie('username')
  res.redirect('/')
})

// Export the router as the module default so app.use receives a middleware
module.exports = router
module.exports.mustAuth = mustAuth
module.exports.loadUser = loadUser
