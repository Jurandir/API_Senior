const sqlQuery     = require('../../connection/sqlSENIOR')
const json2xlsx    = require('json2xls')
const crypto       = require('crypto')
const fs           = require('fs')

const server          = process.env.IP_EXTERNO || 'localhost'
const port            = process.env.PORT   || '4999'

const URL_DOWNLOAD    = `http://${server}:${port}/downloads`

async function lista_TDE_TRT( req, res ) {
    
    let dados = await dadosPesquisa()

    let xlsx 
    let filename
   
    xlsx = json2xlsx(dados)

    filename = crypto.randomBytes(20).toString('hex')+'.xlsx'
    fs.writeFileSync(`./public/downloads/${filename}`, xlsx, 'binary');

    try {

        let url = `${URL_DOWNLOAD}/${filename}`
   
        res.json({
            success: true,
            download: url
        }).status(200) 
  
    } catch (err) { 
        res.send({ success: false,"erro" : err.message, "rotina" : "lista_TDE_TRT" }).status(500) 
    }    

    async function dadosPesquisa() {
        let wsql = `
        SELECT * FROM (
            select 'TDE' RESTRICAO
                  ,CLI.NrCGCCPF CNPJCPF
                  ,CLI.DsEntidade NOME
                  ,CLI.DsEndereco ENDERECO
                  ,CLI.DsNumero NUMERO
                  ,CLI.DsBairro BAIRRO
                  ,CLI.NrCEP CEP
                  ,CEP.DsLocal CIDADE
                  ,CEP.DsUF UF
            from softran_termaco..SISCli CLI
            join softran_termaco..SISCep CEP ON CEP.NrCep = CLI.NrCEP
            where isnull(inlocaldificilent,0)=1
            union all
            select distinct
                   'TRT' RESTRICAO
                  ,CLI.NrCGCCPF CNPJCPF
                  ,CLI.DsEntidade NOME
                  ,CLI.DsEndereco ENDERECO
                  ,CLI.DsNumero NUMERO
                  ,CLI.DsBairro BAIRRO
                  ,CLI.NrCEP CEP
                  ,CEP.DsLocal CIDADE
                  ,CEP.DsUF UF
            from softran_termaco..SISCli CLI
            join softran_termaco..SISCep CEP ON CEP.NrCep = CLI.NrCEP
            join softran_termaco..EXPTAX TRT ON TRT.NrCEPEntrega = CLI.NrCep
            join softran_termaco..EXPTTX TX  ON TX.CdTipoTaxa = TRT.CdTipoTaxa
            where 1=1
              and isnull(TRT.InSituacao,0)=0
              and TX.InTipoTaxa = 16 -- TRT
            ) Z
            ORDER BY Z.RESTRICAO,Z.UF,Z.CIDADE,Z.NOME    
        ` 
        data = await sqlQuery(wsql)
        return data
    }
}

module.exports = lista_TDE_TRT