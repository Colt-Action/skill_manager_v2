export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-paper-2 ${className}`} />;
}

export function VideoCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden border border-rule bg-paper">
      <Skeleton className="aspect-video w-full" />
      <div className="flex flex-col gap-2 p-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
