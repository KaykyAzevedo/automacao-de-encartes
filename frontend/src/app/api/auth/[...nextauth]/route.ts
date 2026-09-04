import NextAuth from "next-auth";

import { authOptions } from "@/lib/auth";

// No App Router o arquivo [...nextauth] e um route handler,
// e nao o [...nextauth].ts do Pages Router.
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
