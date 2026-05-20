interface LoadingStateProps {
  label?: string;
  fullScreen?: boolean;
}

export function LoadingState({ fullScreen = false, label = "Loading" }: LoadingStateProps) {
  return (
    <div className={`grid place-items-center ${fullScreen ? "min-h-screen bg-[#f5f3f8]" : "min-h-48"}`}>
      <div className="flex items-center gap-3 rounded-md border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 surface-shadow">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-teal-700" />
        {label}
      </div>
    </div>
  );
}
