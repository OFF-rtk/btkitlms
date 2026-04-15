import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJwt } from "@/lib/jwt";

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (token) {
    try {
      const payload = await verifyJwt(token);
      const userMeta = payload.user_metadata as Record<string, string> | undefined;
      const role = userMeta?.role ?? "student";
      redirect(`/${role}/dashboard`);
    } catch {
      /* Invalid token — fall through to login */
    }
  }

  redirect("/auth/student/login");
}
