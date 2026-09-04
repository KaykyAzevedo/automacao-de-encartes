import { getServerSession } from "next-auth";
import Image from "next/image";
import { redirect } from "next/navigation";

import { SignOut } from "@/components/auth/SignOut";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { user } = session;

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-12">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <SignOut />
      </header>

      <section className="mt-10 rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
        <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          Usuario logado
        </h2>

        <div className="mt-4 flex items-center gap-4">
          {user.image ? (
            <Image
              src={user.image}
              alt=""
              width={56}
              height={56}
              className="rounded-full"
            />
          ) : null}

          <div>
            <p className="font-medium">{user.name ?? "(sem nome)"}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {user.email}
            </p>
          </div>
        </div>

        <dl className="mt-6 border-t border-neutral-200 pt-4 text-sm dark:border-neutral-800">
          <div className="flex justify-between py-1">
            <dt className="text-neutral-500 dark:text-neutral-400">ID</dt>
            <dd className="font-mono text-xs">{user.id}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
