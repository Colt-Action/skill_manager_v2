"use client";

import { useState } from "react";
import AdminReferenzEditor from "@/components/AdminReferenzEditor";
import { useSprache } from "@/components/SprachProvider";
import Icon, { type IconName } from "@/components/icons/Icon";
import type { Kategorie, ReferenzMitDetails, ReferenzTyp, Teil } from "@/lib/supabase/types";

const TYP_ICON: Record<ReferenzTyp, IconName> = { video: "video", foto: "foto", dokument: "dokument", link: "link" };
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
          className={`rounded-[2px] border px-3 py-1 text-xs font-semibold ${
            typFilter === ALLE ? "border-signal text-ink" : "border-rule text-ink-soft"
          }`}
        >
          {t("admin.referenzenTypFilter")}
        </button>
        {(Object.keys(TYP_ICON) as ReferenzTyp[]).map((typ) => (
          <button
            key={typ}
            type="button"
            onClick={() => setTypFilter(typ)}
            className={`flex items-center gap-1.5 rounded-[2px] border px-3 py-1 text-xs font-semibold ${
              typFilter === typ ? "border-signal text-ink" : "border-rule text-ink-soft"
            }`}
          >
            <Icon name={TYP_ICON[typ]} size={13} />
            {t(`referenzUpload.typ${typ.charAt(0).toUpperCase()}${typ.slice(1)}`)}
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
