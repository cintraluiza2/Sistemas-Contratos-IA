// types/next-auth.d.ts

import { DefaultSession, User } from "next-auth";
import { JWT } from "next-auth/jwt";

// Declara um novo módulo para "next-auth"
declare module "next-auth" {
	/**
	 * O tipo da sua sessão, retornado por useSession(), getSession(), etc.
	 */
	interface Session {
		user: {
			/** Adicione aqui a propriedade 'id' */
			id: string;
		} & DefaultSession["user"]; // Mantém as propriedades padrão (name, email, image)
	}
}

// Declara um novo módulo para "next-auth/jwt"
declare module "next-auth/jwt" {
	/** O tipo do seu token JWT */
	interface JWT {
		/** Adicione aqui a propriedade 'id' */
		id: string;
	}
}
