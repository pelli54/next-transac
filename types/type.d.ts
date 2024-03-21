declare module "next-auth" {
  interface Session {
    user: {
      email: string,
      id: number | string
      username: string
      imgUrl: string | undefined
    }
  }
  
}
export type { AuthOptions as NextAuthOptions } from "./core/types"
