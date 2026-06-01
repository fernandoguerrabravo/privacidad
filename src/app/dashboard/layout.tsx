import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import AppShell from "@/components/AppShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await cookies();
  const session = await verifySessionToken(store.get(SESSION_COOKIE)?.value);

  // Salvaguarda adicional al middleware.
  if (!session) {
    redirect("/login");
  }

  return <AppShell username={session.u}>{children}</AppShell>;
}
