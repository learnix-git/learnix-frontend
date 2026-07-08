"use client";

import { ArrowUpRight, BookOpen, GraduationCap, Search as SearchIcon, SearchX, Sparkles, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import type { User, Classroom } from "@/lib/api/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

type Mode = "student" | "teacher";
type Result =
  | { kind: "teacher"; data: User }       
  | { kind: "classroom"; data: Classroom };

const DEBOUNCE = 150;

const SUBJECTS = [
  "TOÁN", "NGỮ VĂN", "TIẾNG ANH", "VẬT LÝ", "HÓA HỌC", "SINH HỌC", "LỊCH SỬ", "ĐỊA LÝ", "TIN HỌC"
];

const CLASSROOMS: Classroom[] = [
  { id: "1", name: "Toán 12",      code: "TOAN12-A", description: "Lớp ôn tập môn Toán lớp 12",      capacity: 40, active: true, created: "", updated: "", teacherRef: { name: "Nguyễn Văn A" } } as any,
  { id: "2", name: "Ngữ văn 12",   code: "VAN12-B",  description: "Lớp ôn tập môn Ngữ văn lớp 12",   capacity: 40, active: true, created: "", updated: "", teacherRef: { name: "Trần Thị B" } } as any,
  { id: "3", name: "Tiếng Anh 12", code: "ANH12-C",  description: "Lớp ôn tập môn Tiếng Anh lớp 12", capacity: 40, active: true, created: "", updated: "", teacherRef: { name: "Lê Văn C" } } as any,
  { id: "4", name: "Vật lý 12",    code: "LY12-D",   description: "Lớp ôn tập môn Vật lý lớp 12",    capacity: 40, active: true, created: "", updated: "", teacherRef: { name: "Phạm Thị D" } } as any,
  { id: "5", name: "Hóa học 12",   code: "HOA12-E",  description: "Lớp ôn tập môn Hóa học lớp 12",   capacity: 40, active: true, created: "", updated: "", teacherRef: { name: "Hoàng Văn E" } } as any,
  { id: "6", name: "Sinh học 12",  code: "SINH12-F", description: "Lớp ôn tập môn Sinh học lớp 12",  capacity: 40, active: true, created: "", updated: "", teacherRef: { name: "Vũ Thị F" } } as any,
];

const TEACHERS: User[] = [
  { id: "t1", name: "Nguyễn Văn A", email: "nguyenvana@learnix.edu.vn", role: "TEACHER", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" } as any,
  { id: "t2", name: "Trần Thị B",   email: "tranthib@learnix.edu.vn",  role: "TEACHER", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" } as any,
  { id: "t3", name: "Lê Văn C",     email: "levanc@learnix.edu.vn",    role: "TEACHER", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" } as any,
  { id: "t4", name: "Phạm Thị D",   email: "phamthid@learnix.edu.vn",  role: "TEACHER", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80" } as any,
  { id: "t5", name: "Hoàng Văn E",  email: "hoangvane@learnix.edu.vn", role: "TEACHER", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" } as any,
  { id: "t6", name: "Vũ Thị F",     email: "vuthif@learnix.edu.vn",    role: "TEACHER", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" } as any,
];

export function Hero() {
  const [mode, setMode] = useState<Mode>("student");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const placeholder = mode === "student"
    ? "Tìm kiếm môn học, giáo viên..."
    : "Tìm kiếm tài liệu...";

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const keyword = debouncedQuery.toLowerCase();

    if (mode === "student") {
      const filteredClassrooms = CLASSROOMS.filter(c =>
        c.name.toLowerCase().includes(keyword) ||
        c.code.toLowerCase().includes(keyword) ||
        (c.description && c.description.toLowerCase().includes(keyword))
      ).map(data => ({ kind: "classroom", data } as Result)); 

      const filteredTeachers = TEACHERS.filter(t =>
        t.name.toLowerCase().includes(keyword) ||
        (t.email && t.email.toLowerCase().includes(keyword))
      ).map(data => ({ kind: "teacher", data } as Result));
      
      setResults([...filteredClassrooms, ...filteredTeachers]);
    } else {
      const filtered = TEACHERS.filter(t =>
        t.name.toLowerCase().includes(keyword) ||
        (t.email && t.email.toLowerCase().includes(keyword))
      );
      setResults(filtered.map(data => ({ kind: "teacher", data })));
    }
  }, [debouncedQuery, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    const params = new URLSearchParams({ search: trimmed });
    const target = mode === "student" ? "/classes" : "/teachers";
    router.push(`${target}?${params.toString()}`);
  };

  const handleResultClick = (result: Result) => {
    setOpen(false);
    if (result.kind === "teacher") {
      router.push(`/teachers/${result.data.id}`);
    } else {
      router.push(`/classes/${result.data.code}`);
    }
  };

  const showPopover = open && debouncedQuery.length > 0;
  const showEmpty = showPopover && results.length === 0;

  const viewAllHref = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("search", debouncedQuery);
    const target = mode === "student" ? "/classes" : "/teachers";
    return `${target}?${params.toString()}`;
  }, [debouncedQuery, mode]);

  return (
    <section className="relative overflow-hidden w-full">
      <div className="relative min-h-[640px] sm:min-h-svh lg:min-h-screen flex flex-col justify-center lg:justify-between gap-12 lg:gap-0 py-16 sm:py-20 lg:py-0 rounded-b-2xl overflow-hidden px-4 sm:px-6 lg:px-8">

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 h-[280px] w-[280px] sm:h-[500px] sm:w-[500px] md:h-[650px] md:w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute inset-0 bg-background/60" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--color-primary)_0%,transparent_55%)] opacity-30" />
        </div>

        <div className="absolute inset-x-0 bottom-0 h-20 sm:h-32 lg:h-40 bg-gradient-to-t from-background to-transparent z-[1] pointer-events-none" />

        <div className="relative z-10 w-full max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto lg:pt-24 xl:pt-32">
          <div className="flex flex-col items-center">

            {/* Toggle Role */}
            <div className="mb-5 sm:mb-7 lg:mb-8 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md p-1 shadow-lg">
              <button
                onClick={() => {
                  setMode("student");
                  setResults([]);
                }}
                className={`rounded-full px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  mode === "student"
                    ? "bg-primary text-white shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                Tôi là Học sinh
              </button>

              <button
                onClick={() => {
                  setMode("teacher");
                  setResults([]);
                }}
                className={`rounded-full px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  mode === "teacher"
                    ? "bg-primary text-white shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                Tôi là Giáo viên
              </button>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15] sm:leading-[1.2] lg:leading-[1.2] text-center text-foreground drop-shadow-lg">
              {mode === "student" ? (
                <>
                  Chinh phục tri thức, <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-primary to-primaryup bg-clip-text text-transparent">
                    tiến bộ mỗi ngày
                  </span>
                </>
              ) : (
                <>
                  Tuyển sinh hiệu quả, <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-primary to-primaryup bg-clip-text text-transparent">
                    quản lý tối ưu
                  </span>
                </>
              )}
            </h1>

            <p className="mt-3 sm:mt-5 lg:mt-6 text-center text-sm sm:text-base md:text-lg text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
              {mode === "student"
                ? "Kết nối ngay với hàng ngàn lớp học trực tuyến, luyện tập với ngân hàng câu hỏi đa dạng có đáp án và lời giải chi tiết."
                : "Thu hút nhiều học viên hơn, quản lý lớp học thông minh và nâng cao chất lượng giảng dạy trên một nền tảng duy nhất."}
            </p>

            <div className="mt-6 sm:mt-8 lg:mt-10 w-full md:w-11/12 lg:w-5/6 mx-auto">
              <Popover open={showPopover} onOpenChange={(next) => { if (!next) setOpen(false); }}>
                <div className="relative w-full">
                  <PopoverTrigger
                    nativeButton={false}
                    render={
                      <form
                        onSubmit={handleSubmit}
                        className="group relative flex items-center gap-1.5 sm:gap-2 rounded-2xl border border-white/60 dark:border-white/10 bg-white/45 dark:bg-white/5 backdrop-blur-2xl px-2.5 py-2 sm:px-4 sm:py-2.5 shadow-lg shadow-slate-200/60 dark:shadow-none transition-all focus-within:border-primary/40 focus-within:shadow-xl focus-within:shadow-primary/10 focus-within:bg-white/65 dark:focus-within:bg-white/10"
                      >
                        <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-focus-within:bg-primary group-focus-within:text-white">
                          <SearchIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </span>
                        <input
                          ref={inputRef}
                          type="text"
                          value={query}
                          onChange={(event) => {
                            setQuery(event.target.value);
                            setOpen(true);
                          }}
                          onFocus={() => setOpen(true)}
                          placeholder={placeholder}
                          autoComplete="off"
                          className="flex-1 min-w-0 bg-transparent outline-none text-foreground placeholder:text-muted-foreground/80 text-sm sm:text-base font-medium py-1.5 sm:py-2"
                        />
                        {query && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setQuery("");
                              setResults([]);
                              inputRef.current?.focus();
                            }}
                            aria-label="Xóa tìm kiếm"
                            className="inline-flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground dark:hover:bg-white/10 cursor-pointer border-none bg-transparent"
                          >
                            <SearchX className="h-4 w-4" />
                          </button>
                        )}
                      </form>
                    }
                  />

                  <PopoverContent align="start" side="bottom" sideOffset={10} initialFocus={false} className="w-[var(--anchor-width)] p-0">
                    <div className="max-h-[60vh] sm:max-h-[460px] overflow-y-auto p-2">
                      <div className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span className="truncate">Gợi ý cho &ldquo;{debouncedQuery}&rdquo;</span>
                      </div>

                      {showEmpty ? (
                        <div className="flex flex-col items-center gap-2 px-3 py-8 sm:py-10 text-center text-sm text-muted-foreground">
                          <SearchX className="h-7 w-7 text-primary/40" />
                          <p className="font-semibold">Không tìm thấy kết quả phù hợp</p>
                          <p className="text-xs text-muted-foreground/80">
                            Vui lòng thử từ khóa khác...
                          </p>
                        </div>
                      ) : (
                        <ul className="space-y-1">
                          {results.map((result) => (
                            <li key={`${result.kind}-${result.data.id}`}>
                              {result.kind === "teacher" ? (
                                <TeacherResultRow teacher={result.data} onClick={() => handleResultClick(result)} />
                              ) : (
                                <ClassroomResultRow classroom={result.data} onClick={() => handleResultClick(result)} />
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="border-t border-white/40 dark:border-white/10 bg-white/30 dark:bg-white/5 px-3 py-2.5">
                      <Link
                        href={viewAllHref}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-[13px] font-bold text-primary transition-colors hover:bg-primary/10"
                      >
                        <span className="inline-flex items-center gap-2">
                          <SearchIcon className="h-3.5 w-3.5" />
                          Xem tất cả kết quả cho &ldquo;{debouncedQuery}&rdquo;
                        </span>
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </PopoverContent>
                </div>
              </Popover>
            </div>

          </div>
        </div>

        {/* Brand strip */}
        <div className="relative z-10 w-full xl:max-w-none mx-auto pb-2 sm:pb-4 lg:pb-12">
          <div className="overflow-hidden w-full [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] sm:[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="flex w-max gap-8 sm:gap-14 lg:gap-20 whitespace-nowrap animate-marquee">
              {[...SUBJECTS, ...SUBJECTS].map((subject, i) => (
                <div
                  key={`${subject}-${i}`}
                  className="flex h-10 sm:h-14 lg:h-16 items-center text-lg sm:text-2xl lg:text-3xl font-extrabold text-muted-foreground/50 hover:text-muted-foreground/80 font-sans select-none shrink-0 uppercase tracking-[0.14em] sm:tracking-[0.18em] transition-colors"
                >
                  {subject}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

function TeacherResultRow({ teacher, onClick }: { teacher: User; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full cursor-pointer items-start gap-2.5 sm:gap-3 rounded-2xl border border-transparent px-2.5 py-2.5 sm:px-3 text-left transition-all hover:border-primary/20 hover:bg-white/60 dark:hover:bg-white/10"
    >
      <Avatar src={teacher.avatar || undefined} alt={teacher.name} size="md" className="rounded-full shrink-0" />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-[13px] sm:text-[14px] font-bold text-foreground group-hover:text-primary">
            {teacher.name}
          </span>
          <Badge variant="secondary" className="text-[10px]">Giáo viên</Badge>
        </div>
        <p className="m-0 line-clamp-1 text-[11px] sm:text-[12px] font-medium text-muted-foreground">{teacher.email}</p>
      </div>
    </button>
  );
}

function ClassroomResultRow({ classroom, onClick }: { classroom: Classroom; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full cursor-pointer items-start gap-2.5 sm:gap-3 rounded-2xl border border-transparent px-2.5 py-2.5 sm:px-3 text-left transition-all hover:border-primary/20 hover:bg-white/60 dark:hover:bg-white/10"
    >
      <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="line-clamp-1 text-[13px] sm:text-[14px] font-bold text-foreground group-hover:text-primary">
            {classroom.name}
          </span>
          <Badge variant="secondary" className="text-[10px]">{classroom.code}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 text-[11px] sm:text-[12px] text-muted-foreground">
          <span className="font-semibold text-primary truncate max-w-full">Sĩ số tối đa: {classroom.capacity}</span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3 shrink-0" />
            <span className="truncate">{classroom.active ? "Đang mở" : "Đã đóng"}</span>
          </span>
        </div>
      </div>
    </button>
  );
}