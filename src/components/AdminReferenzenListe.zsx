"use client";

import { useState } from "react";
import AdminReferenzEditor from "@/components/AdminReferenzEditor";
import { useSprache } from "@/components/SprachProvider";
import type { Kategorie, ReferenzMitDetails, ReferenzTyp, Teil } from "@/lib/supabase/types";

const TYP_ICON: Record<ReferenzTyp, string> = { video: "🎥", foto: "📷", dokument: "📄", link: "🔗" };
const ALLE = "alle";

export default function AdminReferenzenListe({
  referenzen,
  kategorien,
  teile,
}: {
  referenzen: ReferenzMitDetails[];
  kategorien: Kategorie[];
  teile: Teil[];
}) {
  const { t } = useSprache();
  const [typFilter, setTypFilter] = useState<ReferenzTyp | typeof ALLE>(ALLE);

  const gefiltert = typFilter === ALLE ? referenzen : referenzen.filter((r) => r.typ === typFilter);

  return (
    <div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setTypFilter(ALLE)}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            typFilter === ALLE ? "bg-accent text-accent-ink" : "bg-surface text-foreground-soft ring-1 ring-line"
          }`}
        >
          {t("admin.referenzenTypFilter")}
        </button>
        {(Object.keys(TYP_ICON) as ReferenzTyp[]).map((typ) => (
          <button
            key={typ}
            type="button"
            onClick={() => setTypFilter(typ)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              typFilter === typ ? "bg-accent text-accent-ink" : "bg-surface text-foreground-soft ring-1 ring-line"
            }`}
          >
            {TYP_ICON[typ]} {t(`referenzUpload.typ${typ.charAt(0).toUpperCase()}${typ.slice(1)}`)}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-6">
        {gefiltert.map((referenz) => (
          <AdminReferenzEditor key={referenz.id} referenz={referenz} kategorien={kategorien} teile={teile} />
        ))}
      </div>
    </div>
  );
}
