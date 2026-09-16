import { Skeleton, VideoCardSkeleton } from "@/components/Skeleton";

export default function DashboardLaedt() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-2 h-8 w-80 max-w-full" />
      <Skeleton className="mt-2 h-4 w-64 max-w-full" />

      <div className="mt-6 flex flex-wrap gap-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-40" />
      </div>

      <div className="mt-8">
        <Skeleton className="h-3 w-40" />
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
