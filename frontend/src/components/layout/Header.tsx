import Image from "next/image";

import { SignOut } from "@/components/auth/SignOut";

export function Header({
  nome,
  email,
  imagem,
  mostrarLogout = true,
}: {
  nome: string | null | undefined;
  email: string | null | undefined;
  imagem: string | null | undefined;
  mostrarLogout?: boolean;
}) {
  return (
    // Etapa 26: primeira superficie de vidro real do app. sticky+z
    // pra flutuar sobre o conteudo que rola por baixo - sem isso o
    // blur nao tem nada atras pra desfocar de verdade.
    <header className="glass sticky top-0 z-40 flex h-14 items-center justify-between gap-4 px-4 md:px-6">
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
        {mostrarLogout ? <SignOut /> : null}
      </div>
    </header>
  );
}
