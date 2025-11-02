const express = require('express')
const cookieParser = require('cookie-parser')
const { engine } = require('express-handlebars')

const app = express()

// Configurar Handlebars para usar la extensión .hbs y el layout por defecto
app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: './views/layouts',
  partialsDir: './views/partials',
  helpers: {
    formatMoney: (value) => {
      const num = Number(value)
      if (isNaN(num)) return '$0'
      return '$' + num.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    },
    formatDate: (value) => {
      const d = new Date(value);
      return isNaN(d) ? '' : new Intl.DateTimeFormat('es-CL', {
        dateStyle: 'medium', timeStyle: 'short'
      }).format(d);
    },
    ifGreaterThan: function (a, b, options) {
      const numA = Number(a)
      const numB = Number(b)
      if (!Number.isNaN(numA) && !Number.isNaN(numB) && numA > numB) {
        return options.fn(this)
      }
      return options.inverse(this)
    },
  }
})
)

app.set('view engine', 'hbs')
app.set('views', './views')

// Middlewares
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true })) // parse application/x-www-form-urlencoded
app.use(express.json()) // parse application/json

app.use((req, res, next) => {
  res.locals.isLoggedIn = !!req.cookies.username
  next()
})

require('./database') // Conectar a la base de datos

// Montar rutas
app.use('/', require('./routes/pages'))
app.use('/', require('./routes/auth'))
app.use('/', require('./routes/wallet'))
app.use('/games', require('./routes/games'))

app.use((req, res) => {
  res.status(404).render('pages/404', {
    title: 'Página no encontrada',
  })
})

// Iniciar el servidor
const PORT = process.env.PORT || 80

app.listen(PORT, () => {
  console.log(`App corriendo en http://localhost:${PORT}`)
})
