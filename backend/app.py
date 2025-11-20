from ocr_service.ocr_core import clean_markdown 
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from gerar_contrato import gerar_conteudo
from ocr_service.ocr_core import (
    build_documents_from_request,
    crew_analise_resumo,
    tarefa_analise_tecnica,
    tarefa_resumo_bulletpoints,
    require_api_key_or_500,
    handle_analisar
)
import tempfile, traceback, json, re
from pathlib import Path
from docxtpl import DocxTemplate


# ---------- Configuração ----------
app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).resolve().parent

def clean_output(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r"(\*\*|__)(.*?)\1", r"\2", text, flags=re.DOTALL)
    text = re.sub(r"(?m)^\s{0,3}#{1,6}\s*", "", text)
    text = re.sub(r"(?m)^\s*-{3,}\s*$", "", text)
    text = re.sub(r"\s-{2,}\s", " ", text)
    text = re.sub(r"[•●▪▶►]", "-", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = text.replace("“", '"').replace("”", '"').replace("’", "'")
    return text.strip()

# ---------- GERA CONTRATO ----------
@app.route("/generate", methods=["POST"])
def generate_contract():
    try:
        uploaded_file = request.files.get("pre_contrato")
        tipo_contrato = request.form.get("tipo_contrato", "compra-venda").strip()

        # 🔹 lê os parágrafos enviados pelo front
        paragrafos_raw = request.form.get("selectedParagraphs", "[]")
        print(f"🧾 Raw recebido: {paragrafos_raw}")
        extra_text = request.form.get("extraText", "")
        text_area_precontrato = request.form.get("textAreaContent", "")

        try:
            paragrafos = json.loads(paragrafos_raw)
            print(f"📋 Parágrafos parseados: {paragrafos}")
        except Exception as e:
            print(f"❌ Erro ao parsear JSON: {e}")
            paragrafos = []

        if not uploaded_file and not extra_text.strip():
            return jsonify({"error": "Envie um arquivo ou escreva algo no campo de texto."}), 400

        if uploaded_file:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp_pre:
                uploaded_file.save(tmp_pre.name)
                pre_path = tmp_pre.name
            print("📄 DOCX recebido:", uploaded_file.filename)
        else:
            pre_path = None   
            print("Nenhum DOCX enviado. Gerando contrato APENAS com texto digitado.")


        # 🔹 Gera saída temporária
        output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".docx").name

       # print(f" Arquivo recebido: {uploaded_file.filename}")
        print(f" Tipo de contrato: {tipo_contrato}")
        print(" Requisição iniciada em /generate")


        # 🔹 Chama a função geradora passando os parágrafos do front
        gerar_conteudo(pre_path, 
                       tipo_contrato, 
                       output_path, 
                       paragrafos_extra=paragrafos,
                       extra_text=extra_text,
                       text_area_precontrato=text_area_precontrato)

        print(f"✅ Contrato gerado em: {output_path}")
        return send_file(output_path, as_attachment=True, download_name=f"contrato_{tipo_contrato}.docx")

    except Exception as e:
        print("❌ ERRO AO GERAR CONTRATO:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ---------- GERA PARECER ----------
@app.route("/parecer", methods=["POST"])
def gerar_parecer_juridico():
    try:
        maybe_err = require_api_key_or_500()
        if maybe_err:
            return maybe_err

        if not request.files:
            return jsonify({"error": "Nenhum arquivo recebido"}), 400

        files = request.files.getlist("file") or request.files.getlist("files")
        nomes, textos = build_documents_from_request(files, langs="por+eng")
        if not textos:
            return jsonify({"error": "Falha ao extrair texto dos documentos"}), 422

        entrada = "\n\n".join(textos)
        inputs_da_crew = {"regulamento_texto": entrada}
        crew_analise_resumo.kickoff(inputs=inputs_da_crew)

        # 🔹 LIMPE os textos ANTES de renderizar o DOCX
        parecer_detalhado_raw = tarefa_analise_tecnica.output.raw if tarefa_analise_tecnica.output else ""
        resumo_exec_raw = tarefa_resumo_bulletpoints.output.raw if tarefa_resumo_bulletpoints.output else ""

        parecer_detalhado = clean_output(parecer_detalhado_raw)
        resumo_exec = clean_output(resumo_exec_raw)

        modelo_parecer_path = BASE_DIR / "parecer.docx"
        if not modelo_parecer_path.exists():
            return jsonify({"error": "Modelo parecer.docx não encontrado"}), 500

        output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".docx").name

        tpl = DocxTemplate(modelo_parecer_path)
        tpl.render({
            "intermediadora": "My Broker",
            "analise_tecnica": parecer_detalhado,
            "resumo_exec": resumo_exec
        })
        tpl.save(output_path)

        return send_file(output_path, as_attachment=True, download_name="parecer_final.docx")

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

def gerar_parecer_juridico():
    return handle_analisar()


# ---------- Servidor ----------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False)
