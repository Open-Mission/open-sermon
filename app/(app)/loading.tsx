import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-12 pb-20 px-4 sm:px-6 md:px-8 mt-10">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>

        <div className="hidden sm:block">
          <div className="border-b pb-2">
            <div className="grid grid-cols-12 gap-4 py-2 px-2">
              <Skeleton className="col-span-5 h-4 w-20" />
              <Skeleton className="col-span-4 h-4 w-16" />
              <Skeleton className="col-span-3 h-4 w-16 ml-auto" />
            </div>
          </div>
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 py-3 px-2 items-center">
                <div className="col-span-5 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="col-span-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="col-span-3">
                  <Skeleton className="h-4 w-20 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sm:hidden space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3 p-4 border rounded-xl">
              <Skeleton className="h-5 w-3/4" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
