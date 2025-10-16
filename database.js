const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const mongoURI = process.env.MONGO_URI

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Conectado a la base de datos MongoDB')
})
.catch(err => {
  console.error('Error al conectar a la base de datos MongoDB:', err)
})
