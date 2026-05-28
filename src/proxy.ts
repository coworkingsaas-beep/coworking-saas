import { NextResponse, type NextRequest } from "next/server";

// Route protection is handled at the page level via supabase.auth.getUser()
// The proxy just passes all requests through — no redirect loops.
export async function proxy(request: NextRequest) {
  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
