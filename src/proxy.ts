import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, manifest.json, sw.js
     * - public files (svg/png/jpg/jpeg/gif/webp)
     * - api/ingest (sensor data webhook — uses service role internally)
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|api/ingest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
