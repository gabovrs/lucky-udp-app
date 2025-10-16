const mongoose = require('mongoose')

const UsuarioSchema = new mongoose.Schema({
  username: String,
  password: String
})

const Usuario = mongoose.model('Usuario', UsuarioSchema)

module.exports = Usuario