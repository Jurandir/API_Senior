SELECT 
     a.cdempresa            AS CdEmpresa
    ,aa.nrcgccpf            AS NrCNPJTransportador
    ,aa.dsempresa           AS NomeTransportador
	,aa.dsapelido           AS DsFilial
	,a.nrdoctofiscal        AS CTRC
	,f.dsapelido            AS DsTipoFiscal
	,a.dtemissao            AS DtEmissaoCTRC
	,${Base}.dbo.SP_CalculaDtPrevisaoEntregaPercurso(a.DtEmissao, a.CdEmpresaDestino, a.CdPercurso, a.CdTransporte, a.CdRemetente, a.CdDestinatario, a.cdempresa, a.nrseqcontrole) 
	                        AS DtPrevisaoEntrega
	,a.dtentrega            AS DtEntrega
	,b.nrnotafiscal         AS NrNotaFiscal
	,b.nrserie              AS SerieNF
    ,c.DtEmissao            AS DtEmissaoNF
	,c.NrChaveAcessoNFe     AS NrChaveAcessoNFe
	,d.cdocorrencia         AS CdOcorrencia
	,d.dtmovimento          AS DtOcorrencia
	,e.dshistoricoentrega   AS DsOcorrencia
	,bb.CdChaveAcesso       AS NrChaveAcessoCTe
	,bb.insituacaosefaz     AS CdSituacaoSefaz
	,bb.DsSituacaoSefaz     AS DsSituacaoSefaz
	,bb.nrProtocoloCte      AS NrProtocoloCTe
	,A.CdRemetente          AS CdRemetente  
	,g.dsentidade           AS DsRemetente
	,g.NrCGCCPF             AS NrCNPJCPFRemetente
	,A.CdDestinatario       AS CdDestinatario
	,h.dsentidade           AS DsDestinatario
	,h.NrCGCCPF             AS NrCNPJCPFDestinatario
	,A.CdInscricao          AS CdTomadorServico
	,i.dsentidade           AS DsTomadorServico
	,i.NrCGCCPF             AS NrCNPJCPFTomadorServico
	,a.nrcepcoleta          AS NrCEPcoleta
	,j.CdIbge               AS CdIBGEorigem
	,j.dslocal              AS DsLocalOrigem
	,j.DsUF                 AS DsUFOrigem
	,l.dsApelido            AS DsFilialOrigem
	,a.nrcepentrega         AS NrCEPentrega
	,k.CdIbge               AS CdIBGEDestino
	,k.DsLocal              AS DsLocalDestino
	,k.DsUF                 AS DSUFDestino
	,a.cdEmpresadestino     AS CdEmpresaDestino
	,m.dsApelido            AS DsFilialDestino
	,a.VlLiquido            AS VlFreteCTe
	,a.VlMercadoria         AS VlMercadoriaCTe
	,c.VlNotaFiscal         AS VlNotaFiscal
	,a.QtPeso               AS QTPesoCTe
	,c.QtPeso               AS QtPesoNF
	,a.QTVolume             AS QtVolumeCTe
	,c.QtVolume             AS QTVolumeNF
FROM ${Base}.dbo.gtcconhe      a
LEFT JOIN ${Base}.dbo.sisempre aa ON aa.cdempresa         = a.cdempresa
LEFT JOIN ${Base}.dbo.gtcconce bb ON bb.cdempresa         = a.cdempresa	  AND bb.nrseqcontrole = a.nrseqcontrole
LEFT JOIN ${Base}.dbo.gtcnfcon b  ON b.cdempresa          = a.cdempresa	  AND b.nrseqcontrole = a.nrseqcontrole
LEFT JOIN ${Base}.dbo.gtcnf    c  ON c.cdremetente        = b.cdinscricao AND c.nrserie = b.nrserie AND c.nrnotafiscal = b.nrnotafiscal
LEFT JOIN ${Base}.dbo.gtcmoven d  ON d.cdempresa          = a.cdempresa   AND d.nrseqcontrole = a.nrseqcontrole  
LEFT JOIN ${Base}.dbo.gtchisen e  ON e.cdhistoricoentrega = d.cdocorrencia
LEFT JOIN ${Base}.dbo.sistdf   f  ON f.cdtpdoctofiscal    = a.cdtpdoctofiscal
LEFT JOIN ${Base}.dbo.siscli   g  ON g.cdinscricao        = a.cdremetente
LEFT JOIN ${Base}.dbo.siscli   h  ON h.cdinscricao        = a.cddestinatario
LEFT JOIN ${Base}.dbo.siscli   i  ON i.cdinscricao        = a.cdinscricao
LEFT JOIN ${Base}.dbo.siscep   j  ON j.nrcep              = a.nrcepcoleta
LEFT JOIN ${Base}.dbo.siscep   k  ON k.nrcep              = a.nrcepentrega
LEFT JOIN ${Base}.dbo.sisempre l  ON l.cdempresa          = a.cdempresa
LEFT JOIN ${Base}.dbo.sisempre m  ON m.cdempresa          = a.cdempresadestino
WHERE isnull(e.InExibehist, 0) = 0
      ${filtro}
	-- AND b.nrnotafiscal=1517772
	-- AND a.nrdoctofiscal = 4183