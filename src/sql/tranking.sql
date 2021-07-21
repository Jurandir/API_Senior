SELECT 
     a.cdempresa            AS CdEmpresa                    -- EMPRESA/FILIAL EMITENTE DO CTRC
    ,aa.nrcgccpf            AS NrCNPJTransportador          -- CNPJ DO EMITENTE DO CTRC
    ,aa.dsempresa           AS NomeTransportador            -- RAZÃO SOCIAL DO EMITENTE DO CTRC
	,aa.dsapelido           AS DsFilial                     -- SIGLA DA EMPRESA/FILIAL ORIGEM
	,a.nrdoctofiscal        AS CTRC                         -- NUMERO DO CTe
	,f.dsapelido            AS DsTipoFiscal                 -- TIPO FISCAL DO DOCUMENTO
	,a.dtemissao            AS DtEmissaoCTRC                -- DATA DE EMISSÃO DO CTRC
	,${Base}.dbo.SP_CalculaDtPrevisaoEntregaPercurso(a.DtEmissao, a.CdEmpresaDestino, a.CdPercurso, a.CdTransporte, a.CdRemetente, a.CdDestinatario, a.cdempresa, a.nrseqcontrole) 
	                        AS DtPrevisaoEntrega            -- PREVISÃO DE ENTREGA
	,o.DtCadastro           AS DtColeta                     -- DATA DA COLETA
	,a.dtentrega            AS DtEntrega                    -- DATA DE ENTREGA
	,b.nrnotafiscal         AS NrNotaFiscal                 -- NUMERO DA NOTA FISCAL
	,b.nrserie              AS SerieNF                      -- SERIE DA NOTA FISCAL
    ,c.DtEmissao            AS DtEmissaoNF                  -- DATA DE EMISSÃO DA NOTA FISCAL
	,c.NrChaveAcessoNFe     AS NrChaveAcessoNFe             -- DANFE / CHAVE DA NFe
	,d.cdocorrencia         AS CdOcorrencia                 -- CODIGO DA OCORRENCIA
	,d.dtmovimento          AS DtOcorrencia                 -- DATA DA OCORRENCIA
	,e.dshistoricoentrega   AS DsOcorrencia                 -- DESCRIÇÃO DA OCORRENCIA
	,bb.CdChaveAcesso       AS NrChaveAcessoCTe             -- CHAVE DA CTe
	,bb.insituacaosefaz     AS CdSituacaoSefaz              -- CODIGO DE SUTUAÇÃO NA SEFAZ
	,bb.DsSituacaoSefaz     AS DsSituacaoSefaz              -- DESCRIÇÃO DA SITUAÇÃO NA SEFAZ
	,bb.nrProtocoloCte      AS NrProtocoloCTe               -- NUMERO DE PROTOCOLO / RETORNO SEFAZ
	,A.CdRemetente          AS CdRemetente                  -- CODIGO DO REMETENTE DA CARGA / EMBARCADOR
	,g.dsentidade           AS DsRemetente                  -- NOME DO REMETENTE
	,g.NrCGCCPF             AS NrCNPJCPFRemetente           -- CNPJ DO REMETENTE
	,A.CdDestinatario       AS CdDestinatario               -- CODIGO DO DESTINATARIO DA CARGA / RECEBEDOR
	,h.dsentidade           AS DsDestinatario               -- NOME DO DESTINATARIO 
	,h.NrCGCCPF             AS NrCNPJCPFDestinatario        -- CNPJ DO DESTINATARIO
	,A.CdInscricao          AS CdTomadorServico             -- CODIGO DO TOMADOR DO SERVIÇO / PAGADOR
	,i.dsentidade           AS DsTomadorServico             -- NOME DO TOMADOR
	,i.NrCGCCPF             AS NrCNPJCPFTomadorServico      -- CNPJ DO TOMADOR
	,a.nrcepcoleta          AS NrCEPcoleta                  -- CEP DO LOCAL DE COLETA
	,j.CdIbge               AS CdIBGEorigem                 -- CODIGO DO IBGE DA ORIGEM DA VIAGEM/TRANSPORTE
	,j.dslocal              AS DsLocalOrigem                -- NOME DA CIDADE DA ORIGEM DA VIAGEM/TRANSPORTE
	,j.DsUF                 AS DsUFOrigem                   -- UF DA ORIGEM DA VIAGEM/TRANSPORTE
	,l.dsApelido            AS DsFilialOrigem               -- SIGLA FILIAL ORIGEM
	,a.nrcepentrega         AS NrCEPentrega                 -- CEP DO LOCAL DE ENTREGA
	,k.CdIbge               AS CdIBGEEntrega                -- CODIGO IBGE DO LOCAL DE ENTREGA
	,k.DsLocal              AS DsLocalEntrega               -- CIDADE DO LOCAL DE ENTREGA
	,h.DsBairro             AS DsBairroEntrega              -- BAIRRO DO LOCAL DE ENTREGA
	,h.DsEndereco           AS DsLogradouroEntrega          -- ENDEREÇO DO LOCAL DE ENTREGA
	,h.DsNumero             AS NrEnderecoEntrega            -- NUMERO NO ENDEREÇO DE ENTREGA
	,k.DsUF                 AS DsUFEntrega                  -- UF DO ENDEREÇO DE ENTREGA
	,a.cdEmpresadestino     AS CdEmpresaDestino             -- EMPRESA/FILIAL DESTINO 
	,m.DsEmpresa            AS DsEmpresaDestino             -- NOME DA FILIAL DE DESTINO
	,m.dsApelido            AS DsFilialDestino              -- SIGLA DA FILIAL DE DESTINO
	,n.CdIbge               AS CdIBGEDestino                -- CODIGO IBGE DA FILIAL DESTINO
	,n.DsLocal              AS DsLocalDestino               -- CIDADE DA FILIAL DE DESTINO
	,n.DsBairro             AS DsBairroDestino              -- BAIRRO DA FILIAL DE DESTINO
	,n.DsLogradouros        AS DsLogradouroDestino          -- ENDEREÇO DA FILIAL DE DESTINO
	,m.DsNumero             AS NrFilialDestino              -- NUMERO DO ENDEREÇO DA FILIAL DE DESTINO
	,n.DsUF                 AS DsUFDestino                  -- UF DA FILIAL DE DESTINO
	,a.VlLiquido            AS VlFreteCTe                   -- VALOR LIQUIDO DO CONHECIMENTO
	,a.VlMercadoria         AS VlMercadoriaCTe              -- VALOR TOTAL DO CONHECIMENTO 
	,c.VlNotaFiscal         AS VlNotaFiscal                 -- VALOR DA NOTAFISCAL
	,a.QtPeso               AS QTPesoCTe                    -- PESO TOTAL NO CONHECIMENTO
	,c.QtPeso               AS QtPesoNF                     -- PESO INFORMADO NA FOTAFISCAL
	,a.QTVolume             AS QtVolumeCTe                  -- VOLUME TOTAL NO CONHECIMENTO
	,c.QtVolume             AS QTVolumeNF                   -- VOLUME NA NOTAFISCAL
FROM ${Base}.dbo.gtcconhe      a                                          -- Conhecimento
LEFT JOIN ${Base}.dbo.sisempre aa ON aa.cdempresa         = a.cdempresa   -- Filial Origem
LEFT JOIN ${Base}.dbo.gtcconce bb ON bb.cdempresa         = a.cdempresa	  AND bb.nrseqcontrole = a.nrseqcontrole -- CTe Fiscal
LEFT JOIN ${Base}.dbo.gtcnfcon b  ON b.cdempresa          = a.cdempresa	  AND b.nrseqcontrole = a.nrseqcontrole  -- Link CTRC x NF
LEFT JOIN ${Base}.dbo.gtcnf    c  ON c.cdremetente        = b.cdinscricao AND c.nrserie = b.nrserie AND c.nrnotafiscal = b.nrnotafiscal  -- NotaFiscal
LEFT JOIN ${Base}.dbo.gtcmoven d  ON d.cdempresa          = a.cdempresa   AND d.nrseqcontrole = a.nrseqcontrole  -- Movimento de Ocorrencias
LEFT JOIN ${Base}.dbo.gtchisen e  ON e.cdhistoricoentrega = d.cdocorrencia     -- Ocorrencias
LEFT JOIN ${Base}.dbo.sistdf   f  ON f.cdtpdoctofiscal    = a.cdtpdoctofiscal  -- Tipo Fiscal
LEFT JOIN ${Base}.dbo.siscli   g  ON g.cdinscricao        = a.cdremetente      -- Clientes Remetente
LEFT JOIN ${Base}.dbo.siscli   h  ON h.cdinscricao        = a.cddestinatario   -- Clientes Destinatários
LEFT JOIN ${Base}.dbo.siscli   i  ON i.cdinscricao        = a.cdinscricao      -- Clientes Pagador
LEFT JOIN ${Base}.dbo.siscep   j  ON j.nrcep              = a.nrcepcoleta      -- CEP Filial Origem
LEFT JOIN ${Base}.dbo.siscep   k  ON k.nrcep              = a.nrcepentrega     -- CEP Local Entrega
LEFT JOIN ${Base}.dbo.sisempre l  ON l.cdempresa          = a.cdempresa        -- Filial Origem
LEFT JOIN ${Base}.dbo.sisempre m  ON m.cdempresa          = a.cdempresadestino -- Filial Destino
LEFT JOIN ${Base}.dbo.siscep   n  ON n.nrcep              = m.nrcep            -- CEP Filial Destino
LEFT JOIN ${Base}.dbo.CCEColet o  ON o.CdEmpresa          = a.CdEmpresa    AND o.NrColeta = a.NrColeta  -- Coleta
WHERE isnull(e.InExibehist, 0) = 0
      ${filtro}
	-- AND b.nrnotafiscal=1517772
	-- AND a.nrdoctofiscal = 4183
