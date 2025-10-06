const express = require('express')
const { engine } = require('express-handlebars')
const bodyParser = require('body-parser')

const app = express()
const port = 80

// Configurar Handlebars como motor de plantillas
app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', './views')

// Middleware para parsear el cuerpo de las solicitudes
app.use(bodyParser.urlencoded({ extended: true }))

// Array para almacenar usuarios
const usuarios = []

// Ruta para manejar el registro de usuarios
app.get('/register', (req, res) => {
  res.render('register')
})

// Ruta para manejar el registro de usuarios
app.post('/register', (req, res) => {
  const { username, password } = req.body
  const existe = usuarios.find(u => u.username === username)

  if (existe) {
    return res.send('Usuario ya existe. <a href="/register">Volver</a>')
  }

  usuarios.push({ username, password })
  res.redirect('/login')
})

// Ruta para manejar el login de usuarios
app.get('/login', (req, res) => {
  res.render('login')
})

// Ruta para manejar el login de usuarios
app.post('/login', (req, res) => {
  const { username, password } = req.body
  const usuario = usuarios.find(u => u.username === username && u.password === password)

  if (!usuario) {
    return res.send('Credenciales inválidas. <a href="/login">Intentar de nuevo</a>')
  }

  res.render('welcome', { username })
})

// Ruta principal que redirige al login
app.get('/', (req, res) => {
  res.redirect('/login')
})

// Iniciar el servidor
app.listen(port, () => {
  console.log(`App corriendo en http://localhost:${port}`)
})