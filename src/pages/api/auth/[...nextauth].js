import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email/Nom d'utilisateur", type: "text" },
        password: { label: "Mot de passe", type: "password" },
        theme: { label: "Thème", type: "text" }
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json"
            },
            credentials: "include",
            mode: "cors",
            body: JSON.stringify(credentials)
          });

          if (!res.ok) {
            const error = await res.text();
            throw new Error(error || "Authentication failed");
          }

          const text = await res.text();
          const data = JSON.parse(text);

          return {
            id: data.id,
            username: data.username,
            email: data.email,
            role: data.role,
            image: data.image,
            language: data.language,
            timezone: data.timezone,
            notification_enabled: data.notification_enabled,
            theme: data.theme,
            token: data.accessToken,
            refreshToken: data.refreshToken
          };
        } catch (error) {
          throw new Error(error.message || "An unexpected error occurred");
        }
      }
    })
  ],

  // session: {
  //   strategy: "jwt",
  //   maxAge: 14 * 60 // 15 minutes
  // },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On login
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.role = user.role;
        token.image = user.image;
        token.language = user.language;
        token.timezone = user.timezone;
        token.notification_enabled = user.notification_enabled;
        token.theme = user.theme;
        token.accessToken = user.token;
        token.refreshToken = user.refreshToken;
      }

      // On update() call (i.e., token refresh)
      if (trigger === "update" && session) {
        if (session.accessToken) token.accessToken = session.accessToken;
        if (session.refreshToken) token.refreshToken = session.refreshToken;
      }

      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id,
        username: token.username,
        email: token.email,
        role: token.role,
        image: token.image,
        language: token.language,
        timezone: token.timezone,
        notification_enabled: token.notification_enabled,
        theme: token.theme,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken
      };
      return session;
    }
  }
};

export default NextAuth(authOptions);