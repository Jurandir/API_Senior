SELECT 
     a.cdempresa            AS CdEmpresa                    -- EMPRESA/FILIAL EMITENTE DO CTRC
    ,aa.nrcgccpf            AS NrCNPJTransportador          -- CNPJ DO EMITENTE DO CTRC
    ,aa.dsempresa           AS NomeTransportador            -- RAZÃO SOCIAL DO EMITENTE DO CTRC
	,aa.dsapelido           AS DsFilial                     -- SIGLA DA EMPRESA/FILIAL ORIGEM
	,a.nrdoctofiscal        AS CTRC                         -- NUMERO DO CTe
    ,a.InTipoEmissao        AS  InTipoEmissao               -- TIPO DE EMISSÃO/CTRC
    ,CASE 
		WHEN a.InTipoEmissao =00 THEN 'NORMAL'
		WHEN a.InTipoEmissao =01 THEN 'DEV. TOTAL'
		WHEN a.InTipoEmissao =02 THEN 'REENTREGA ** COMPLEMENTAR TERMACO'
		WHEN a.InTipoEmissao =03 THEN 'DEV. PARCIAL'
		WHEN a.InTipoEmissao =04 THEN 'COMPLEMENTAR ** TERMACO'
		WHEN a.InTipoEmissao =05 THEN 'COTAÇÃO DE FRETE'
		WHEN a.InTipoEmissao =06 THEN 'ARMAZENAGEM ** COMPLEMENTAR TERMACO'
		WHEN a.InTipoEmissao =07 THEN 'COMPLEMENTAR - PALETIZAÇÃO ** COMPLEMENTAR TERMACO'
		WHEN a.InTipoEmissao =08 THEN 'DIÁRIA ** COMPLEMENTAR TERMACO'
		WHEN a.InTipoEmissao =09 THEN 'REDESPACHO PRÓPRIO'
		WHEN a.InTipoEmissao =10 THEN 'AGENDAMENTO ** COMPLEMENTAR TERMACO'
		WHEN a.InTipoEmissao =11 THEN 'REDESPACHO'
		WHEN a.InTipoEmissao =12 THEN 'SUB-CONTRATO'
		WHEN a.InTipoEmissao =13 THEN 'REFATURAMENTO'
		WHEN a.InTipoEmissao =14 THEN 'SUBSTITUTO'
		WHEN a.InTipoEmissao =15 THEN 'ANULAÇÃO' ELSE 'OUTROS' 
	 END                    AS DsTipoEmissao	            -- DESCRIÇÃO DO TIPO DE EMISSÃO/CTRC
	,f.dsapelido            AS DsTipoFiscal                 -- TIPO FISCAL DO DOCUMENTO
	,a.dtemissao            AS DtEmissaoCTRC                -- DATA DE EMISSÃO DO CTRC
	,${Base}.dbo.SP_CalculaDtPrevisaoEntregaPercurso(a.DtEmissao, a.CdEmpresaDestino, a.CdPercurso, a.CdTransporte, a.CdRemetente, a.CdDestinatario, a.cdempresa, a.nrseqcontrole) 
	                        AS DtPrevisaoEntrega            -- PREVISÃO DE ENTREGA
	,o.DtCadastro           AS DtColeta                     -- DATA DA COLETA
	--,a.dtentrega            AS DtEntrega                    -- DATA DE ENTREGA
    ,(SELECT MAX(CAST(CONCAT(FORMAT(MOV.DtMovimento,'yyyy-MM-dd'),' ', FORMAT(MOV.HrMovimento,'HH:mm:ss')) as datetime)) 
        FROM softran_termaco.dbo.GTCMOVEN MOV
       WHERE MOV.CDOCORRENCIA IN (1,24,105)
         AND MOV.CdEmpresa = A.cdempresa
         AND MOV.NrSeqControle = A.nrseqcontrole )       
		                    AS DtEntrega	
	,b.nrnotafiscal         AS NrNotaFiscal                 -- NUMERO DA NOTA FISCAL
	,b.nrserie              AS SerieNF                      -- SERIE DA NOTA FISCAL
    ,c.DtEmissao            AS DtEmissaoNF                  -- DATA DE EMISSÃO DA NOTA FISCAL
	,c.NrChaveAcessoNFe     AS NrChaveAcessoNFe             -- DANFE / CHAVE DA NFe
	,d.cdocorrencia         AS CdOcorrenciaSenior           -- CODIGO DA OCORRENCIA USADA PELA TERMACO
	--,(CASE WHEN w.DEPARA_ID IS NULL THEN d.cdocorrencia ELSE w.CD_CLIENTE END)
	,(CASE WHEN x.CdHistoricoRemetente IS NULL THEN d.cdocorrencia ELSE x.CdHistoricoRemetente END)
	                        AS CdOcorrencia                 -- CODIGO DA OCORRENCIA USADA PELO CLIENTE
	,CAST(CONCAT(FORMAT(d.DtMovimento,'yyyy-MM-dd'),' ', FORMAT(d.HRMovimento,'HH:mm:ss')) as datetime)
	                        AS DtOcorrencia                 -- DATA DA OCORRENCIA
	,e.dshistoricoentrega   AS DsOcorrencia                 -- DESCRIÇÃO DA OCORRENCIA
	,d.DsContato            AS DsResponsavel                -- NOME DO CONTATO/RESPONSAVEL
	,p.CdSituacaoCarga      AS CdSituacaoCarga              -- CODIGO SITUAÇÃO DA CARGA
	,p.DsSituacaoCarga      AS DsSituacaoCarga              -- SITUAÇÃO DA CARGA
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
LEFT JOIN ${Base}.dbo.GTCSITCG p  ON p.CdSituacaoCarga    = a.CdSituacaoCarga  -- Situação Atual da Carga
-- LEFT JOIN SIC..API_DEPARA      w  ON w.TIPO_ID = 1 AND w.CD_SENIOR = d.cdocorrencia AND w.RAIZ = ${raiz_token}  -- DE PARA OCORRENCIAS DOS CLIENTES
LEFT JOIN ${Base}.dbo.GTCVHist x  ON x.CdInscricao = '${CNPJ_cli}' and x.CdHistoricoEntrega = d.cdocorrencia

WHERE ( isnull(e.InExibehist, 0) = 0 OR isnull(x.InGeraOcorrencia, 0) = 1 )
   -- Ajuste 30/12/2021
  AND ( a.InTipoEmissao in (00,01,02,03,09,11,12,13,14) or ( a.InTipoEmissao = 05 and a.InTpCTE = 00) )
  AND bb.insituacaosefaz = 100            

  ${filtro}
