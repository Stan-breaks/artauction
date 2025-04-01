import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/models/User'
import bcrypt from 'bcryptjs'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password')
        }

        await connectToDatabase()

        const user = await User.findOne({ email: credentials.email })
        if (!user) {
          throw new Error('No user found with this email')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error('Invalid password')
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
})

export { handler as GET, handler as POST } 