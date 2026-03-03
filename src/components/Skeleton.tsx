export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse motion-reduce:animate-none bg-gray-200 rounded ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-8 w-20" />
    </div>
  );
}

export function MenuItemSkeleton() {
  return (
    <div className="flex justify-between items-start p-4 bg-white rounded-lg shadow-sm">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-10 w-10 rounded-lg" />
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-3 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}
