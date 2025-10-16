// app/api/documents/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// BUSCAR OS DOCUMENTOS DO USUÁRIO LOGADO
export async function GET() {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		return new NextResponse("Não autorizado", { status: 401 });
	}

	try {
		const documents = await prisma.document.findMany({
			where: {
				userId: session.user.id,
			},
			orderBy: {
				createdAt: "desc",
			},
		});
		return NextResponse.json(documents);
	} catch (error) {
		console.error("GET_DOCUMENTS_ERROR", error);
		return new NextResponse("Erro Interno do Servidor", { status: 500 });
	}
}

// CRIAR UM NOVO DOCUMENTO
export async function POST(request: Request) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		return new NextResponse("Não autorizado", { status: 401 });
	}

	try {
		const body = await request.json();
		const { title, content } = body;

		if (!title || !content) {
			return new NextResponse("Título e conteúdo são obrigatórios", {
				status: 400,
			});
		}

		const document = await prisma.document.create({
			data: {
				title,
				content,
				userId: session.user.id,
			},
		});

		return NextResponse.json(document, { status: 201 });
	} catch (error) {
		console.error("CREATE_DOCUMENT_ERROR", error);
		return new NextResponse("Erro Interno do Servidor", { status: 500 });
	}
}
