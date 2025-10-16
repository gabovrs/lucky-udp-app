const express = require('express')
const { engine } = require('express-handlebars')
const bodyParser = require('body-parser')

const app = express()
const port = 80

// Conectar a la base de datos (lee MONGO_URI desde .env)
require('./database')

// Modelo de usuario (Mongoose)
const Usuario = require('./user.model')

// Configurar Handlebars como motor de plantillas
app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', './views')

// Middleware para parsear el cuerpo de las solicitudes
app.use(bodyParser.urlencoded({ extended: true }))

// Ruta para manejar el registro de usuarios
app.get('/register', (req, res) => {
  res.render('register')
})

// Ruta para manejar el registro de usuarios
app.post('/register', async (req, res) => {
  const { username, password } = req.body
  const newUser = new Usuario({ username, password })
  await newUser.save()
  res.send('Usuario registrado exitosamente.')
})

// Ruta para manejar el login de usuarios
app.get('/login', (req, res) => {
  res.render('login')
})

// Ruta para manejar el login de usuarios
app.post('/login', async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await Usuario.findOne({ username, password })

    if (!user) {
      return res.send('Credenciales inválidas. <a href="/login">Intentar de nuevo</a>')
    }

    res.send(`Bienvenido, ${user.username}! Has iniciado sesión exitosamente.`)
  } catch (err) {
    console.error('Error al iniciar sesión:', err)
    res.status(500).send('Error interno del servidor.')
  }
})

// Ruta principal que redirige al login
app.get('/', (req, res) => {
  res.redirect('/login')
})

// Iniciar el servidor
app.listen(port, () => {
  console.log(`App corriendo en http://localhost:${port}`)
})
