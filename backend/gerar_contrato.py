from docx import Document
from docx.shared import Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls
import json
import re
from langchain_community.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
import os
from pathlib import Path


os.environ["OPENAI_API_KEY"] = "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"



# -------- 1️⃣ Extrai dados do pré-contrato --------
def extract_contract_data(path):
    doc = Document(path)
    data = {"text": "", "tables": []}

    for p in doc.paragraphs:
        data["text"] += p.text + "\n"

    for table in doc.tables:
        table_data = []
        for row in table.rows:
            row_data = [cell.text.strip() for cell in row.cells]
            table_data.append(row_data)
        data["tables"].append(table_data)

    return data


# -------- 2️⃣ Limpa marcações Markdown --------
def clean_markdown(text: str) -> str:
    text = re.sub(r"(\*{1,2}|#{1,6})", "", text)
    return text.strip()


# -------- 3️⃣ Detecta títulos --------
def is_section_title(line: str) -> bool:
    line = line.strip()
    if not line:
        return False

    # Casos clássicos de Markdown
    if line.startswith("###") or line.startswith("##") or line.startswith("#"):
        return True
    if line.startswith("**") and line.endswith("**"):
        return True

    # Títulos totalmente em maiúsculas
    if line.isupper() and len(line) < 150:
        return True

    # 🧩 NOVO: títulos tipo frase (ex: Quadro de Honorários da Intermediação)
    if (
        re.match(
            r"^(?=.{3,150}$)([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+)(?:\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇa-záéíóúâêôãõç]+)*$",
            line,
        )
        and not line.endswith(".")
    ):
        return True

    return False


# -------- 4️⃣ Cria tabela genérica padrão --------
def create_section_table(doc, title, content):
    title = clean_markdown(title)
    content = clean_markdown(content)

    table = doc.add_table(rows=2, cols=1)

    for row in table.rows:
        for cell in row.cells:
            cell._tc.get_or_add_tcPr().append(
                parse_xml(
                    r'<w:tcBorders %s>'
                    r'<w:top w:val="single" w:sz="4" w:color="D9D9D9"/>'
                    r'<w:left w:val="single" w:sz="4" w:color="D9D9D9"/>'
                    r'<w:bottom w:val="single" w:sz="4" w:color="D9D9D9"/>'
                    r'<w:right w:val="single" w:sz="4" w:color="D9D9D9"/>'
                    r'</w:tcBorders>' % nsdecls("w")
                )
            )

    # Título
    title_cell = table.cell(0, 0)
    p_title = title_cell.paragraphs[0]
    run_title = p_title.add_run(title)
    run_title.bold = True
    run_title.font.size = Pt(12)
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # Conteúdo
    content_cell = table.cell(1, 0)
    p_content = content_cell.paragraphs[0]
    run_content = p_content.add_run(content)
    run_content.font.size = Pt(12)
    p_content.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    doc.add_paragraph()


# -------- 5️⃣ Cria tabela de pagamento --------
def create_pagamento_table(doc, title, content):
    """
    Cria tabela com 3 colunas (Valor da Parcela | Forma de Pagamento | Data de Pagamento),
    mantendo o texto integral do pré-contrato para cada parcela.
    Agora a 'Data de Pagamento' captura qualquer formato textual ou numérico.
    """
    title = clean_markdown(title)
    content = clean_markdown(content)

    # 🔹 Extrai o valor total do imóvel
    valor_total_match = re.search(r"R\$ ?[\d\.,]+\s*\(.*?reais\)", content, re.IGNORECASE)
    valor_total_texto = valor_total_match.group(0) if valor_total_match else None

    # 🔹 Detecta blocos de parcelas
    parcelas = re.findall(
        r"(\d+[ªº]?\s*parcela.*?)(?=(\d+[ªº]?\s*parcela|$))",
        content,
        flags=re.IGNORECASE | re.DOTALL,
    )

    # ---------- Cabeçalho ----------
    p_title = doc.add_paragraph()
    run_title = p_title.add_run(title.upper())
    run_title.bold = True
    run_title.font.size = Pt(12)
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER

    if valor_total_texto:
        p_total = doc.add_paragraph()
        run_total = p_total.add_run(f"Valor total do imóvel: {valor_total_texto}")
        run_total.bold = True
        run_total.font.size = Pt(12)
        p_total.alignment = WD_ALIGN_PARAGRAPH.LEFT

    doc.add_paragraph()  # espaçamento

    # ---------- Criação da tabela ----------
    table = doc.add_table(rows=1, cols=3)
    headers = ["Valor da Parcela", "Forma de Pagamento", "Data de Pagamento"]
    hdr_cells = table.rows[0].cells
    for i, h in enumerate(headers):
        hdr_cells[i].text = h
        hdr_cells[i].paragraphs[0].runs[0].bold = True
        hdr_cells[i].paragraphs[0].runs[0].font.size = Pt(12)
        hdr_cells[i].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER

    # ---------- Borda cinza ----------
    for row in table.rows:
        for cell in row.cells:
            cell._tc.get_or_add_tcPr().append(
                parse_xml(
                    r'<w:tcBorders %s>'
                    r'<w:top w:val="single" w:sz="4" w:color="D9D9D9"/>'
                    r'<w:left w:val="single" w:sz="4" w:color="D9D9D9"/>'
                    r'<w:bottom w:val="single" w:sz="4" w:color="D9D9D9"/>'
                    r'<w:right w:val="single" w:sz="4" w:color="D9D9D9"/>'
                    r'</w:tcBorders>' % nsdecls("w")
                )
            )

    # ---------- Preenche cada linha ----------
    if parcelas:
        for idx, par in enumerate(parcelas, start=1):
            trecho = clean_markdown(par[0].strip())

            valor = re.search(r"R\$ ?[\d\.,]+.*?(reais)?", trecho, re.IGNORECASE)
            forma = re.search(
                r"(?i)(forma.?de.?pagamento[:\-\–]?\s*)(.+?)(?:\.|$|\n|\r)",
                trecho,
                re.DOTALL,
            )
            data = re.search(
                r"(?i)(data.?do.?pagamento|data.?de.?pagamento)[:\-\–]?\s*(.+?)(?:\.|$|\n|\r)",
                trecho,
                re.DOTALL,
            )

            row = table.add_row()
            cells = row.cells

            # Coluna 1: Valor
            val_text = valor.group(0).strip() if valor else "-"
            p_val = cells[0].paragraphs[0]
            run_val = p_val.add_run(val_text)
            run_val.font.size = Pt(12)
            p_val.alignment = WD_ALIGN_PARAGRAPH.CENTER

            # Coluna 2: Forma de pagamento
            forma_text = forma.group(2).strip() if forma else "-"
            p_forma = cells[1].paragraphs[0]
            run_forma = p_forma.add_run(forma_text)
            run_forma.font.size = Pt(12)
            p_forma.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

            # Coluna 3: Data de pagamento
            data_text = data.group(2).strip() if data else "-"
            p_data = cells[2].paragraphs[0]
            run_data = p_data.add_run(data_text)
            run_data.font.size = Pt(12)
            p_data.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

            for c in cells:
                c._tc.get_or_add_tcPr().append(
                    parse_xml(
                        r'<w:tcBorders %s>'
                        r'<w:top w:val="single" w:sz="4" w:color="D9D9D9"/>'
                        r'<w:left w:val="single" w:sz="4" w:color="D9D9D9"/>'
                        r'<w:bottom w:val="single" w:sz="4" w:color="D9D9D9"/>'
                        r'<w:right w:val="single" w:sz="4" w:color="D9D9D9"/>'
                        r'</w:tcBorders>' % nsdecls("w")
                    )
                )
    else:
        # fallback
        row = table.add_row()
        row.cells[0].merge(row.cells[2])
        p = row.cells[0].paragraphs[0]
        run = p.add_run(content)
        run.font.size = Pt(12)
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    doc.add_paragraph()  # primeira linha em branco
    doc.add_paragraph()  # segunda linha em branco
    
            # --- AQUI: título fora de tabela logo abaixo da tabela de parcelas ---
    title_hon = doc.add_paragraph()
    run_hon = title_hon.add_run("QUADRO DE HONORÁRIOS")
    run_hon.bold = True       # negrito, sem ** no texto
    run_hon.font.size = Pt(12)
    title_hon.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_paragraph()  # espaço após o título

    # ---------- Impede quebra de página ----------
    for row in table.rows:
        tr = row._tr
        trPr = tr.get_or_add_trPr()
        trPr.append(parse_xml("<w:cantSplit xmlns:w='http://schemas.openxmlformats.org/wordprocessingml/2006/main'/>"))



    doc.add_paragraph()  # espaçamento final


# -------- 6️⃣ Gera conteúdo formatado --------
def gerar_conteudo(pre_contrato_path, tipo_contrato, saida_path):
    print(f"🔹 Gerando contrato do tipo: {tipo_contrato}")

    BASE_DIR = Path(__file__).resolve().parent

    if tipo_contrato == "compra-venda":
        modelo_layout_path = BASE_DIR / "compra-venda.docx"
    elif tipo_contrato == "financiamento-go":
        modelo_layout_path = BASE_DIR / "financiamento-go.docx"
    elif tipo_contrato == "financiamento-ms":
        modelo_layout_path = BASE_DIR / "financiamento-ms.docx"
    else:
        raise ValueError(f"❌ Tipo de contrato desconhecido: {tipo_contrato}")

    if not modelo_layout_path.exists():
        raise FileNotFoundError(f"Modelo não encontrado: {modelo_layout_path}")
    
    dados_extraidos = extract_contract_data(pre_contrato_path)
    dados_json = json.dumps(dados_extraidos, ensure_ascii=False)

    llm = ChatOpenAI(model="gpt-4o", temperature=0)

    prompt = ChatPromptTemplate.from_template("""
Você é um assistente jurídico especializado em contratos imobiliários.

Com base nas informações extraídas abaixo (texto e tabelas),
gere o conteúdo completo do contrato **preservando todos os dados originais**
e adaptando-os ao estilo e estrutura textual do layout indicado.

Regras:
- Mantenha títulos e estrutura.
- Use marcação Markdown para formatação (**negrito**, ### títulos).
- Não altere cabeçalhos nem rodapés.
- Inclua o conteúdo original do pré-contrato organizado por seções.

LAYOUT DE DESTINO:
{layout}

INFORMAÇÕES EXTRAÍDAS:
{dados}
""")

    layout_text = "\n".join([p.text for p in Document(modelo_layout_path).paragraphs])
    mensagem = prompt.format_messages(layout=layout_text, dados=dados_json)
    resposta = llm.invoke(mensagem)
    conteudo_final = resposta.content.strip()

    modelo = Document(modelo_layout_path)

    # Localiza onde inserir
    insert_index = 0
    for i, p in enumerate(modelo.paragraphs):
        if "Quadro Resumo" in p.text:
            insert_index = i + 1
            break

    # Remove conteúdo antigo
    while len(modelo.paragraphs) > insert_index:
        p = modelo.paragraphs[-1]
        p._element.getparent().remove(p._element)

    # -------- 7️⃣ Separa seções --------
    linhas = conteudo_final.split("\n")
    secoes = []
    titulo_atual = None
    conteudo_atual = []

    for linha in linhas:
        if not linha.strip():
            continue

        if "CLÁUSULA PRIMEIRA – DAS CONDIÇÕES ESPECÍFICAS DO NEGÓCIO" in linha:
            if titulo_atual and conteudo_atual:
                secoes.append((titulo_atual, "\n".join(conteudo_atual)))
            break

        if is_section_title(linha):
            if titulo_atual and conteudo_atual:
                secoes.append((titulo_atual, "\n".join(conteudo_atual)))
            titulo_atual = linha
            conteudo_atual = []
        else:
            conteudo_atual.append(linha)

    # -------- 8️⃣ Gera tabelas --------
    for titulo, conteudo in secoes:
        titulo_limpo = clean_markdown(titulo).upper()
        if "VALOR" in titulo_limpo and "PAGAMENTO" in titulo_limpo:
            create_pagamento_table(modelo, titulo, conteudo)
        elif "HONORÁRIO" in titulo_limpo or "HONORARIOS" in titulo_limpo:
            create_section_table(modelo, titulo, conteudo)
        else:
            create_section_table(modelo, titulo, conteudo)

    # -------- 9️⃣ Adiciona cláusulas --------
    restante = False
    for linha in linhas:
        if "CLÁUSULA PRIMEIRA – DAS CONDIÇÕES ESPECÍFICAS DO NEGÓCIO" in linha:
            restante = True
        if restante:
            texto_limpo = clean_markdown(linha)
            p = modelo.add_paragraph(texto_limpo)
            for run in p.runs:
                run.font.size = Pt(12)
            if "CLÁUSULA" in texto_limpo.upper():
                p.runs[0].bold = True

    modelo.save(saida_path)
    print(f"✅ Contrato final salvo com layout preservado, fonte 12 e quadro de pagamento detalhado em: {saida_path}")


