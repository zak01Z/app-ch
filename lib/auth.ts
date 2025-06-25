import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectDB } from "./mongodb"
import { User } from "@/models/User"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔐 Login attempt for:", credentials?.email)

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials")
          return null
        }

        try {
          await connectDB()
          console.log("✅ Connected to MongoDB")

          // Check if user exists
          const existingUser = await User.findOne({ email: credentials.email })
          console.log("👤 Existing user found:", !!existingUser)

          if (!existingUser) {
            console.log("🆕 Creating demo users...")

            // Create demo users if they don't exist
            if (credentials.email === "admin@demo.com" && credentials.password === "password") {
              const hashedPassword = await bcrypt.hash("password", 12)
              const newUser = new User({
                name: "Admin User",
                email: "admin@demo.com",
                password: hashedPassword,
                role: "admin",
                status: "online",
              })
              await newUser.save()
              console.log("✅ Created admin user")
              return {
                id: newUser._id.toString(),
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
              }
            } else if (credentials.email === "agent@demo.com" && credentials.password === "password") {
              const hashedPassword = await bcrypt.hash("password", 12)
              const newUser = new User({
                name: "Agent User",
                email: "agent@demo.com",
                password: hashedPassword,
                role: "agent",
                status: "online",
              })
              await newUser.save()
              console.log("✅ Created agent user")
              return {
                id: newUser._id.toString(),
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
              }
            }
            console.log("❌ Invalid demo credentials")
            return null
          }

          // Verify password for existing user
          const isPasswordValid = await bcrypt.compare(credentials.password, existingUser.password)
          console.log("🔑 Password valid:", isPasswordValid)

          if (!isPasswordValid) {
            console.log("❌ Invalid password")
            return null
          }

          console.log("✅ Login successful")
          return {
            id: existingUser._id.toString(),
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
          }
        } catch (error) {
          console.error("💥 Auth error:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
}
