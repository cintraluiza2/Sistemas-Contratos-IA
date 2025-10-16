// app/api/register/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
	const headersList = headers();
	const apiKey = (await headersList).get("x-api-key");

	// Verificar se a chave secreta foi enviada e se ela corresponde à do .env
	if (apiKey !== process.env.REGISTRATION_SECRET_KEY) {
		return new NextResponse("Não autorizado", { status: 401 });
	}

	try {
		const body = await request.json();
		const { email, password, name } = body;

		if (!email || !password) {
			return new NextResponse("Email e senha são obrigatórios", {
				status: 400,
			});
		}

		const existingUser = await prisma.user.findUnique({ where: { email } });
		if (existingUser) {
			return new NextResponse("Email já está em uso", { status: 409 });
		}

		const hashedPassword = await bcrypt.hash(password, 12);

		const user = await prisma.user.create({
			data: {
				email,
				password: hashedPassword,
				name,
			},
		});

		return NextResponse.json(user);
	} catch (error) {
		console.error("REGISTRATION_ERROR", error);
		return new NextResponse("Erro Interno do Servidor", { status: 500 });
	}
}
