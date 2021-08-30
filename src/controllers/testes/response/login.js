const test_login = () => {
    return {
        "codigo": 200,
        "mensagem": "Acesso Liberado!",
        "totalCount": 1,
        "resposta": {
            "token": "5a72c267-9150-473e-bd26-3e2bc942f8f9",
            "usuario": {
                "idUsuario": 32977,
                "nome": "Termaco Logistica",
                "email": "ti@termaco.com.br",
                "tipo_usuario": "PADRAO",
                "primeiroAcesso": false
            },
            "cliente": {
                "idCliente": 112,
                "nome": "mundial"
            },
            "gestao": {
                "idUsuario": 32977,
                "tipoGestao": "TRANSPORTADORA",
                "tipoAcaoEmbarque": "OCORRENCIA_CONFIRMAR",
                "idsReferencia": [
                    189
                ],
                "idsTipoOcorrencia": []
            }
        }
    }
}
module.exports = test_login