// 26-07-2021 
const sqlQuery         = require('../../connection/sqlSENIOR')
const estadosAtendidos = require('../../helpers/estadosAtendidos')

async function dadosCidadesAtendidas( req, res ) {

    let {Base, uf, cidade} = req.query
    let addSql = ''
    let value = ''

    if (!Base) {
        Base = 'softran_termaco'
    }

    if(uf) {
       value = `${uf}`.toUpperCase() 
       addSql = addSql + ` AND (UF = '${value}') `
    }

    if(cidade) {
        value = `${cidade}`.toUpperCase()
        addSql = addSql + ` AND (CID_NOME LIKE '%${value}%') `
     }
 

    let retorno = {
        success: false,
        message: 'Dados não localizados !!!',
        data: [],
        rows: 0
    }

    let listaUF        = estadosAtendidos()
    let estadosValidos = `AND '${ listaUF.join(',') }' like '%'+UF+'%'  `

    let s_select = `
    SELECT * FROM (
        SELECT 
               (SELECT TOP 1 CDIBGE FROM ${Base}.dbo.SISCEP XX WHERE XX.CDREGIAO=A.CDREGIAO AND ISNULL(XX.CDIBGE,0)>0) AS CID_CODIGO,
               (SELECT TOP 1 DSUF FROM ${Base}.dbo.SISCEP XX WHERE XX.CDREGIAO=A.CDREGIAO AND ISNULL(XX.CDIBGE,0)>0) AS UF,
               A.DSREGIAO AS CID_NOME,
               B.DSAPELIDO AS CID_BASE,
               B.DSAPELIDO AS CID_BASE_ENTREGA,
               ISNULL(A.INCOLETA,0) AS ACEITACOLETA, 
               ISNULL(A.INENTREGA,0) AS ACEITAENTREGA,
               CASE WHEN ISNULL(A.INFRETEAPAGAR,0)=0 THEN 'N' ELSE 'S' END  AS ACEITAFOB
        FROM ${Base}.dbo.SISREGIA A
        LEFT JOIN ${Base}.dbo.SISEMPRE B ON B.CDEMPRESA=A.CDEMPRESA
        WHERE ISNULL(A.NRNIVEL,0)=0
        ) Z 
        WHERE 1=1    
        ${estadosValidos}
        ${addSql}
        ORDER BY UF,CID_NOME
        `
        try {
            let data = await sqlQuery(s_select)
      
            let { Erro } = data
            if (Erro) { 
              throw new Error(`DB ERRO - ${Erro} - Params = [ ${Base}, ${addSql} ]`)
            }
            
            retorno.data = data
            if(!data || data.length==0){
                retorno.message = `Cidade não encontrada na Base (${Base})`
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
            retorno.rotine  = 'dadosCidadesAtendidasPOST.js'
            retorno.sql     =  s_select
            res.json(retorno).status(500) 
        }
        
}

module.exports = dadosCidadesAtendidas
