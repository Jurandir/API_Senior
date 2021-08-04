// AD
// 04/08/2021 09:26

const sqlQuery     = require('../../connection/sqlSENIOR')

async function dadosCliente( req, res ) {
    let params = req.method == 'GET' ? req.query : req.body
    let { Base, cnpj } = params
	let loginAD = `''`

    if(!Base){
        Base = 'softran_termaco'
    }
	
	if(req.loginAD) {
		loginAD = 'SEN.DsSenha'
	}	
 
    let s_select = `
                SELECT TOP 1 * FROM (
                    SELECT 
                        ${loginAD}             SENHA
                    ,   CLI.DsApelido           NOME
                    ,   CLI.DsEntidade          RAZAO
                    ,   CLI.CdInscricao         CNPJ
                    ,   CLI.NrInscricaoEstadual IE
                    ,   CLI.DsEndereco          ENDERECO
                    ,   CLI.DsNumero            NUMERO
                    ,   CLI.DsBairro            BAIRRO
                    ,   CEP.DsLocal             CIDADE
                    ,   CEP.NrCep               CEP
                    FROM ${Base}.dbo.SISCLI CLI
                    LEFT JOIN ${Base}.dbo.SISWEBUSU SEN ON SEN.CdInscricao = CLI.CdInscricao
                    LEFT JOIN ${Base}.dbo.SISCEP    CEP ON CEP.NrCep       = CLI.NrCEP
                    WHERE CLI.CdInscricao='${cnpj}'
                    
                    UNION ALL
                    
                    SELECT 
                        NULL                    SENHA
                    ,   EMP.DSAPELIDO           NOME
                    ,   EMP.DSEMPRESA           RAZAO
                    ,   EMP.NRCGCCPF            CNPJ
                    ,   EMP.NRINSCRESTADUAL     IE
                    ,   EMP.DSENDERECO          ENDERECO
                    ,   EMP.DsNumero            NUMERO
                    ,   EMP.DSBAIRRO            BAIRRO
                    ,   CEP.DsLocal             CIDADE
                    ,   CEP.NrCep               CEP
                    FROM ${Base}.dbo.SISEMPRE EMP 
                    LEFT JOIN ${Base}.dbo.SISCEP    CEP ON CEP.NrCep       = EMP.NrCEP
                    WHERE EMP.CDEMPRESA=1
                    ) AS CLI `
        
    try {  

        let profileset  = await sqlQuery(s_select)
        
        let { Erro } = profileset

        if (Erro) { 
          throw new Error(`DB ERRO - ${Erro} - Params = [ ${Base}, ${cnpj} ]`)
        }        

        let send_data   =  profileset.length > 0 ? profileset[0] : { }

        res.json(send_data).status(200)

    } catch (err) {  
            let erro = { isErr: true, message: err.message , rotine: 'dadosCliente.js'}
            res.json(erro).status(500)  
    } 
}

module.exports = dadosCliente
