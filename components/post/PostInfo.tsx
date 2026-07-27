import React from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { Cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Subject } from "@/lib/api/types";
import { PostFormData, TopicEntry } from "@/app/tutor-post/page";
import { GetInputCls, FieldError } from "@/app/tutor-post/page";

interface PostInfoProps {
  form: PostFormData;
  errors: Partial<Record<keyof PostFormData, string>>;
  handleUpdate: <K extends keyof PostFormData>(field: K, value: PostFormData[K]) => void;
  subjectsLoading: boolean;
  subjectSearch: string;
  setSubjectSearch: (val: string) => void;
  filteredSubjects: Subject[];
  addSubjectTopic: (subject: Subject) => void;
  removeTopic: (key: string) => void;
  customTopic: string;
  setCustomTopic: (val: string) => void;
  addCustomTopic: () => void;
  toggleGrade: (grade: number) => void;
}

export function PostInfo({
  form,
  errors,
  handleUpdate,
  subjectsLoading,
  subjectSearch,
  setSubjectSearch,
  filteredSubjects,
  addSubjectTopic,
  removeTopic,
  customTopic,
  setCustomTopic,
  addCustomTopic,
  toggleGrade,
}: PostInfoProps) {
  return (
    <>
      {/* Phần nhập tiêu đề */}
      <div id="title">
        <label htmlFor="title-input" className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Tiêu đề <span className="text-rose-500">*</span>
        </label>
        <input
          id="title-input"
          value={form.title}
          onChange={(e) => handleUpdate("title", e.target.value)}
          placeholder="VD: Gia sư Learninx"
          className={GetInputCls(!!errors.title)}
          maxLength={150}
        />
        <FieldError message={errors.title} />
      </div>

      {/* Phần chọn môn dạy */}
      <div id="topics">
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300">
            Môn dạy <span className="text-rose-500">*</span>
          </label>
          <span className="text-[13px] text-muted-foreground">{form.topics.length} đã chọn</span>
        </div>

        {/* Khung chứa các môn đã chọn và ô tìm kiếm */}
        <div className={Cn("min-h-[52px] p-2.5 rounded-2xl border border-white/50 dark:border-white/10 bg-white/20 dark:bg-white/3 transition-all duration-300 mb-3 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary", errors.topics && "border-rose-500/50")}>
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Hiển thị các môn đã chọn */}
            {form.topics.map((t: TopicEntry) => (
              <div
                key={t.key}
                role="button"
                tabIndex={0}
                title="Nhấp để xóa môn này"
                onClick={() => removeTopic(t.key)}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold cursor-pointer select-none transition-all duration-200 bg-slate-100 dark:bg-white/10 text-primary hover:opacity-80 active:scale-95 animate-in fade-in zoom-in-95"
              >
                {t.label}
                {!t.subjectId && <span className="text-[10px] uppercase tracking-wide opacity-60">tự nhập</span>}
                <X className="h-3 w-3 opacity-60 group-hover:opacity-100 group-hover:rotate-90 transition-all duration-200" />
              </div>
            ))}

            {/* Ô input tìm kiếm (chỉ hiện khi chưa có môn nào, có thể chỉnh sửa lại logic này nếu muốn) */}
            {form.topics.length === 0 && (
              <input
                type="text"
                value={subjectSearch}
                placeholder={subjectsLoading ? "Đang tải môn học..." : "Tìm kiếm môn học..."}
                disabled={subjectsLoading}
                onChange={(e) => setSubjectSearch(e.target.value)}
                className="flex-1 min-w-[160px] bg-transparent outline-none text-[14px] px-2 py-1.5 animate-in fade-in duration-200"
              />
            )}
          </div>
        </div>

        {/* Khu vực gợi ý môn học */}
        <p className="mb-1.5 text-[12px] text-muted-foreground">Gợi ý:</p>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
          {/* Hiển thị các môn học gợi ý */}
          {!subjectsLoading && filteredSubjects.map((s) => (
            <span
              key={s.id}
              onClick={() => addSubjectTopic(s)}
              className="inline-flex items-center rounded-full border border-white/50 dark:border-white/10 bg-white/30 dark:bg-white/5 px-3 py-1.5 text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/10 hover:shadow-md hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer active:scale-95"
            >
              <Plus className="mr-1 h-3 w-3" /> {s.name}
            </span>
          ))}

          {/* Trạng thái không tìm thấy */}
          {!subjectsLoading && !subjectSearch && filteredSubjects.length === 0 && (
            <p className="text-[13px] text-muted-foreground py-2 italic">Không tìm thấy môn học nào phù hợp</p>
          )}

          {/* Trạng thái đang tải */}
          {subjectsLoading && (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-[13px] text-muted-foreground">Đang tải môn học...</span>
            </div>
          )}
        </div>

        {/* Khung thêm môn học tùy chỉnh */}
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomTopic(); } }}
            placeholder="Môn học khác"
            className={Cn(GetInputCls(false), "h-11 flex-1")}
          />
          <Button
            type="button"
            variant="outline"
            onClick={addCustomTopic}
            className="h-11 shrink-0 rounded-2xl px-4 border border-white/50 dark:border-white/10 bg-white/60 dark:bg-white/5 font-bold text-xs tracking-widest hover:scale-[1.03] active:scale-95 transition-transform"
          >
            Thêm
          </Button>
        </div>
        <FieldError message={errors.topics} />
      </div>

      {/* Phần chọn khối lớp (chia thành 3 cấp) */}
      <div className="space-y-6">
        <div id="grades">
          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Khối lớp <span className="text-rose-500">*</span>
          </label>
          <div className="flex flex-col gap-5">
            
            {/* Khối Cấp 1 */}
            <div className="space-y-2">
              <p className="text-[13px] font-bold text-muted-foreground flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Cấp 1 (Tiểu học)</p>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((g) => {
                  const isSelected = form.grades.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGrade(g)}
                      className={Cn(
                        "flex-1 min-w-[80px] px-2 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all border",
                        isSelected
                          ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20 font-black shadow-sm"
                          : "border-white/50 dark:border-white/10 bg-white/40 dark:bg-white/5 text-muted-foreground hover:border-blue-500/40 hover:text-blue-600 dark:hover:text-blue-400"
                      )}
                    >
                      Lớp {g}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Khối Cấp 2 */}
            <div className="space-y-2">
              <p className="text-[13px] font-bold text-muted-foreground flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Cấp 2 (THCS)</p>
              <div className="flex flex-wrap gap-2">
                {[6, 7, 8, 9].map((g) => {
                  const isSelected = form.grades.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGrade(g)}
                      className={Cn(
                        "flex-1 min-w-[80px] px-2 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all border",
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 font-black shadow-sm"
                          : "border-white/50 dark:border-white/10 bg-white/40 dark:bg-white/5 text-muted-foreground hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400"
                      )}
                    >
                      Lớp {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Khối Cấp 3 */}
            <div className="space-y-2">
              <p className="text-[13px] font-bold text-muted-foreground flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span> Cấp 3 (THPT)</p>
              <div className="flex flex-wrap gap-2">
                {[10, 11, 12].map((g) => {
                  const isSelected = form.grades.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGrade(g)}
                      className={Cn(
                        "flex-1 min-w-[80px] px-2 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all border",
                        isSelected
                          ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-2 ring-violet-500/20 font-black shadow-sm"
                          : "border-white/50 dark:border-white/10 bg-white/40 dark:bg-white/5 text-muted-foreground hover:border-violet-500/40 hover:text-violet-600 dark:hover:text-violet-400"
                      )}
                    >
                      Lớp {g}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <FieldError message={errors.grades} />
        </div>
      </div>
    </>
  );
}
