// Feste Auswahllisten für die Zusatzangaben bei Referenzvideos. An einer
// Stelle gepflegt, damit Upload-Formular und Filter auf der
// Referenzvideos-Seite immer dieselben Optionen zeigen.

export const MATERIAL_OPTIONEN = [
  "Zement",
  "Limestone (Kalkstein)",
  "Klinker",
  "Schlacke",
  "Kohle",
  "Recycling",
  "Kupfer",
  "Kupferkonzentrat",
  "Gold",
  "Eisenerz",
  "Bauxit",
  "Aluminiumoxid",
  "Kali/Kalisalz",
  "Gips",
  "Sand",
  "Kies",
  "Holzhackschnitzel/Biomasse",
  "Getreide",
  "Dünger",
  "Salz",
  "Schwefel",
  "Nickelerz",
  "Zinkkonzentrat",
  "Bleikonzentrat",
  "Abraum",
  "Splitt/Schotter",
  "Phosphat",
  "Sonstiges",
] as const;

export const FOERDERBANDBREITE_OPTIONEN = [
  "0-200mm",
  "200-400mm",
  "400-600mm",
  "600-800mm",
  "800-1000mm",
  "1000-1200mm",
  "1200-1400mm",
  "1400-1600mm",
  "1600-1800mm",
  "1800-2000mm",
  "2000-2200mm",
  "2200-2400mm",
  "2400-2600mm",
  "2600-2800mm",
  "2800-3000mm",
  "3000-3200mm",
] as const;

export const BELT_CONNECTION_OPTIONEN = [
  "Hot Vulcanized",
  "Cold Vulcanized",
  "Mechanical Splice",
] as const;

export const GESCHWINDIGKEIT_MIN = 0;
export const GESCHWINDIGKEIT_MAX = 14;
export const GESCHWINDIGKEIT_SCHRITT = 0.1;
