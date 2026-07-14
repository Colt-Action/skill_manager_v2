export function dauerFormatieren(sekunden: number | null): string {
  if (!sekunden && sekunden !== 0) return "";
  const min = Math.floor(sekunden / 60);
  const sek = Math.round(sekunden % 60);
  return `${min}:${sek.toString().padStart(2, "0")} min`;
}

const STATUS_LABEL: Record<string, string> = {
  entwurf: "Entwurf",
  pruefung: "In Prüfung",
  veroeffentlicht: "Veröffentlicht",
};

export function statusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status;
}
