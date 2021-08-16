// Transferir os "Usuarios Clientes" com suas senhas do Cargas TMS para o Senior TMS
// 16/07/2021 17:07

const sqlSENIOR   = require('../connection/sqlSENIOR')
const sqlExSENIOR = require('../connection/sqlExSENIOR')
const sqlFORTES   = require('../connection/sqlQuery')

const Base = 'softran_termaco'

let queryFORTES = 'SELECT SENHA,CGCCPF,NOME,EMAIL FROM CARGASSQL.dbo.CLI WHERE ISNULL(SENHA,0) > 0 ORDER BY CGCCPF'

async function insertNewCliWEB(CdInscricao,DsSenha,DsEmail) {
    let sql = `
        INSERT INTO ${Base}.dbo.SISWEBUSU( 	
        ID            --- SELECT MAX(ID)+1 FROM SISWEBUSU
    ,   InTipoUsuario --- tipo usuario = 1 ( Cliente )
    ,   CdInscricao   --- CNPJ Cliente
    ,	DsLogin       --- Login do Cliente CNPJ
    ,   DsSenha       --- Senha do Cliente
    ,	DsEmail       --- Email
    ,	CdPerfil      --- Perfil ( 111 )
    ,	InDesativado  --- Desativado ( 0 )
    ,   QtTempoSessao --- Sessão TimeOut ( 20 )
    ,   DtCadastro    --- Data cadastro
    ) VALUES (
    (SELECT MAX(ID)+1 FROM ${Base}.dbo.SISWEBUSU), 1 
    ,FORMAT(${CdInscricao},'00000000000000'),'${CdInscricao}','${DsSenha}','${DsEmail}',111,0,20, CURRENT_TIMESTAMP) `
    return sql
}

async function updateNewCliWEB(id,DsSenha,DsEmail) {
    let sql = `
        UPDATE ${Base}.dbo.SISWEBUSU
        SET DsSenha = '${DsSenha}'      --- Senha do Cliente
        ,	DsEmail = '${DsEmail}'      --- Email
        WHERE
            ID = ${id} `
    return sql
}

async function processaDados() {
    let fortesData = await sqlFORTES(queryFORTES)
    for await (let itn of fortesData) {
        let sqlUpd,resp
        let CNPJ   = parseInt( itn.CGCCPF )
        let SENHA  = itn.SENHA
        let querySENIOR = `SELECT CdInscricao,DsEMail,DsEntidade FROM ${Base}.dbo.SISCli WHERE CdInscricao = FORMAT(${CNPJ},'00000000000000')`
        let seniorData = await sqlSENIOR(querySENIOR)
        if (seniorData.length > 0) {
            // console.log(`${CNPJ} ${itn.SENHA} ${itn.NOME} ${itn.EMAIL}>`, seniorData)
            let queryUSER   = `SELECT ID FROM ${Base}.dbo.SISWEBUSU WHERE CdInscricao = FORMAT(${CNPJ},'00000000000000')`
            let userData    = await sqlSENIOR(queryUSER)
            let DsEmail     = seniorData[0].DsEMail ?  seniorData[0].DsEMail : (itn.EMAIL || 'sac@termaco.com.br' )
            let CdInscricao = CNPJ
            let DsSenha     = SENHA
            if (userData.length > 0) {
                let Id = userData[0].ID 
                console.log('Update:',Id,CdInscricao,DsEmail,DsSenha,itn.NOME)
                sqlUpd = await updateNewCliWEB(Id,DsSenha,DsEmail)
                resp   = await sqlExSENIOR(sqlUpd)
                console.log('Update RESP:',resp)

            } else {
                console.log('Insert:',CdInscricao,DsEmail,DsSenha,itn.NOME )
                sqlUpd = await insertNewCliWEB(CdInscricao,DsSenha,DsEmail)
                resp   = await sqlExSENIOR(sqlUpd)
                console.log('Insert RESP:',resp)

            }
        }
    }
}

processaDados()
