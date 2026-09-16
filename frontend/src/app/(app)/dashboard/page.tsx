import { HomeOverview } from "@/components/dashboard/HomeOverview";
import { getUsuarioAtual } from "@/lib/session";

export default async function DashboardPage() {
  const user = (await getUsuarioAtual())!;

  return <HomeOverview nome={user.name ?? user.email ?? "Olá"} />;
}
