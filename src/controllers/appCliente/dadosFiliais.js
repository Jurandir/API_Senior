// 20-07-2021 
const sqlQuery     = require('../../connection/sqlSENIOR')

async function dadosFiliais(req, res) {
    let par_where = 'WHERE 1=1'
    let retorno = {
        success: false,
        message: '',
        data: []
    }

    let { id, Base, codigo, cid_codigo } = req.query

    if (!Base) {
        Base = 'softran_termaco'
    }

    if (id) {
        par_where = par_where + ` AND (EMP.CDEMPRESA = ${id}) `
    }

    if (codigo) {
        value = `${codigo}`.toUpperCase()
        par_where = par_where + ` AND (EMP.DSAPELIDO = '${value}') `
    }

    if (cid_codigo) {
        value = `${cid_codigo}`.toUpperCase()
        par_where = par_where + ` AND (EMP.DSAPELIDO = '${value}') `
    }

    let wsql = `
    SELECT  EMP.CDEMPRESA   AS ID
    ,       EMP.DSAPELIDO   AS CODIGO
    ,       EMP.NRCGCCPF    AS CNPJ
    ,       EMP.DSEMPRESA   AS NOME
    ,       CEP.DsUF        AS UF
    ,       CEP.DsLocal     AS CIDADE
    ,       EMP.DSBAIRRO    AS BAIRRO
    ,       EMP.DSENDERECO  AS ENDERECO
    ,       EMP.DsNumero    AS NUMERO
    ,       EMP.NRCEP       AS CEP
    ,       EMP.NRTELEFONE  AS FONE
    ,       EMP.DSEMAIL     AS EMAIL
    ,       EMP.NRLATITUDE  AS LATITUDE
    ,       EMP.NRLONGITUDE AS LONGITUDE
    FROM ${Base}.dbo.sisempre EMP
    JOIN ${Base}.dbo.siscep   CEP  ON CEP.nrcep = EMP.NRCEP
         ${par_where}
    ORDER BY ID`
    try {
        let data = await sqlQuery(wsql)
  
        let { Erro } = data
        if (Erro) { 
          throw new Error(`DB ERRO - ${Erro} - Params = [ ${Base}, ${CDEMPRESA} ]`)
        }
        
        retorno.data = data
        if(!data || data.length==0){
            retorno.message = `Empresa não encontrada na Base (${Base})`
            retorno.rows    = 0
        } else {
            retorno.success = true
            retorno.message = `Sucesso. Ok.`
            retorno.rows    =  data.length
        }
               
        res.json(retorno).status(200) 
  
    } catch (err) { 
        retorno.message = err.message
        retorno.rows    =  -1
        retorno.rotine  = 'dadosFiliais.js'
        retorno.sql     =  wsql
        res.json(retorno).status(500) 
    }
}

module.exports = dadosFiliais
