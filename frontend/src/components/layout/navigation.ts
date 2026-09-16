export type NavIconName =
  "dashboard" | "preparation" | "themes" | "create" | "drafts";

export type NavItem = {
  href: string;
  rotulo: string;
  rotuloCurto: string;
  descricao: string;
  icon: NavIconName;
  destaque?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    rotulo: "Início",
    rotuloCurto: "Início",
    descricao: "Visão geral do seu trabalho",
    icon: "dashboard",
  },
  {
    href: "/preparation",
    rotulo: "Cadastros",
    rotuloCurto: "Cadastros",
    descricao: "Empresas, lojas e produtos",
    icon: "preparation",
  },
  {
    href: "/temas",
    rotulo: "Modelos",
    rotuloCurto: "Modelos",
    descricao: "Galeria e modelos próprios",
    icon: "themes",
  },
  {
    href: "/generate-encarte",
    rotulo: "Criar encarte",
    rotuloCurto: "Criar",
    descricao: "Monte uma nova oferta",
    icon: "create",
    destaque: true,
  },
  {
    href: "/drafts",
    rotulo: "Meus encartes",
    rotuloCurto: "Encartes",
    descricao: "Continue de onde parou",
    icon: "drafts",
  },
];

export function navItemEstaAtivo(pathname: string, href: string) {
  if (href === "/temas") {
    return (
      pathname.startsWith("/temas") ||
      pathname.startsWith("/preparation/themes")
    );
  }
  if (href === "/preparation") {
    return (
      (pathname === "/preparation" ||
        pathname.startsWith("/preparation/products")) &&
      !pathname.startsWith("/preparation/themes")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
