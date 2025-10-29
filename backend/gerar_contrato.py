from docx import Document
from docx.shared import Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls
from docx.enum.style import WD_STYLE_TYPE
import json
import re
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
import os
from pathlib import Path


os.environ["OPENAI_API_KEY"] = "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"



# -------- 1) Extrai dados do pré-contrato --------
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


# -------- 2) Limpa marcações --------
def limpa_marcacoes(texto: str) -> str:
    return texto.replace("**", "").replace("--", "—")


# -------- 3) Separa assinaturas --------
def separar_assinaturas(texto: str):
    padrao = re.compile(r'<<<ASSINATURAS_INICIO>>>(.*?)<<<ASSINATURAS_FIM>>>', re.DOTALL | re.IGNORECASE)
    m = padrao.search(texto)
    if not m:
        return texto.strip(), ""
    assin = m.group(1).strip()
    corpo = (texto[:m.start()] + texto[m.end():]).strip()
    return corpo, assin


# -------- 4) Adiciona parágrafos simples --------
def add_paragrafos(doc: Document, texto: str):
    for line in texto.split("\n"):
        line = line.rstrip()
        if line == "":
            doc.add_paragraph("")
        else:
            p = doc.add_paragraph(line, style="Normal")
            for run in p.runs:
                run.font.size = Pt(12)
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY


# -------- 5) Adiciona tabelas com bordas cinza e fonte 12 --------
def add_tabelas_geradas(doc: Document, texto: str):
    # garante estilo de tabela existente
    if "Table Grid" not in [s.name for s in doc.styles]:
        doc.styles.add_style("Table Grid", WD_STYLE_TYPE.TABLE)

    padrao_tabela = re.compile(r"<<<TABELA_INICIO>>>(.*?)<<<TABELA_FIM>>>", re.DOTALL | re.IGNORECASE)
    partes = padrao_tabela.split(texto)
    segmentos = []

    for i, parte in enumerate(partes):
        if i % 2 == 0:
            segmentos.append(("texto", parte.strip()))
        else:
            segmentos.append(("tabela", parte.strip()))

    for tipo, conteudo in segmentos:
        if tipo == "texto":
            add_paragrafos(doc, conteudo)
            continue

        conteudo = conteudo.strip()
        if not conteudo:
            continue

        # --- Detecta se o bloco contém parcelas ---
        contem_parcelas = bool(re.search(r"\d+[ªº]?\s*parcela", conteudo, flags=re.IGNORECASE))

        if contem_parcelas:
            # Agrupa cada parcela inteira
            blocos_parcelas = re.findall(
                r"((?:\d+[ªº]?\s*parcela).*?)(?=(?:\d+[ªº]?\s*parcela|$))",
                conteudo,
                flags=re.IGNORECASE | re.DOTALL,
            )

            # Captura o cabeçalho antes das parcelas
            cabecalho_match = re.split(r"\d+[ªº]?\s*parcela", conteudo, maxsplit=1, flags=re.IGNORECASE)
            cabecalho = cabecalho_match[0].strip() if len(cabecalho_match) > 1 else ""

            # Constrói as linhas da tabela
            linhas = []
            if cabecalho:
                linhas.append(cabecalho)
            for bloco in blocos_parcelas:
                # Preserva quebras de linha internas dentro de cada parcela
                linhas_bloco = [l.strip() for l in bloco.splitlines() if l.strip()]
                for l in linhas_bloco:
                    linhas.append(l)
                # Adiciona uma linha em branco entre parcelas
                linhas.append("")

            # Cria tabela com todas as linhas unificadas
            tabela = doc.add_table(rows=len(linhas), cols=1)
            tabela.style = "Table Grid"

            for i, linha in enumerate(linhas):
                p = tabela.cell(i, 0).paragraphs[0]
                run = p.add_run(linha)
                run.font.size = Pt(12)
                if i == 0:
                    run.bold = True  # título em negrito
                p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

                # bordas cinza suaves
                tabela.cell(i, 0)._tc.get_or_add_tcPr().append(
                    parse_xml(
                        r'<w:tcBorders %s>'
                        r'<w:top w:val="single" w:sz="4" w:color="D9D9D9"/>'
                        r'<w:left w:val="single" w:sz="4" w:color="D9D9D9"/>'
                        r'<w:bottom w:val="single" w:sz="4" w:color="D9D9D9"/>'
                        r'<w:right w:val="single" w:sz="4" w:color="D9D9D9"/>'
                        r'</w:tcBorders>' % nsdecls("w")
                    )
                )

            doc.add_paragraph("")  # espaço após a tabela
            continue

        # --- Bloco de tabela comum (sem parcelas) ---
        linhas = [r.strip() for r in conteudo.split("\n") if r.strip()]
        usa_pipes = any("|" in linha for linha in linhas)
        colunas = max(len(linha.split("|")) for linha in linhas) if usa_pipes else 1

        tabela = doc.add_table(rows=len(linhas), cols=colunas)
        tabela.style = "Table Grid"

        for i, linha in enumerate(linhas):
            valores = [c.strip() for c in linha.split("|")] if usa_pipes else [linha]
            for j, valor in enumerate(valores):
                p = tabela.cell(i, j).paragraphs[0]
                run = p.add_run(valor)
                run.font.size = Pt(12)
                if i == 0:
                    run.bold = True  # título em negrito
                p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

                # bordas cinza suaves
                tabela.cell(i, j)._tc.get_or_add_tcPr().append(
                    parse_xml(
                        r'<w:tcBorders %s>'
                        r'<w:top w:val="single" w:sz="4" w:color="D9D9D9"/>'
                        r'<w:left w:val="single" w:sz="4" w:color="D9D9D9"/>'
                        r'<w:bottom w:val="single" w:sz="4" w:color="D9D9D9"/>'
                        r'<w:right w:val="single" w:sz="4" w:color="D9D9D9"/>'
                        r'</w:tcBorders>' % nsdecls("w")
                    )
                )

        doc.add_paragraph("")  # espaço após a tabela

   # doc.save(output_path)
   # print(f"Contrato gerado em: {output_path}")


# -------- 6️⃣ Gera conteúdo formatado --------
def gerar_conteudo(pre_contrato_path, tipo_contrato, saida_path, paragrafos_extra=None):
    print(f"🔹 Gerando contrato do tipo: {tipo_contrato}")
    
    if paragrafos_extra is None:
        paragrafos_extra = []
    else:
        print(f" Parágrafos recebidos: {paragrafos_extra}")

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

    llm = ChatOpenAI(
    model="gpt-4o",
    temperature=0,
    max_retries=2,
    timeout=120
)


    prompt = ChatPromptTemplate.from_template("""
Você é um assistente jurídico especializado em contratos imobiliários.

Tarefa:
- Reescreva o contrato completo (sem resumir nem omitir dados).
- Adapte o texto para o estilo e a estrutura do layout indicado (mesmos títulos e ordem).
- NÃO use **markdown**, **negrito** ou símbolos.
- Quando identificar listas ou quadros de dados (ex: Partes, Posse, Honorários),
  represente-os como tabelas delimitadas por:

  <<<TABELA_INICIO>>>
  Coluna1
  Dado1
  <<<TABELA_FIM>>>

- Ao final, coloque as assinaturas entre:
  <<<ASSINATURAS_INICIO>>>
  (nomes, CPFs, testemunhas, data e local)
  <<<ASSINATURAS_FIM>>>

🔴 REGRAS CRÍTICAS PARA PARCELAS (leia com atenção):

1. ESTRUTURA GERAL:
   Envolva TODO o bloco de parcelas entre os marcadores, SEM linha em branco após o valor total:
   
   <<<TABELA_INICIO>>>
   Valor e forma de Pagamento
   Valor total do negócio: R$ XXX.XXX,XX (valor por extenso)
   1ª parcela
   [informações da 1ª parcela - veja formato abaixo]
   
   2ª parcela
   [informações da 2ª parcela]
   
   (...)
   <<<TABELA_FIM>>>
   
   ⚠️ IMPORTANTE: NÃO deixe linha em branco entre "Valor total do negócio" e "1ª parcela"

2. FORMATO DE CADA PARCELA (CRÍTICO):
   Cada parcela deve seguir EXATAMENTE este formato com 2 linhas:
   
   Xª parcela
   Valor: R$ XX.XXX,XX - Data do Pagamento: [data ou condição]
   Forma de pagamento: [descrever forma COMPLETA incluindo banco, agência, conta, titular, CPF, etc. TUDO em uma linha separado por traços]
   
   Exemplo CORRETO da estrutura COMPLETA:
   <<<TABELA_INICIO>>>
   Valor e forma de Pagamento
   Valor total do negócio: R$ 208.000,00 (Duzentos e oito mil reais)
   1ª parcela
   Valor: R$ 12.000,00 - Data do Pagamento: Ato de assinatura do presente instrumento
   Forma de pagamento: TED/PIX - Banco Itau - Agência 4459 - Conta Corrente 84234-2 - titular Deyla Flavia Bertolazzo - CPF 370.990.108-16
   
   2ª parcela
   Valor: R$ 29.600,00 - Data do Pagamento: Ato da assinatura
   Forma de pagamento: TED/PIX - Banco Itau - Agência 4459 - Conta Corrente 84234-2 - titular Deyla Flavia Bertolazzo - CPF 370.990.108-16
   <<<TABELA_FIM>>>

3. O QUE NÃO FAZER (erros comuns):
   ❌ NÃO deixe linha em branco entre "Valor total do negócio" e "1ª parcela"
   ❌ NÃO quebre os dados bancários em múltiplas linhas
   ❌ NÃO coloque cada informação bancária em linha separada
   ❌ NÃO use quebras de linha dentro da "Forma de pagamento"
   
4. O QUE FAZER:
   ✅ Primeira linha: Título da parcela (ex: "1ª parcela")
   ✅ Segunda linha: Valor e Data juntos (separados por " - ")
   ✅ Terceira linha: "Forma de pagamento: " seguido de TODOS os dados bancários em sequência (separados por " - ")
   ✅ Deixe UMA linha em branco APENAS entre parcelas diferentes (não antes da primeira)

5. TRATAMENTO DE OBSERVAÇÕES/CONDIÇÕES:
   Se houver observações ou condições adicionais da parcela (ex: "FGTS será utilizado", "Financiamento bancário"), 
   adicione como quarta linha "Observação: [texto]"
   
   Exemplo:
   3ª parcela
   Valor: R$ 166.400,00 - Data do Pagamento: Dentro de 120 dias
   Forma de pagamento: Financiamento bancário junto ao banco XYZ
   Observação: Sujeito a aprovação de crédito

LEMBRE-SE: Todo o bloco (desde "Valor e forma de Pagamento" até a última parcela) deve estar entre <<<TABELA_INICIO>>> e <<<TABELA_FIM>>> sem quebras que separem o cabeçalho das parcelas.

LAYOUT DE DESTINO (somente como guia de estrutura textual — não copie logotipos/cabeçalho):
{layout}

INFORMAÇÕES EXTRAÍDAS:
{dados}
""")

    layout_text = "\n".join([p.text for p in Document(modelo_layout_path).paragraphs])
    mensagem = prompt.format_messages(layout=layout_text, dados=dados_json)
    resposta = llm.invoke(mensagem)
    conteudo_final = resposta.content.strip()
    corpo, assinaturas = separar_assinaturas(conteudo_final)
    
    
    padroes_remover = [
        r"INSTRUMENTO\s+PARTICULAR\s+DE\s+COMPROMISSO\s+DE\s+COMPRA\s+E\s+VENDA",
        r"QUADRO\s+RESUMO"
    ]
    for padrao in padroes_remover:
        corpo = re.sub(padrao, "", corpo, flags=re.IGNORECASE)
    corpo = re.sub(r"\n{3,}", "\n\n", corpo).strip()

    print(" Inserindo conteúdo no modelo preservando layout e estilos...")
    modelo = Document(modelo_layout_path)

    # ponto de inserção após "Quadro Resumo"
    insert_index = None
    for i, p in enumerate(modelo.paragraphs):
        if "Quadro Resumo" in (p.text or ""):
            insert_index = i + 1
            break
    if insert_index is None:
        insert_index = len(modelo.paragraphs)

    while len(modelo.paragraphs) > insert_index:
        p = modelo.paragraphs[-1]
        p._element.getparent().remove(p._element)

    # corpo (com tabelas)
    add_tabelas_geradas(modelo, corpo)
    
    # assinaturas (se existirem)
    if assinaturas:
        modelo.add_paragraph("")
        add_paragrafos(modelo, assinaturas)
        
    texto_paragrafos = ""
    if paragrafos_extra:
        for p in paragrafos_extra:
            texto_paragrafos += f"\n\n{p}"
    else:
        print(" Nenhum parágrafo adicional recebido.")
    
    # ---------- Inserir parágrafos adicionais selecionados no front ----------
    if paragrafos_extra:
        modelo.add_page_break()
        modelo.add_paragraph("CLÁUSULAS ADICIONAIS", style="Normal").runs[0].bold = True
        modelo.add_paragraph("")  

        for i, texto_extra in enumerate(paragrafos_extra, start=1):
            modelo.add_paragraph(f"{i}. {texto_extra}", style="Normal")
            modelo.add_paragraph("")  # espaço entre parágrafos
        print(f" {len(paragrafos_extra)} parágrafos adicionais inseridos no contrato.")
    else:
        print(" Nenhum parágrafo adicional recebido para inserção.")

    
    modelo.save(saida_path)
    print(f"✅ Contrato final salvo com layout preservado, fonte 12 e quadro de pagamento detalhado em: {saida_path}")


