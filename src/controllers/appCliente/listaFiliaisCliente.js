// 20-07-2021 
const sqlQuery     = require('../../connection/sqlSENIOR')

async function listaFiliaisCliente(req, res) {
    let { Base, cnpj } = req.query

    if (!Base) {
        Base = 'softran_termaco'
    }

    let retorno = {
        success: false,
        message: 'Dados não localizados !!!',
        data: [],
        rows: 0
    }


    try {
        if(!cnpj){
            throw new Error(`CNPJ/CPF não informado`)
        }

        let raiz = cnpj.substr(0,8)
        let wsql = `
        SELECT CLI.NrCGCCPF    AS CNPJ
        ,      CLI.DsEntidade  AS NOME
        ,      CLI.NrCEP       AS CEP
        ,      CEP.DsLocal     AS CIDADE
        ,      CEP.DsUF        AS UF
        FROM ${Base}.dbo.siscli CLI
        JOIN ${Base}.dbo.siscep CEP  ON CEP.nrcep = CLI.NrCEP 
        WHERE CLI.NrCGCCPF like '${raiz}%'`

        data = await sqlQuery(wsql)
             
        let { Erro } = data
        if (Erro) { 
            throw new Error(`DB ERRO - ${Erro} -> ${wsql} Base: ${Base}`)
        } 
        
        retorno.success = true
        retorno.message = 'Sucesso. OK.'
        retorno.data = data
        retorno.rows = data.length
                               
        res.json(retorno).status(200) 
                  
    } catch (err) { 

        retorno.success = false
        retorno.message = err.message
        retorno.rotine  = 'listaFiliaisCliente'
        retorno.err     = err                            
        res.json(retorno).status(500) 

    }    
}
                

module.exports = listaFiliaisCliente
