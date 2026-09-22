import { Skeleton, VideoCardSkeleton } from "@/components/Skeleton";

export default function DashboardLaedt() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="border-t-[3px] border-rule bg-plate-soft/10 p-6 md:p-8">
        <Skeleton className="h-3 w-32 bg-plate-soft/20" />
        <Skeleton className="mt-3 h-16 w-64 max-w-full bg-plate-soft/20 md:h-24" />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-40" />
      </div>

      <div className="mt-10">
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
