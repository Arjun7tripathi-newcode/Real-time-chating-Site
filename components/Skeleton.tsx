import { cn } from "@/lib/utils";

export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn("animate-pulse rounded-md bg-gray-100 dark:bg-zinc-800/50", className)} />
  );
};

export const MessageSkeleton = () => {
  return (
    <div className="space-y-6 w-full p-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={cn("flex items-end gap-3", i % 2 === 0 ? "flex-row-reverse" : "flex-row")}>
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="space-y-2">
            <Skeleton className={cn("h-4 w-[120px]", i % 2 === 0 ? "ml-auto" : "")} />
            <Skeleton className={cn("h-16 w-[200px] sm:w-[320px] rounded-2xl", i % 2 === 0 ? "rounded-tr-none" : "rounded-tl-none")} />
          </div>
        </div>
      ))}
    </div>
  );
};

export const SidebarSkeleton = () => {
  return (
    <div className="space-y-2 p-6">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-12 w-12 rounded-[20px] flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-2 w-[40px]" />
            </div>
            <Skeleton className="h-3 w-full opacity-60" />
          </div>
        </div>
      ))}
    </div>
  );
};
