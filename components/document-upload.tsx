"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Upload, X, FileText, ImageIcon, File } from "lucide-react"
import { cn } from "@/lib/utils"

type ClauseOption = { id: string; label: string; text: string }

interface DocumentUploadProps {
  title: string
  onProcess: (files: File[], selectedParagraphs: string[]) => void
}

const paragraphOptions: ClauseOption[] = [
  {
    id: "paragrafo_primeiro_boleto",
    label: "PARÁGRAFO PRIMEIRO – BOLETO",
    text: `As partes declaram, para os devidos fins de direito, que:
- têm conhecimento da empresa Imobitech Soluções S/A, Fintech especialista em mercado imobiliário, e concordam que esta poderá ter acesso aos dados em posse da intermediadora, exclusivamente para comunicações restritas ao escopo deste contrato;
- concordam com a splitagem (divisão da comissão para os participantes) realizada pela Imobitech Soluções S/A sobre o valor pago pela intermediação;
- possuem ciência de que a Imobitech Soluções respeita a Lei Geral de Proteção de Dados (LGPD) e têm livre acesso aos documentos de privacidade disponíveis em seu website;
- estão cientes de que o valor a ser pago pela intermediação poderá ser objeto de antecipação pelas partes junto à Imobitech Soluções S/A, não gerando qualquer ônus;
- concordam que o valor da intermediação será pago diretamente para a empresa Imobitech Soluções S/A (conta centralizadora), e que tal pagamento, uma vez realizado, consistirá na plena e irrevogável quitação da obrigação de pagar em relação ao valor deste contrato de intermediação.`
  },
  {
    id: "paragrafo_segundo_posse_precaria",
    label: "PARÁGRAFO SEGUNDO – POSSE PRECÁRIA",
    text: `A posse precária do imóvel ora compromissado será transferida ao(s) COMPRADOR(ES), no xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx, o(s) qual(is) passará(ão) a ser o(s) responsável(is) por defendê-la de qualquer turbação ou esbulho, podendo realizar no imóvel as benfeitorias que julgar(em) necessárias, obedecendo às posturas municipais e aos regulamentos administrativos. A partir da posse precária, o(s) possuidor(es) assumirá(ão) a responsabilidade pelo pagamento de todos os encargos que recaírem sobre o imóvel.
Em caso de inadimplemento por parte do(s) COMPRADOR(ES), deverá(ão) o(s) VENDEDOR(ES) notificar sobre a rescisão contratual, oportunidade em que o(s) COMPRADOR(ES) deverá(ão) desocupar o imóvel imediatamente. Em caso de recusa, incidirá multa de R$ 1.000,00 (um mil reais) por dia de ocupação irregular.`
  },
  {
    id: "paragrafo_terceiro_dacao",
    label: "PARÁGRAFO TERCEIRO – DAÇÃO EM PAGAMENTO",
    text: `Quando a forma de pagamento incluir bens dados em pagamento, as partes estipulam desde já que o(s) VENDEDOR(ES) arcará(ão) com todas as despesas necessárias à transferência do referido bem, a qual deverá ocorrer no prazo máximo de 30 (trinta) dias contados da assinatura deste instrumento, sob pena de multa diária de R$ 500,00 (quinhentos reais). Além disso, deverá(ão) arcar com a baixa de gravames, multas e quaisquer encargos incidentes sobre o bem.`
  },
  {
    id: "paragrafo_quarto_resolutiva",
    label: "PARÁGRAFO QUARTO – RESOLUTIVA EXPRESSA",
    text: `O pagamento da 5ª Parcela, conforme descrito no Quadro Resumo, será representado por NOTA PROMISSÓRIA em caráter “pró-solvendo”, emitida na data de assinatura do presente instrumento, pelo(s) COMPRADOR(ES), em favor do(s) VENDEDOR(ES). A referida nota promissória será resgatada tão logo seja confirmado o pagamento na conta corrente do(s) VENDEDOR(ES).
As PARTES ajustam, para esta venda, a CLÁUSULA RESOLUTIVA EXPRESSA, nos termos do artigo 474 do Código Civil Brasileiro em vigor, tendo como obrigação o pagamento integral do preço ajustado, momento em que será dada a plena, rasa, geral e irrevogável quitação. A venda poderá ser rescindida de pleno direito, automaticamente, sem necessidade de interpelação judicial, em caso de inadimplemento, com base no princípio da obrigatoriedade dos contratos.`
  },
  {
    id: "paragrafo_quinto_ad_corpus",
    label: "PARÁGRAFO QUINTO – AD CORPUS",
    text: `A presente compra e venda é feita em caráter ad corpus, tendo o(s) COMPRADOR(ES) examinado o imóvel in loco. Dessa forma, nenhuma das partes poderá pleitear diferenças em razão de metragens ou do estado de conservação dos móveis.`
  },
  {
    id: "paragrafo_sexto_preservacao",
    label: "PARÁGRAFO SEXTO – PRESERVAÇÃO AMBIENTAL",
    text: `O(s) COMPRADOR(ES) declara(m)-se ciente(s) de que conhecem o aproveitamento legal da área, limitado a X%, conforme legislação municipal, comprometendo-se a manter a área restante como preservação ambiental. Declaram, ainda, ter recebido neste ato cópia da planta do loteamento, contendo as metragens e confrontações do terreno ora negociado, aceitando recebê-lo no estado em que se encontra, ciente(s) de que deverá(ão) solicitar as licenças ambientais e municipais necessárias antes de qualquer movimentação no terreno.`
  },
  {
    id: "paragrafo_setimo_ganho_capital",
    label: "PARÁGRAFO SÉTIMO – GANHO DE CAPITAL",
    text: `Se o valor do financiamento for superior ao valor do contrato, as partes concordam que, caso haja custos relacionados ao ganho de capital por ausência de requisitos de isenção, estes serão suportados pelo(s) COMPRADOR(ES), que são os responsáveis pela transferência do imóvel.`
  },
  {
    id: "paragrafo_oitavo_debitos",
    label: "PARÁGRAFO OITAVO – DÉBITOS EM ABERTO",
    text: `O(s) COMPRADOR(ES) declara(m) ter plena ciência da existência dos seguintes débitos não judicializados vinculados ao imóvel objeto deste contrato até a presente data, cujos valores poderão sofrer variações até seus respectivos vencimentos, em razão da incidência de encargos legais e/ou administrativos:
• Prefeitura Municipal: R$ 3.734,61 (três mil, setecentos e trinta e quatro reais e sessenta e um centavos).
• Condomínio: R$ 17.516,35 (dezessete mil, quinhentos e dezesseis reais e trinta e cinco centavos).

Em razão do exposto, o(s) VENDEDOR(ES) reconhece(m) a existência de débito pendente no valor de R$ 21.250,96 (vinte e um mil, duzentos e cinquenta mil reais e noventa e seis centavos), obrigando-se a promover sua quitação integral até 01 (um) dia útil anterior à data de imissão na posse, conforme estabelecido no Quadro Resumo deste instrumento, sob pena de inadimplemento contratual.`
  },
  {
    id: "paragrafo_nono_taxa_contratual",
    label: "PARÁGRAFO NONO – TAXA CONTRATUAL",
    text: `Fica acordado entre as partes que, no ato da assinatura deste contrato, será cobrada uma taxa contratual no valor de R$ 150,00 (cento e cinquenta reais), destinada à cobertura de custos administrativos. Este valor possui natureza autônoma e acessória, não sendo considerado parte integrante do preço de aquisição do imóvel objeto deste contrato. Ademais, a taxa não será restituída ao(s) COMPRADOR(ES) sob nenhuma hipótese.`
  },
  {
    id: "paragrafo_decimo_posse_despesas",
    label: "PARÁGRAFO DÉCIMO – POSSE/DESPESAS",
    text: `Todas as despesas incidentes sobre o imóvel objeto deste contrato, incluindo, mas não se limitando, a taxas condominiais, tarifas de água e energia elétrica, bem como tributos e impostos de qualquer natureza, serão de exclusiva responsabilidade do(s) VENDEDOR(ES) até a data da imissão na posse pelo(a)(s) COMPRADOR(ES), conforme estabelecido no Quadro Resumo deste instrumento. A partir da referida data, tais encargos passam a ser integralmente de responsabilidade do(a)(s) COMPRADOR(ES), independentemente da formalização de escritura pública ou registro do título aquisitivo.`
  },
  {
    id: "paragrafo_decimo_primeiro_matricula",
    label: "PARÁGRAFO DÉCIMO PRIMEIRO – MATRÍCULA DESATUALIZADA",
    text: `As partes, de forma expressa e ciente, reconhecem que a matrícula XXXXXXX do imóvel objeto do presente contrato encontra-se desatualizada, isentando, assim, a intermediadora de qualquer responsabilidade por eventuais ônus que possam surgir em decorrência dessa condição. Ademais, fica estipulado que é de exclusiva responsabilidade do(s) VENDEDOR(ES) a atualização da matrícula do imóvel, devendo esta ser realizada no prazo máximo de 60 (sessenta) dias contados a partir da data de assinatura do presente instrumento, para que a venda ora negociada seja devidamente averbada.`
  },
  {
    id: "paragrafo_decimo_segundo_aceitacao",
    label: "PARÁGRAFO DÉCIMO SEGUNDO – SALDO DEVEDOR FINANCIAMENTO",
    text: `O valor do financiamento habitacional será destinado ao pagamento do saldo devedor, por meio de interveniente quitante, ressaltando que o extrato de financiamento do(s) VENDEDOR(ES) deve ter o saldo devedor equivalente.`
  }
]

export function DocumentUpload({ title, onProcess }: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [selectedParagraphs, setSelectedParagraphs] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) => /\.(docx|pdf|jpe?g|png)$/i.test(file.name))

    setFiles((prev) => [...prev, ...droppedFiles])
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter((file) => /\.(docx|pdf|jpe?g|png)$/i.test(file.name))
      setFiles((prev) => [...prev, ...selectedFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleParagraph = (paragraph: string) => {
    setSelectedParagraphs((prev) =>
      prev.includes(paragraph) ? prev.filter((p) => p !== paragraph) : [...prev, paragraph],
    )
  }

  const handleProcess = () => {
    if (files.length > 0 && selectedParagraphs.length > 0) {
      onProcess(files, selectedParagraphs)
    }
  }

  const getFileIcon = (fileName: string) => {
    if (/\.(jpe?g|png)$/i.test(fileName)) return ImageIcon
    if (/\.pdf$/i.test(fileName)) return FileText
    return File
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>Faça upload dos documentos necessários para processamento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
              isDragging ? "border-accent bg-accent/5" : "border-border hover:border-accent/50",
            )}
          >
            <input
              type="file"
              multiple
              accept=".docx,.pdf,.jpg,.jpeg,.png"
              onChange={handleFileInput}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-2 text-center text-sm font-medium">Arraste arquivos aqui ou clique para selecionar</p>
            <p className="text-center text-xs text-muted-foreground">Formatos aceitos: DOCX, PDF, JPEG, PNG</p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Arquivos Selecionados ({files.length})</Label>
              <div className="space-y-2">
                {files.map((file, index) => {
                  const Icon = getFileIcon(file.name)
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-accent/5"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-accent" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paragraph Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Selecione os Parágrafos</CardTitle>
          <CardDescription>Escolha as cláusulas que devem constar no contrato</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {paragraphOptions.map((paragraph) => (
              <div key={paragraph.id} className="flex space-x-3 border rounded-md p-3 cursor-pointer" onClick={() => toggleParagraph(paragraph.id)}>
                <Checkbox
                  className="mt-1"
                  id={paragraph.id}
                  checked={selectedParagraphs.includes(paragraph.id)}
                  onCheckedChange={() => toggleParagraph(paragraph.id)}
                />
                <div>
                  <Label htmlFor={paragraph.id} className="text-sm font-normal leading-relaxed">
                    {paragraph.label}
                  </Label>
                  <p className="text-[14px] text-muted-foreground line-clamp-2">{paragraph.text}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Process Button */}
      <Button
        onClick={handleProcess}
        disabled={files.length === 0}
        className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-base"
      >
        Processar Arquivos
      </Button>
    </div>
  )
}
