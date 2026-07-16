import { Skeleton, VideoCardSkeleton } from "@/components/Skeleton";

export default function VideothekLaedt() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-2 h-8 w-64 max-w-full" />
      <Skeleton className="mt-2 h-4 w-96 max-w-full" />

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <Skeleton className="h-14 min-w-[280px] flex-1" />
        <Skeleton className="h-14 w-44" />
        <Skeleton className="h-14 min-w-[240px] max-w-sm flex-1" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
