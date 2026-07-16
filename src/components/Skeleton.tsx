export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-line/60 ${className}`} />;
}

export function VideoCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-surface ring-1 ring-line">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="flex flex-col gap-2 p-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
