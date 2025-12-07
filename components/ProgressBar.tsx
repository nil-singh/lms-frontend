// components/ProgressBar.tsx
import React from "react";

type Props = {
  current: number;
  total: number;
};

export default function ProgressBar({ current, total }: Props) {
  const pct = Math.min(100, Math.round((current / (total || 1)) * 100));
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
        <div>Progress</div>
        <div>
          {current}/{total}
        </div>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
