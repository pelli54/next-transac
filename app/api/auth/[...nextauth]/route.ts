import nextAuth from 'next-auth'
import { authOption } from '@/authOption'

const handle = nextAuth(authOption)

export { handle as GET, handle as POST }