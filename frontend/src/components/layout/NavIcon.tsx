import type { SVGProps } from "react";

import type { NavIconName } from "./navigation";

export function NavIcon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: NavIconName }) {
  const paths: Record<NavIconName, React.ReactNode> = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    preparation: (
      <>
        <path d="M4 7h16M7 3v4M17 3v4" />
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M8 12h3M8 16h8" />
      </>
    ),
    themes: (
      <>
        <path d="M12 3a9 9 0 1 0 0 18h1.2a2 2 0 0 0 1.5-3.3 1.8 1.8 0 0 1 1.4-3h1.4A3.5 3.5 0 0 0 21 11.2 8.5 8.5 0 0 0 12 3Z" />
        <path d="M7.5 10h.01M9.5 6.8h.01M14 6.5h.01" />
      </>
    ),
    create: (
      <>
        <path d="M12 3v18M3 12h18" />
      </>
    ),
    drafts: (
      <>
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M14 3v5h5M9 13h6M9 17h5" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
