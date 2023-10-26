import NextAuth, { type NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { Adapter } from "next-auth/adapters";
import { createTransport } from "nodemailer";
import { html, text } from "@/features/api/auth/loginEmail";

// https://next-auth.js.org/configuration/callbacks
// https://authjs.dev/reference/adapter/prisma

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  // debug: true,
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      // maxAge: 24 * 60 * 60, // How long email links are valid for (default 24h)
      async sendVerificationRequest({ identifier, url, provider, theme }) {
        // Eメールの文面をデフォルトから変更する関数
        const serviceName = process.env.NEXT_PUBLIC_SERVICE_NAME as string;
        const transport = createTransport(provider.server);
        try {
          const result = await transport.sendMail({
            to: identifier,
            from: provider.from,
            subject: `${serviceName}へのログイン用リンク`,
            text: text({ url, serviceName }),
            html: html({ url, serviceName, theme }),
          });
          // メールが届かなかった場合、failedにメールアドレスが返される
          const failed = result.rejected.concat(result.pending).filter(Boolean);
          if (failed.length) {
            throw new Error(
              `Email(s) (${failed.join(", ")}) could not be sent`
            );
          }
        } catch (error) {
          console.error("## Email sending error", error);
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.NEXTAUTH_OAUTH_GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.NEXTAUTH_OAUTH_GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    // ページのカスタマイズ
    signIn: "/auth/login",
    signOut: "/auth/signout",
    verifyRequest: "/auth/verify",
    error: "/auth/error",
    newUser: "/my_user/edit", // redirect page after first login
  },
  session: {
    strategy: "database", // セッションの保存場所
    maxAge: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 12, // 12 hours
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  callbacks: {
    // async signIn({ user, account, profile, email, credentials }) {
    //   return true;
    // },
    async redirect({ baseUrl, url }) {
      // loginかsignoutの後のリダイレクト先

      // logoutした後
      if (url === "/auth/login") return "/auth/login";

      // loginした後
      return `${baseUrl}/events`;
    },
    async session({ session, user }) {
      // console.log("session", session);
      // console.log("user", user);
      // userはdbの情報
      session.user.id = user.id;
      if (user.role) session.user.role = user.role;
      return session;
    },
  },
};

export default NextAuth(authOptions);
