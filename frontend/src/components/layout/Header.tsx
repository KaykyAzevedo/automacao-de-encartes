import Image from "next/image";

import { SignOut } from "@/components/auth/SignOut";

export function Header({
  nome,
  email,
  imagem,
}: {
  nome: string | null | undefined;
  email: string | null | undefined;
  imagem: string | null | undefined;
}) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-neutral-200 px-4 py-3 md:px-6 dark:border-neutral-800">
      <span className="text-sm font-semibold tracking-tight">
        Encarte Gerador
      </span>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-xs font-medium leading-tight">{nome ?? email}</p>
          <p className="text-xs leading-tight text-neutral-500 dark:text-neutral-400">
            {email}
          </p>
        </div>
        {imagem ? (
          <Image
            src={imagem}
            alt=""
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : null}
        <SignOut />
      </div>
    </header>
  );
}
