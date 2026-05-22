"use client";

export default function ProfileSkeleton() {
  return (
    <div className="px-6 py-8 max-w-5xl mx-auto w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
        <div className="h-10 bg-gray-200 rounded-full w-28"></div>
      </div>

      {/* Main card matching ProfileView */}
      <div className="bg-[#f0ece6]/50 border border-[#e4d5c4] rounded-3xl p-8">
        <div className="flex flex-col sm:flex-row gap-8">
          
          {/* Logo Skeleton */}
          <div className="flex flex-col items-center gap-3 sm:w-36 shrink-0">
            <div className="w-36 h-36 rounded-2xl bg-[#e2d9cf] border border-[#d5c8ba]"></div>
            <div className="h-4 bg-gray-200 rounded-md w-24 mt-2"></div>
          </div>

          {/* Fields Grid Skeleton */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="col-span-1">
                <div className="h-3 bg-gray-200 rounded-md w-24 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded-md w-4/5"></div>
              </div>
            ))}
            <div className="col-span-2">
              <div className="h-3 bg-gray-200 rounded-md w-32 mb-2"></div>
              <div className="h-5 bg-gray-200 rounded-md w-full"></div>
            </div>
            <div className="col-span-2">
              <div className="h-3 bg-gray-200 rounded-md w-20 mb-2"></div>
              <div className="h-12 bg-gray-200 rounded-md w-full"></div>
            </div>
          </div>
        </div>

        {/* Action zone skeleton */}
        <div className="mt-6 pt-6 border-t border-[#e4d5c4]">
          <div className="h-3 bg-gray-200 rounded-md w-20 mb-3"></div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="h-10 bg-gray-200 rounded-xl w-40"></div>
            <div className="h-10 bg-gray-200 rounded-xl w-40"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
