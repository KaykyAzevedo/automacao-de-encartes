import { useEffect, type RefObject } from "react";

const SELETOR_FOCAVEL =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Usado por Modal e ConfirmDialog: ao abrir, joga o foco pro dialogo
// (ou pro primeiro elemento focavel dentro dele) e prende o Tab/
// Shift+Tab la dentro - sem isso, quem navega so por teclado perde a
// referencia assim que um dialogo abre por cima da pagina.
export function useTravaFoco(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const painel = ref.current;
    if (!painel) return;

    const focaveis = () =>
      Array.from(painel.querySelectorAll<HTMLElement>(SELETOR_FOCAVEL));

    // se algo dentro do dialogo ja pediu foco explicitamente
    // (autoFocus), respeita isso em vez de roubar pro primeiro item
    if (!painel.contains(document.activeElement)) {
      (focaveis()[0] ?? painel).focus();
    }

    const prenderFoco = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const elementos = focaveis();
      if (elementos.length === 0) {
        e.preventDefault();
        return;
      }
      const primeiro = elementos[0];
      const ultimo = elementos[elementos.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    };

    painel.addEventListener("keydown", prenderFoco);
    return () => painel.removeEventListener("keydown", prenderFoco);
  }, [ref]);
}
