import React from "react";
import { Search, X } from "lucide-react";
import { Cn } from "@/lib/utils";
import { type ContractStatus } from "@/lib/api/contract";

// ─────────────────────────────────────────────────────────────────────────────
// ORDER TABS — Search and filter controls for the contract list
// ─────────────────────────────────────────────────────────────────────────────

export type StatusFilter = ContractStatus | "all";

const STATUS_FILTER_LIST: Array<{ key: StatusFilter; label: string }> = [
  { key: "all", label: "Tất cả" },
  { key: "PENDING", label: "Chờ duyệt" },
  { key: "OPEN", label: "Chờ cọc" },
  { key: "ACTIVE", label: "Đang học" },
  { key: "DONE", label: "Hoàn thành" },
  { key: "CANCEL", label: "Đã hủy" },
];

export function OrderTabs({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onResetAll,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (s: StatusFilter) => void;
  onResetAll: () => void;
}) {
  const hasActive = search !== "" || statusFilter !== "all";

  return (
    <div className="rounded-2xl border border-white/60 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl shadow-sm p-4 space-y-3">
      {/* Search + reset */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm theo mã hợp đồng, tiêu đề..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-background/60 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        {hasActive && (
          <button
            onClick={onResetAll}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border/60 bg-background/60 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
            Xóa lọc
          </button>
        )}
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTER_LIST.map((s) => (
          <button
            key={s.key}
            onClick={() => onStatusFilterChange(s.key)}
            className={Cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border",
              statusFilter === s.key
                ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                : "bg-background/60 border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
