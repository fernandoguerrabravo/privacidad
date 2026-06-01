import { redirect } from "next/navigation";

export default function Home() {
  // El middleware se encarga de la sesión; redirigimos al panel.
  redirect("/dashboard");
}
