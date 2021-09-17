const baixaOcorrencia = (danfe) => {
    return  { 
            BaixaOcorrenciaResult:{         
                Mensagem: `Documento CTRC ${danfe}. (API Fake)`,
                Protocolo: 'B3B14EB1748226DFE053C24DEC0AA494',
                Sucesso: true }
	}
}

module.exports = baixaOcorrencia


/*
            BaixaOcorrenciaResult:{         
                Mensagem: 'Documento CTRC não encontrado. (API Fake)',
                Protocolo: 'B3B14EB1748226DFE053C24DEC0AA494',
                Sucesso: false }
*/
