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

const STATUS_TON: Record<string, "success" | "accent" | "neutral"> = {
  entwurf: "neutral",
  pruefung: "accent",
  veroeffentlicht: "success",
};

export function statusTon(status: string): "success" | "accent" | "neutral" {
  return STATUS_TON[status] ?? "neutral";
}

const ROLLEN_LABEL: Record<string, string> = {
  superadmin: "Superadmin",
  admin: "Admin",
  techniker: "Techniker",
  zuschauer: "Zuschauer",
};

export function rollenLabel(rolle: string): string {
  return ROLLEN_LABEL[rolle] ?? rolle;
}
