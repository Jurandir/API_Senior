const express      = require('express')  
const path         = require('path')
const morgan       = require('morgan')
const moment       = require('moment')
const app          = express()  

require('dotenv').config()

const api          = require('./src/routes/api')
const senior       = require('./src/routes/senior')
const test         = require('./src/routes/test')

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

// Rotas Testes
app.use('/test'  , test )  

// Downloads

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
    if (req.method === 'OPTIONS') {
      return res.send(200);
    } else {
      return next();
    }
  })

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