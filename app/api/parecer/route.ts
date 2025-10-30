import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/parecer`

    const response = await fetch(backendUrl, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Erro no backend:", errorText)
      return NextResponse.json({ error: "Erro ao gerar parecer" }, { status: 500 })
    }

    const blob = await response.blob()
    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="parecer_juridico.docx"`,
      },
    })
  } catch (error) {
    console.error("Erro na rota /api/parecer:", error)
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 })
  }
}

