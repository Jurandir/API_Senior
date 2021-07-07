const entrada   = require('./entrada')
const saida     = require('./saida')

/*
0 - ENTRADA
1 - SAÍDA
*/

const insertMovimento = async(obj) => {
    let {Base,movimento,origem} = obj
    let insert = (movimento.InEntradaSaida==0) ? entrada : saida
    let ret     = await insert(Base,movimento,origem)

    console.log('RET insertMovimento', ret)

    return ret
}

module.exports = insertMovimento