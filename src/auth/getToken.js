const jwt = require('jsonwebtoken')
const moment = require('moment')
const secret =  process.env.SECRET

const getToken = async ( CdEmpresa, DsApelido ) => {
    let ret        = { Bearer : '', createIn: moment().format() ,expiresIn: '' }
    let expiration = new Date()
    let addTime    = expiration.getHours() + 48

    expiration.setHours(addTime)

    ret.Bearer    = await jwt.sign({ "CdEmpresa" : CdEmpresa, "DsApelido": DsApelido  }, secret, { expiresIn: '24h'})
    ret.expiresIn = moment(expiration).format()

    return ret 
}
 
module.exports = getToken
