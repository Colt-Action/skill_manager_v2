export default function EmptyState({
  icon,
  text,
}: {
  icon: string;
  text: string;
}) {
  return (
    <div className="mt-10 flex flex-col items-center gap-2 rounded-xl bg-surface px-6 py-10 text-center ring-1 ring-line">
      <span className="text-3xl grayscale opacity-70">{icon}</span>
      <p className="max-w-sm text-sm text-foreground-soft">{text}</p>
    </div>
  );
}
