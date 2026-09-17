import Icon, { type IconName } from "@/components/icons/Icon";

export default function EmptyState({ icon, text }: { icon: IconName; text: string }) {
  return (
    <div className="mt-10 flex flex-col items-center gap-3 border-t border-rule py-10 text-center">
      <Icon name={icon} size={28} className="text-ink-faint" />
      <p className="max-w-sm text-sm text-ink-soft">{text}</p>
    </div>
  );
}
