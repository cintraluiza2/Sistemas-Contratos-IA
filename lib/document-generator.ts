export function generateContract(tipo: string): Blob {
  // Simulação de geração de contrato DOCX
  const content = `
CONTRATO DE ${tipo.toUpperCase().replace(/-/g, " ")}

Este contrato foi gerado automaticamente pelo sistema ContratosPro.

PARTES:
- CONTRATANTE: [Nome do Contratante]
- CONTRATADO: [Nome do Contratado]

OBJETO:
O presente contrato tem por objeto...

CLÁUSULAS:
1. Das Condições Gerais
2. Das Obrigações das Partes
3. Do Pagamento
4. Das Penalidades
5. Do Foro

Data: ${new Date().toLocaleDateString("pt-BR")}

_______________________          _______________________
    CONTRATANTE                      CONTRATADO
`

  return new Blob([content], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })
}

export function generateLegalOpinion(tipo: string): Blob {
  // Simulação de geração de parecer jurídico DOCX
  const content = `
PARECER JURÍDICO
Ref: ${tipo.toUpperCase().replace(/-/g, " ")}

ANÁLISE JURÍDICA

1. INTRODUÇÃO
O presente parecer tem por objetivo analisar os aspectos jurídicos relacionados ao contrato de ${tipo.replace(/-/g, " ")}.

2. FUNDAMENTAÇÃO LEGAL
- Código Civil Brasileiro
- Lei de Registros Públicos
- Legislação Municipal Aplicável

3. ANÁLISE DOS DOCUMENTOS
Após análise detalhada dos documentos apresentados, verificamos que:
- Todos os documentos estão em conformidade com a legislação vigente
- As partes possuem capacidade jurídica para o ato
- Não foram identificados impedimentos legais

4. CONCLUSÃO
Diante do exposto, opinamos favoravelmente à celebração do contrato, desde que observadas as recomendações apresentadas.

Data: ${new Date().toLocaleDateString("pt-BR")}

_______________________
Assessoria Jurídica
ContratosPro
`

  return new Blob([content], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })
}
