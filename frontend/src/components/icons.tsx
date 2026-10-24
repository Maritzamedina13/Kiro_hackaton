import type { ReactElement, SVGProps } from "react";

// Iconos SVG inline (sin dependencias). Son decorativos: se marcan con
// aria-hidden para que los lectores de pantalla no los anuncien; el texto
// contiguo transmite el significado (no dependemos solo del icono/color).

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps): IconProps {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    focusable: false,
    ...props,
  };
}

export function IconPulso(props: IconProps): ReactElement {
  return (
    <svg {...base(props)}>
      <path d="M3 12h4l2-6 4 12 2-6h6" />
    </svg>
  );
}

export function IconAlerta(props: IconProps): ReactElement {
  return (
    <svg {...base(props)}>
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function IconReloj(props: IconProps): ReactElement {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function IconInbox(props: IconProps): ReactElement {
  return (
    <svg {...base(props)}>
      <path d="M3 13h5l1 3h6l1-3h5" />
      <path d="M5 5h14l2 8v6H3v-6L5 5Z" />
    </svg>
  );
}

export function IconCheck(props: IconProps): ReactElement {
  return (
    <svg {...base(props)}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconFlecha(props: IconProps): ReactElement {
  return (
    <svg {...base(props)}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function IconMapa(props: IconProps): ReactElement {
  return (
    <svg {...base(props)}>
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function IconUsuario(props: IconProps): ReactElement {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </svg>
  );
}

export function IconDispositivo(props: IconProps): ReactElement {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M3 10h4l1.5-3 2.5 6 1.5-3h2M17 14v.01M9 21h6" />
    </svg>
  );
}

export function IconError(props: IconProps): ReactElement {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}
