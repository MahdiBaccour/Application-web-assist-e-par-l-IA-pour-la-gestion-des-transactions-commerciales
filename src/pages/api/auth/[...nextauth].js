import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            credentials: 'include',
            mode: 'cors',
            body: JSON.stringify(credentials),
          });
      
          // Handle HTTP errors
          if (!res.ok) {
            const error = await res.text();
            console.error('Login failed:', error);
            throw new Error(error || 'Authentication failed');
          }
      
          // ✅ If response is not JSON, log error
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            console.log("data is",data);
           // if (!data.success) throw new Error(data.message || "Invalid credentials");
          
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
              refreshToken: data.refreshToken,
            };
          } catch (err) {
            console.error("Unexpected API response:", text);
            throw new Error("Invalid server response");
          }
        } catch (error) {
          console.error("Login error:", error);
          throw new Error(error.message || "An unexpected error occurred");
        }
      }
    }),
  ],
  // session: {
  //   strategy: "jwt",
  // },
  // cookies: {
  //   sessionToken: {
  //     name: "next-auth.session-token",
  //     options: {
  //       httpOnly: true,
  //       secure: true,
  //       sameSite: "lax",
  //       path: "/",
  //     },
  //   },
  // },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
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
      //console.log("JWT Token:", token);
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.email = token.email;
      session.user.role = token.role;
      session.user.image = token.image;
      session.user.language = token.language;
      session.user.timezone = token.timezone;
      session.user.notification_enabled = token.notification_enabled;
      session.user.theme = token.theme;
      session.user.accessToken = token.accessToken;
      session.user.refreshToken = token.refreshToken;
      //console.log("session:", session);
      return session;
    },
  },
};

export default NextAuth(authOptions);