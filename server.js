const express      = require('express')  
const path         = require('path')
const morgan       = require('morgan')
const moment       = require('moment')
const app          = express()  

require('dotenv').config()

const api          = require('./src/routes/api')
const senior       = require('./src/routes/senior')

// parse application/json
app.use(express.json({limit:'4mb'}))

// Log 
app.use(
    morgan(function (tokens, req, res) {
        return [
        moment().format(),'-',
        tokens['user-agent'](req, res),
        tokens['remote-addr'](req, res),'-',
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms'
        ].join(' ')
    })
)

// Rotas API
app.use('/api'   , api ) 

// Rotas Sênior
app.use('/senior', senior )  

// Downloads
app.use(express.static('public'))
app.use('/downloads',express.static('public'))

// On-Line
app.use('/', (req, res)=>{
    res.send(`<h1>API - On-Line.</h1><p>${moment().format()}</p><p>endpoint não localizado: ${req._parsedUrl.pathname} </p>`)
} )  

// Serviço
const port = process.env.PORT || '4999'
const modo = process.env.NODE_ENV || 'Test'

app.listen(port, function () {
    console.log(moment().format(),`Sênior "API" - rodando na porta ${port} : Modo ${modo}`)
})