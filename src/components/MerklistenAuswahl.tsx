"use client";

import { useEffect, useState, useTransition } from "react";
import { favoritUmschalten, merklistenStatusLaden } from "@/lib/actions/favoriten";
import { useSprache } from "@/components/SprachProvider";
import Icon from "@/components/icons/Icon";

interface Team {
  id: string;
  name: string;
  gemerkt: boolean;
}

// Ersetzt den einfachen Stern-Toggle auf der Video-Detailseite: hier trifft
// man die bewusste Entscheidung, ob ein Video "nur für mich" oder (auch) in
// einem geteilten Merkteam gemerkt wird - ein Video kann gleichzeitig in
// mehreren Listen liegen.
export default function MerklistenAuswahl({ videoId }: { videoId: string }) {
  const { t } = useSprache();
  const [offen, setOffen] = useState(false);
  const [geladen, setGeladen] = useState(false);
  const [persoenlich, setPersoenlich] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [laeuft, startTransition] = useTransition();

  // Lädt sofort beim Einblenden, nicht erst beim Öffnen des Dropdowns - sonst
  // zeigt der Stern fälschlich "nicht gemerkt", solange man ihn nicht
  // angeklickt hat, selbst wenn das Video längst gemerkt ist.
  useEffect(() => {
    merklistenStatusLaden(videoId).then((status) => {
      setPersoenlich(status.persoenlich);
      setTeams(status.teams);
      setGeladen(true);
    });
  }, [videoId]);

  const aktiv = persoenlich || teams.some((team) => team.gemerkt);

  function persoenlichUmschalten() {
    const neuerWert = !persoenlich;
    startTransition(async () => {
      const ergebnis = await favoritUmschalten(videoId, neuerWert, null);
      if (ergebnis.erfolg) setPersoenlich(neuerWert);
    });
  }

  function teamUmschalten(team: Team) {
    const neuerWert = !team.gemerkt;
    startTransition(async () => {
      const ergebnis = await favoritUmschalten(videoId, neuerWert, team.id);
      if (ergebnis.erfolg) {
        setTeams((vorherig) => vorherig.map((t2) => (t2.id === team.id ? { ...t2, gemerkt: neuerWert } : t2)));
      }
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOffen((o) => !o)}
        title={t("merklistenAuswahl.button")}
        aria-label={t("merklistenAuswahl.button")}
        className={`flex h-9 w-9 items-center justify-center rounded-full border border-rule bg-paper transition ${
          aktiv ? "text-ink" : "text-ink-faint hover:text-ink"
        }`}
      >
        <Icon name={aktiv ? "sternVoll" : "stern"} size={16} />
      </button>

      {offen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOffen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-64 rounded-[2px] bg-paper p-2 text-ink">
            <label className="flex items-center gap-2 rounded-[2px] px-2 py-1.5 text-sm hover:bg-paper-2">
              <input
                type="checkbox"
                checked={persoenlich}
                disabled={laeuft}
                onChange={persoenlichUmschalten}
                className="h-4 w-4 accent-signal"
              />
              {t("merklistenAuswahl.nurFuerMich")}
            </label>

            {teams.length > 0 && (
              <>
                <p className="mt-1 border-t border-rule px-2 pt-2 font-mono text-[11px] uppercase tracking-wide text-ink-soft">
                  {t("merklistenAuswahl.merkteams")}
                </p>
                {teams.map((team) => (
                  <label key={team.id} className="flex items-center gap-2 rounded-[2px] px-2 py-1.5 text-sm hover:bg-paper-2">
                    <input
                      type="checkbox"
                      checked={team.gemerkt}
                      disabled={laeuft}
                      onChange={() => teamUmschalten(team)}
                      className="h-4 w-4 accent-signal"
                    />
                    {team.name}
                  </label>
                ))}
              </>
            )}

            {teams.length === 0 && geladen && (
              <p className="mt-1 border-t border-rule px-2 pt-2 text-xs text-ink-soft">
                {t("merklistenAuswahl.keineMerkteams")}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
