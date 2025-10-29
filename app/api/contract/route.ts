import { NextResponse } from "next/server"


export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const backendUrl = "http://localhost:5000/generate"

    
    const referer = req.headers.get("referer") || ""
    let tipoContrato = "compra-venda" // padrão
    

    if (referer.includes("financiamento-goiania")) {
      tipoContrato = "financiamento-go"
    } else if (referer.includes("financiamento-ms")) {
      tipoContrato = "financiamento-ms"
    } else if (referer.includes("compra-venda")) {
      tipoContrato = "compra-venda"
    }

    // 🔹 Adiciona o tipo ao FormData antes de enviar ao Flask
    formData.append("tipo_contrato", tipoContrato)
    
    const response = await fetch(backendUrl, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Erro no backend:", errorText)
      return NextResponse.json({ error: "Erro ao gerar contrato" }, { status: 500 })
    }

    const blob = await response.blob()
    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="contrato_${tipoContrato}.docx"`,
      },
    })
  } catch (error) {
    console.error("Erro na rota /api/generate:", error)
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 })
  }
}
