import React from "react";
import { Laptop2, MapPin, Shuffle, Home } from "lucide-react";
import { Cn } from "@/lib/utils";
import { Venue } from "@/lib/api/types";
import { PostFormData, AdminUnit } from "@/app/tutor-post/page";
import { GetInputCls, FieldError } from "@/app/tutor-post/page";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

// Danh sách các địa điểm dạy offline
const VENUES: {
  value: Venue;
  label: string;
  desc: string;
  icon: React.ReactNode;
  selected: string;
  hover: string;
}[] = [
  {
    value: "TUTOR",
    label: "Tại nhà gia sư",
    desc: "Học sinh đến nhà bạn để học",
    icon: <Home className="h-5 w-5 shrink-0" />,
    selected: "border-sky-500 bg-sky-500/5 text-sky-600 dark:text-sky-400",
    hover: "hover:border-sky-500/30",
  },
  {
    value: "STUDENT",
    label: "Tại nhà học sinh",
    desc: "Bạn đến nhà học sinh để dạy",
    icon: <MapPin className="h-5 w-5 shrink-0" />,
    selected: "border-violet-500 bg-violet-500/5 text-violet-600 dark:text-violet-400",
    hover: "hover:border-violet-500/30",
  },
  {
    value: "BOTH",
    label: "Tùy ý",
    desc: "Địa điểm khác",
    icon: <Shuffle className="h-5 w-5 shrink-0" />,
    selected: "border-amber-500 bg-amber-500/5 text-amber-600 dark:text-amber-400",
    hover: "hover:border-amber-500/30",
  },
];

interface PostModeProps {
  form: PostFormData;
  errors: Partial<Record<keyof PostFormData, string>>;
  handleUpdate: <K extends keyof PostFormData>(field: K, value: PostFormData[K]) => void;
  provinces: AdminUnit[];
  provincesLoading: boolean;
  provinceCode: number | null;
  handleProvinceChange: (code: string | null) => void;
  wards: AdminUnit[];
  wardsLoading: boolean;
  handleWardChange: (code: string | null) => void;
}

export function PostMode({
  form,
  errors,
  handleUpdate,
  provinces,
  provincesLoading,
  provinceCode,
  handleProvinceChange,
  wards,
  wardsLoading,
  handleWardChange,
}: PostModeProps) {
  return (
    <>
      {/* Chọn hình thức dạy Online hay Offline */}
      <div id="mode">
        <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Bạn nhận dạy <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          {([
            { value: "ONLINE", label: "Online", desc: "Dạy qua nền tảng học online không cần địa điểm", icon: <Laptop2 className="h-5 w-5 shrink-0" />, selected: "border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400", hover: "hover:border-emerald-500/30" },
            { value: "OFFLINE", label: "Offline", desc: "Dạy trực tiếp tại khu vực cụ thể", icon: <MapPin className="h-5 w-5 shrink-0" />, selected: "border-amber-500 bg-amber-500/5 text-amber-600 dark:text-amber-400", hover: "hover:border-amber-500/30" },
          ] as const).map((opt) => {
            const isSelected = form.mode === opt.value;
            return (
              <div key={opt.value} onClick={() => handleUpdate("mode", opt.value)} className={Cn("cursor-pointer rounded-2xl border-2 p-4 transition-all", isSelected ? opt.selected : Cn("border-white/50 dark:border-white/10 bg-white/20 dark:bg-white/3 text-foreground", opt.hover))}>
                <div className="flex items-center gap-2">
                  {opt.icon}
                  <span className="font-semibold text-sm">{opt.label}</span>
                </div>
                <p className="text-[12px] opacity-70 mt-1.5">{opt.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hiển thị chi tiết địa điểm nếu chọn dạy Offline */}
      {form.mode === "OFFLINE" && (
        <div className="space-y-4" id="venue">
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Địa điểm dạy <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Lặp qua danh sách địa điểm VENUES để hiển thị các lựa chọn */}
              {VENUES.map((opt) => {
                const isSelected = form.venue === opt.value;
                return (
                  <div key={opt.value} onClick={() => handleUpdate("venue", opt.value)} className={Cn("cursor-pointer rounded-2xl border-2 p-4 transition-all", isSelected ? opt.selected : Cn("border-white/50 dark:border-white/10 bg-white/20 dark:bg-white/3 text-foreground", opt.hover))}>
                    <div className="flex items-center gap-2">
                      {opt.icon}
                      <span className="font-semibold text-sm">{opt.label}</span>
                    </div>
                    <p className="text-[12px] opacity-70 mt-1.5">{opt.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hiển thị khu vực chọn địa chỉ nếu chọn dạy Tại nhà gia sư */}
          {form.venue === "TUTOR" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Tỉnh/Thành phố */}
              <div id="city">
                <label htmlFor="city-select" className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tỉnh/Thành phố <span className="text-rose-500">*</span>
                </label>
                <Select value={provinceCode ? provinceCode.toString() : ""} onValueChange={handleProvinceChange} items={provinces.map((p) => ({ value: p.code.toString(), label: p.name }))}>
                  <SelectTrigger id="city-select" className="w-full h-12 rounded-2xl border border-white/50 dark:border-white/10 bg-white/20 dark:bg-white/3">
                    <SelectValue placeholder={provincesLoading ? "Đang tải tỉnh/thành..." : "Chọn tỉnh/thành phố"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border border-white/50 dark:border-white/10 bg-white/80 dark:bg-slate-900/80">
                    {provinces.map((p) => (<SelectItem key={p.code} value={p.code.toString()}>{p.name}</SelectItem>))}
                  </SelectContent>
                </Select>
                <FieldError message={errors.city} />
              </div>

              {/* Phường/Xã */}
              <div id="ward">
                <label htmlFor="ward-select" className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Phường/Xã
                </label>
                <Select value={wards.find((w) => w.name === form.ward) ? wards.find((w) => w.name === form.ward)!.code.toString() : ""} onValueChange={handleWardChange} items={wards.map((w) => ({ value: w.code.toString(), label: w.name }))}>
                  <SelectTrigger id="ward-select" disabled={!provinceCode || wardsLoading} className="w-full h-12 rounded-2xl border border-white/50 dark:border-white/10 bg-white/20 dark:bg-white/3 disabled:opacity-50">
                    <SelectValue placeholder={!provinceCode ? "Chọn tỉnh/thành trước" : wardsLoading ? "Đang tải phường/xã..." : "Chọn phường/xã"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border border-white/50 dark:border-white/10 bg-white/80 dark:bg-slate-900/80">
                    {wards.map((w) => (<SelectItem key={w.code} value={w.code.toString()}>{w.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tên đường, số nhà */}
              <div id="street">
                <label htmlFor="street-input" className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Số nhà, đường
                </label>
                <input id="street-input" value={form.street} onChange={(e) => handleUpdate("street", e.target.value)} placeholder="Nhập số nhà, đường của bạn" className={GetInputCls(false)} />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
