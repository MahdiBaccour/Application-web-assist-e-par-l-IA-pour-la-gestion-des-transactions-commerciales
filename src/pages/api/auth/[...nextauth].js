import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(process.env.Login, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const response = await res.json();

          if (!response.success) {
            throw new Error("Invalid credentials");
          }

          if (response.employee) {
        
            return {
              ...response.employee,
              _id: response.employee._id,
              department: response.employee.department,
              password: null,
              role: response.employee.role,
              token: response.token,
              image: response.employee.avatar,
              name: `${response.employee.firstName} ${response.employee.lastName}`
            };
          } else {
            return null;
          }
        } catch (error) {
          console.log(error);
          throw new Error("An error occurred while logging in.");
        }
      },
    }),
  ],
  
  secret: process.env.SECRET,
  callbacks: {
    async jwt({ token, user }) {
      
      if (user) {
        token._id = user._id;
        token.role = user.role;
        token.image = user.image;
        token.name = user.name;
        token.token = user.token;
        token.department = user.department;

      }
      return token;
    },
    async session({ session, token }) {
  
      if (session?.user) {
        session.user.role = token.role;
        session.user.image = token.image;
        session.user.name=token.name;
        session.user.token=token.token;
        session.user.department=token.department;
        session.user._id=token._id;
        

    
      }
      return session;
    },
  },

};



export default NextAuth(authOptions);