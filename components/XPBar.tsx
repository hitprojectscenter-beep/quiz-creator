"use client";

import { xpForNextLevel, calculateLevel } from "@/lib/utils";

export default function XPBar({ xp }: { xp: number }) {
  const level = calculateLevel(xp);
  const { current, needed } = xpForNextLevel(xp);
  const percent = Math.min(100, (current / needed) * 100);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {level}
          </div>
          <div>
            <div className="text-sm text-slate-500">רמה נוכחית</div>
            <div className="font-bold text-lg">רמה {level}</div>
          </div>
        </div>
        <div className="text-left">
          <div className="text-sm text-slate-500">XP</div>
          <div className="font-bold text-2xl gradient-text">{xp.toLocaleString()}</div>
        </div>
      </div>
      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full xp-bar transition-all duration-1000"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="text-xs text-slate-500 mt-1 text-center">
        {current} / {needed} XP לרמה {level + 1}
      </div>
    </div>
  );
}
