import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const demoEmail = process.env.DEMO_USER_EMAIL;
        const demoPassword = process.env.DEMO_USER_PASSWORD;

        if (
          demoEmail &&
          demoPassword &&
          credentials.email === demoEmail &&
          credentials.password === demoPassword
        ) {
          return {
            id: credentials.email,
            email: credentials.email,
            name: credentials.name || "Demo User",
          };
        }

        return null;
      },
    }),
  ],
};
