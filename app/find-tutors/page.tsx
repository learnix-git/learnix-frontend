"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, X, Filter, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { toast } from "sonner";
import { getPosts } from "@/lib/api/post";
import { getSubjects } from "@/lib/api/subject";
import type { Subject, Level, Mode, Unit, PostListParams } from "@/lib/api/types";
import { Cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Checkbox";
import { Slider } from "@/components/ui/Slider";
import { Empty } from "@/components/ui/Empty";
import { BreadcrumbComponent } from "@/components/ui/Breadcrumb";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/Select";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/Pagination";
import { TutorCard, TutorCardSkeleton } from "@/components/tutor/TutorCard";
import type { Post } from "@/lib/api/types";

// Hằng số
const ITEMS_PER_PAGE = 12;
const PRICE_MIN = 0;
const PRICE_MAX = 2_000_000;
const PRICE_STEP = 50_000;

const LEVEL_OPTIONS: { label: string; value: Level }[] = [
    { label: "Tiểu học", value: "PRIMARY" },
    { label: "Trung học cơ sở", value: "MIDDLE" },
    { label: "Trung học phổ thông", value: "HIGH" },
];

const MODE_OPTIONS: { label: string; value: Mode }[] = [
    { label: "Online", value: "ONLINE" },
    { label: "Offline", value: "OFFLINE" },
];

const UNIT_OPTIONS: { label: string; value: Unit }[] = [
    { label: "Theo buổi", value: "PER_SESSION" },
    { label: "Theo tháng", value: "PER_MONTH" },
];



const SORT_OPTIONS = [
    { label: "Mới nhất", value: "newest" },
    { label: "Cũ nhất", value: "oldest" },
    { label: "Đánh giá cao nhất", value: "rating-high" },
    { label: "Đánh giá thấp nhất", value: "rating-low" },
    { label: "Giá cao nhất", value: "price-high" },
    { label: "Giá thấp nhất", value: "price-low" },
];

interface Province {
    code: number;
    name: string;
}

// Skeleton môn học trong sidebar
function SubjectSkeleton() {
    const widths = ["w-20", "w-28", "w-16", "w-24", "w-32", "w-20", "w-28", "w-16"];
    return (
        <div className="flex flex-wrap gap-1.5 animate-pulse">
            {widths.map((w, i) => (
                <div key={i} className={Cn("h-[30px] bg-slate-200 dark:bg-white/10 rounded-lg", w)} />
            ))}
        </div>
    );
}

// Component độc lập cho thanh học phí để không re-render toàn trang khi kéo
function PriceFilter({
    initialValue,
    onCommit
}: {
    initialValue: number;
    onCommit: (val: number) => void;
}) {
    const [val, setVal] = useState(initialValue);

    useEffect(() => {
        setVal(initialValue);
    }, [initialValue]);

    return (
        <div className="space-y-3 px-1">
            <input
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                value={val}
                onChange={(e) => setVal(Number(e.target.value))}
                onMouseUp={(e) => onCommit(val)}
                onTouchEnd={(e) => onCommit(val)}
                className="w-full accent-primary h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>0 ₫</span>
                <span className="text-primary bg-primary/10 px-2 py-0.5 rounded font-extrabold">
                    {val.toLocaleString("vi-VN")} ₫
                </span>
            </div>
            <input
                type="text"
                inputMode="numeric"
                value={val.toLocaleString("vi-VN")}
                onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    const num = raw ? Math.min(Number(raw), PRICE_MAX) : PRICE_MIN;
                    setVal(num);
                }}
                onBlur={() => onCommit(val)}
                onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                className="w-full h-9 rounded-xl border border-slate-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
            />
        </div>
    );
}

export default function FindTutorsPage() {
    // Filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
    const [selectedLevels, setSelectedLevels] = useState<Level[]>([]);
    const [selectedModes, setSelectedModes] = useState<Mode[]>([]);
    const [selectedUnit, setSelectedUnit] = useState<Unit | "">("");
    const [localMaxPrice, setLocalMaxPrice] = useState(PRICE_MAX);
    const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
    const [selectedCity, setSelectedCity] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [subjectSearch, setSubjectSearch] = useState("");
    const [showAllSubjects, setShowAllSubjects] = useState(false);

    // Data state
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [subjectsLoading, setSubjectsLoading] = useState(true);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

    const hasMaxPriceFilter = priceRange[1] < PRICE_MAX;
    const hasActiveFilters =
        selectedSubjects.length > 0 ||
        selectedLevels.length > 0 ||
        selectedModes.length > 0 ||
        selectedUnit !== "" ||
        hasMaxPriceFilter ||
        selectedCity !== "" ||
        searchQuery.trim() !== "";

    // Lấy danh sách môn học
    useEffect(() => {
        getSubjects()
            .then((res) => {
                if (res.code === 200 && res.data)
                    setSubjects(Array.isArray(res.data) ? res.data : (res.data as any)?.items ?? []);
            })
            .catch(console.error)
            .finally(() => setSubjectsLoading(false));
    }, []);

    // Lấy danh sách tỉnh thành từ API provinces
    useEffect(() => {
        fetch("https://provinces.open-api.vn/api/p/")
            .then((r) => r.json())
            .then(setProvinces)
            .catch(console.error);
    }, []);

    // Gọi API danh sách bài đăng gia sư
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const params: PostListParams & { sort?: string } = {
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            };
            if (selectedSubjects.length > 0) params.topic = selectedSubjects[0].id;
            if (selectedLevels.length === 1) params.level = selectedLevels[0];
            if (selectedModes.length === 1) params.mode = selectedModes[0];
            if (selectedCity) params.city = selectedCity;
            if (hasMaxPriceFilter) params.maxPrice = priceRange[1];
            if (selectedUnit) params.unit = selectedUnit;
            if (sortBy !== "newest") params.sort = sortBy;

            const res = await getPosts(params);
            if (res.code === 200 && res.data) {
                const data = res.data as any;
                setPosts(data.items ?? []);
                setTotal(data.total ?? 0);
                setTotalPages(data.totalPages ?? 0);
            }
        } catch {
            toast.error("Không thể tải danh sách gia sư");
        } finally {
            setLoading(false);
        }
    }, [currentPage, selectedSubjects, selectedLevels, selectedModes, selectedCity, priceRange, selectedUnit, hasMaxPriceFilter, sortBy]);

    // Debounce khi search thay đổi
    useEffect(() => {
        const t = setTimeout(fetchPosts, searchQuery ? 400 : 0);
        return () => clearTimeout(t);
    }, [fetchPosts, searchQuery]);

    const clearAllFilters = () => {
        setSearchQuery("");
        setSelectedSubjects([]);
        setSelectedLevels([]);
        setSelectedModes([]);
        setSelectedUnit("");
        setLocalMaxPrice(PRICE_MAX);
        setPriceRange([PRICE_MIN, PRICE_MAX]);
        setSortBy("newest");
        setSelectedCity("");
        setCurrentPage(1);
    };

    // Toggle môn học
    const toggleSubject = (s: Subject) => {
        setSelectedSubjects((prev) =>
            prev.some((x) => x.id === s.id) ? prev.filter((x) => x.id !== s.id) : [...prev, s]
        );
        setCurrentPage(1);
    };

    // Toggle cấp học
    const toggleLevel = (l: Level) => {
        setSelectedLevels((prev) =>
            prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]
        );
        setCurrentPage(1);
    };

    // Toggle hình thức
    const toggleMode = (m: Mode) => {
        setSelectedModes((prev) =>
            prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
        );
        setCurrentPage(1);
    };

    // Commit giá tối đa
    const commitMaxPrice = (value = localMaxPrice) => {
        const next = Math.min(Math.max(value, PRICE_MIN), PRICE_MAX);
        setLocalMaxPrice(next);
        setPriceRange([PRICE_MIN, next]);
        setCurrentPage(1);
    };

    // Lọc môn học theo từ khóa tìm kiếm
    const filteredSubjects = useMemo(() => {
        if (!subjectSearch) return subjects;
        return subjects.filter((s) => s.name.toLowerCase().includes(subjectSearch.toLowerCase()));
    }, [subjects, subjectSearch]);

    const displayedSubjects = useMemo(() => {
        if (showAllSubjects || subjectSearch) return filteredSubjects;
        return filteredSubjects.slice(0, 6);
    }, [filteredSubjects, showAllSubjects, subjectSearch]);

    // Danh sách chip filter đang active
    const activeChips = [
        ...selectedSubjects.map((s) => ({
            label: `Môn: ${s.name}`,
            onRemove: () => { setSelectedSubjects((p) => p.filter((x) => x.id !== s.id)); setCurrentPage(1); },
        })),
        ...selectedLevels.map((l) => ({
            label: LEVEL_OPTIONS.find((o) => o.value === l)?.label ?? l,
            onRemove: () => { setSelectedLevels((p) => p.filter((x) => x !== l)); setCurrentPage(1); },
        })),
        ...selectedModes.map((m) => ({
            label: m === "ONLINE" ? "Online" : "Offline",
            onRemove: () => { setSelectedModes((p) => p.filter((x) => x !== m)); setCurrentPage(1); },
        })),
        selectedUnit !== "" && {
            label: UNIT_OPTIONS.find((u) => u.value === selectedUnit)?.label ?? "",
            onRemove: () => { setSelectedUnit(""); setCurrentPage(1); },
        },
        hasMaxPriceFilter && {
            label: `≤ ${localMaxPrice.toLocaleString("vi-VN")} ₫`,
            onRemove: () => { setLocalMaxPrice(PRICE_MAX); setPriceRange([PRICE_MIN, PRICE_MAX]); setCurrentPage(1); },
        },
        selectedCity && {
            label: selectedCity,
            onRemove: () => { setSelectedCity(""); setCurrentPage(1); },
        },
    ].filter(Boolean) as { label: string; onRemove: () => void }[];

    // Nội dung sidebar bộ lọc
    const FilterContent = () => (
        <div className="space-y-6">

            {/* Môn học */}
            <div className="pb-5 border-b border-slate-100 dark:border-white/5">
                <h3 className="text-xs uppercase tracking-[0.2em] font-black text-slate-400 dark:text-slate-500 mb-3 select-none">
                    Môn học
                </h3>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Tìm môn học..."
                        value={subjectSearch}
                        onChange={(e) => setSubjectSearch(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-[13px] text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/15 transition-all"
                    />
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                    {subjectsLoading ? <SubjectSkeleton /> : (
                        <>
                            {displayedSubjects.map((s) => {
                                const on = selectedSubjects.some((x) => x.id === s.id);
                                return (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => toggleSubject(s)}
                                        className={Cn(
                                            "rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border",
                                            on
                                                ? "bg-primary text-white border-transparent shadow-sm"
                                                : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/8 text-slate-600 dark:text-slate-400 hover:border-primary/40 hover:text-primary"
                                        )}
                                    >
                                        {s.name}
                                    </button>
                                );
                            })}
                        </>
                    )}
                </div>
                {!subjectsLoading && !subjectSearch && filteredSubjects.length > 6 && (
                    <div className="mt-3 flex justify-start">
                        <button
                            type="button"
                            onClick={() => setShowAllSubjects(!showAllSubjects)}
                            className="flex items-center gap-1 text-[11px] font-bold text-primary tracking-wider uppercase underline underline-offset-4 hover:opacity-80 transition-opacity"
                        >
                            {showAllSubjects ? "Thu gọn" : "Xem thêm"} 
                            {showAllSubjects ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                    </div>
                )}
            </div>

            {/* Cấp học */}
            <div className="pb-5 border-b border-slate-100 dark:border-white/5">
                <h3 className="text-xs uppercase tracking-[0.2em] font-black text-slate-400 dark:text-slate-500 mb-3 select-none">
                    Cấp học
                </h3>
                <div className="space-y-0.5">
                    {LEVEL_OPTIONS.map((opt) => {
                        const on = selectedLevels.includes(opt.value);
                        return (
                            <label key={opt.value} className={Cn("group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all", on ? "bg-primary/8" : "hover:bg-slate-50 dark:hover:bg-white/5")}>
                                <Checkbox
                                    checked={on}
                                    onCheckedChange={() => toggleLevel(opt.value)}
                                    className={on ? "border-primary bg-primary" : "border-slate-300 dark:border-white/10"}
                                />
                                <span className={Cn("text-sm flex-1 font-medium transition-colors", on ? "text-primary font-semibold" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white")}>
                                    {opt.label}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Hình thức dạy */}
            <div className="pb-5 border-b border-slate-100 dark:border-white/5">
                <h3 className="text-xs uppercase tracking-[0.2em] font-black text-slate-400 dark:text-slate-500 mb-3 select-none">
                    Hình thức
                </h3>
                <div className="flex gap-2">
                    {MODE_OPTIONS.map((opt) => {
                        const on = selectedModes.includes(opt.value);
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => toggleMode(opt.value)}
                                className={Cn(
                                    "flex-1 rounded-xl py-2 text-xs font-bold border transition-all",
                                    on
                                        ? "bg-primary text-white border-transparent shadow-sm shadow-primary/20"
                                        : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 hover:border-primary/40 hover:text-primary"
                                )}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Học phí */}
            <div className="pb-5 border-b border-slate-100 dark:border-white/5">
                <h3 className="text-xs uppercase tracking-[0.2em] font-black text-slate-400 dark:text-slate-500 mb-3 select-none">
                    Học phí
                </h3>
                <PriceFilter
                    initialValue={localMaxPrice}
                    onCommit={(val) => {
                        setLocalMaxPrice(val);
                        setPriceRange([PRICE_MIN, val]);
                        setCurrentPage(1);
                    }}
                />

                {/* Đơn vị tính */}
                <h3 className="text-xs uppercase tracking-[0.2em] font-black text-slate-400 dark:text-slate-500 mt-5 mb-3 select-none">
                    Đơn vị
                </h3>
                <div className="flex gap-2">
                    {UNIT_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => { setSelectedUnit((p) => p === opt.value ? "" : opt.value); setCurrentPage(1); }}
                            className={Cn(
                                "flex-1 rounded-xl py-2 text-xs font-bold border transition-all",
                                selectedUnit === opt.value
                                    ? "bg-primary text-white border-transparent shadow-sm shadow-primary/20"
                                    : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 hover:border-primary/40 hover:text-primary"
                            )}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sidebar: Dropdown địa điểm */}
            <div>
                <h3 className="text-xs uppercase tracking-[0.2em] font-black text-slate-400 dark:text-slate-500 mb-3 select-none">
                    Địa điểm
                </h3>
                <div className="space-y-2.5">
                    <Select
                        value={selectedCity || "all"}
                        onValueChange={(v) => { setSelectedCity(v && v !== "all" ? v : ""); setCurrentPage(1); }}
                        items={[
                            { value: "all", label: "Tất cả tỉnh thành" },
                            ...provinces.map((p) => ({ value: p.name, label: p.name }))
                        ]}
                    >
                        <SelectTrigger className="w-full h-10 rounded-xl border border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-white/5 text-[13px] text-slate-700 dark:text-slate-300 focus:border-primary/50 focus:ring-1 focus:ring-primary/15">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mr-1.5" />
                            <SelectValue placeholder="Tất cả tỉnh thành" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border border-white/50 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl max-h-[260px] overflow-y-auto">
                            <SelectItem value="all">Tất cả tỉnh thành</SelectItem>
                            {provinces.map((p) => (
                                <SelectItem key={p.code} value={p.name}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen transition-colors duration-300">

            {/* Breadcrumb */}
            <div className="bg-white/40 dark:bg-slate-950/40 backdrop-blur-md border-b border-white/60 dark:border-white/5">
                <div className="max-w-[1280px] mx-auto px-4 py-3.5">
                    <BreadcrumbComponent
                        pathList={[
                            { name: "Trang chủ", href: "/" },
                            { name: "Tìm gia sư", href: "/find-tutors" },
                        ]}
                    />
                </div>
            </div>

            {/* Search bar */}
            <div className="bg-transparent">
                <div className="max-w-[1280px] mx-auto px-4 py-4">
                    <div className="flex flex-col sm:flex-row gap-2.5">

                        {/* Từ khóa */}
                        <div className="flex-1 flex items-center gap-3 px-4 h-11 bg-white dark:bg-white/8 border border-slate-200/70 dark:border-white/10 rounded-2xl shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/25 focus-within:border-primary/40">
                            <Search className="w-4 h-4 text-slate-400 shrink-0" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                placeholder="Tìm gia sư tại Learnix"
                                className="flex-1 min-w-0 border-none outline-none bg-transparent text-[13px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
                                    className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-400 hover:bg-slate-200 shrink-0 transition-all"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {/* Dropdown địa điểm trên search bar */}
                        <Select
                            value={selectedCity || "all"}
                            onValueChange={(v) => { setSelectedCity(v && v !== "all" ? v : ""); setCurrentPage(1); }}
                            items={[
                                { value: "all", label: "Tất cả tỉnh thành" },
                                ...provinces.map((p) => ({ value: p.name, label: p.name }))
                            ]}
                        >
                            <SelectTrigger className="hidden sm:flex h-11 min-w-[160px] max-w-[200px] px-4 rounded-2xl bg-white dark:bg-white/8 border border-slate-200/70 dark:border-white/10 shadow-sm text-[13px] font-medium text-slate-700 dark:text-slate-300 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 gap-2">
                                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                                <SelectValue placeholder="Tỉnh thành" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border border-white/50 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl max-h-[280px] overflow-y-auto">
                                <SelectItem value="all">Tất cả tỉnh thành</SelectItem>
                                {provinces.map((p) => (
                                    <SelectItem key={p.code} value={p.name}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-[1280px] mx-auto px-4">

                {/* Results bar */}
                <div className="flex items-center justify-between gap-3 py-3 flex-wrap">

                    {/* Count + chips */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[15px] font-black text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
                                Tìm thấy <span className="text-primary">{total}</span> gia sư tại Learnix
                            </span>

                            {activeChips.map((chip, i) => (
                                <span key={i} onClick={chip.onRemove} className="cursor-pointer shrink-0">
                                    <Badge variant="secondary" className="text-[12px] gap-1 font-semibold">
                                        {chip.label}
                                        <X className="w-2.5 h-2.5 opacity-70" />
                                    </Badge>
                                </span>
                            ))}

                            {activeChips.length > 1 && (
                                <button
                                    onClick={clearAllFilters}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-lg text-[11px] font-bold cursor-pointer transition-all hover:bg-rose-100"
                                >
                                    Xóa tất cả <X className="w-2.5 h-2.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Sort + mobile filter */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex lg:hidden items-center gap-1.5 px-3.5 h-9 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer hover:border-primary transition-all shadow-sm"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            Lọc
                            {activeChips.length > 0 && (
                                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-white">
                                    {activeChips.length}
                                </span>
                            )}
                        </button>

                        <Select
                            value={sortBy}
                            onValueChange={(v) => { if (v) { setSortBy(v); setCurrentPage(1); } }}
                            items={SORT_OPTIONS}
                        >
                            <SelectTrigger className="w-[200px] h-9 px-3 rounded-xl bg-white dark:bg-slate-900/90 border-slate-200 dark:border-white/10 text-[12px] font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
                                <SelectValue placeholder="Sắp xếp theo">
                                    {SORT_OPTIONS.find((o) => o.value === sortBy)?.label || "Sắp xếp theo"}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 dark:border-slate-800 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-1">
                                {SORT_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value} className="rounded-lg cursor-pointer text-[12px] font-medium focus:bg-primary/8 focus:text-primary transition-colors my-0.5">
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Sidebar + listing layout */}
                <div className="flex gap-5 pb-12">

                    {/* Desktop sidebar */}
                    <aside className="w-[300px] shrink-0 sticky top-[90px] h-[calc(100vh-110px)] max-h-[calc(100vh-110px)] p-5 bg-white/60 dark:bg-white/4 backdrop-blur-xl border border-slate-200/60 dark:border-white/8 rounded-[1.75rem] shadow-sm max-lg:hidden flex flex-col">
                        <div className="min-h-0 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                            <FilterContent />
                        </div>
                        {hasActiveFilters && (
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 shrink-0">
                                <button
                                    type="button"
                                    onClick={clearAllFilters}
                                    className="flex items-center justify-center gap-1.5 w-full py-2.5 px-4 border border-dashed border-rose-200 dark:border-rose-900/50 rounded-xl bg-rose-50/50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 text-[11px] font-bold tracking-wider cursor-pointer hover:bg-rose-100/60 transition-all"
                                >
                                    <X className="w-3 h-3" />
                                    XÓA BỘ LỌC
                                </button>
                            </div>
                        )}
                    </aside>

                    {/* Mobile filter drawer */}
                    {showFilters && (
                        <div
                            className="fixed inset-0 bg-black/50 z-[999] lg:hidden backdrop-blur-sm"
                            onClick={() => setShowFilters(false)}
                        >
                            <div
                                className="fixed right-0 top-0 bottom-0 w-[80vw] sm:w-[340px] bg-white dark:bg-slate-950 overflow-y-auto z-[1000] rounded-l-3xl shadow-2xl flex flex-col"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Drawer header */}
                                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5 sticky top-0 bg-white dark:bg-slate-950 z-[1]">
                                    <h2 className="text-sm font-black text-slate-900 dark:text-white">Bộ lọc</h2>
                                    <button
                                        onClick={() => setShowFilters(false)}
                                        className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex-1 p-5 overflow-y-auto">
                                    <FilterContent />
                                </div>
                                {hasActiveFilters && (
                                    <div className="p-4 border-t border-slate-100 dark:border-white/5 sticky bottom-0 bg-white dark:bg-slate-950">
                                        <button
                                            onClick={() => { clearAllFilters(); setShowFilters(false); }}
                                            className="flex items-center justify-center gap-1.5 w-full py-2.5 border border-dashed border-rose-200 dark:border-rose-900/50 rounded-xl bg-rose-50/50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 text-[11px] font-bold tracking-wider cursor-pointer transition-all"
                                        >
                                            <X className="w-3 h-3" />
                                            XÓA BỘ LỌC
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Listing column */}
                    <div className="flex-1 min-w-0">
                        {loading ? (
                            <div className="flex flex-col gap-4">
                                {[...Array(4)].map((_, i) => <TutorCardSkeleton key={i} />)}
                            </div>
                        ) : posts.length === 0 ? (
                            <Empty
                                variant="search"
                                icon={<Search className="w-8 h-8 text-primary" />}
                                title="Không tìm thấy gia sư phù hợp"
                                description="Hãy thử điều chỉnh bộ lọc hoặc mở rộng tiêu chí tìm kiếm nhé!"
                                action={
                                    hasActiveFilters ? (
                                        <button
                                            onClick={clearAllFilters}
                                            className="inline-flex items-center gap-2 py-2.5 px-6 border border-dashed border-rose-300 dark:border-rose-900/50 rounded-2xl text-rose-600 dark:text-rose-400 text-[11px] font-bold tracking-widest cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                            XÓA BỘ LỌC
                                        </button>
                                    ) : undefined
                                }
                            />
                        ) : (
                            <div className="flex flex-col gap-4">
                                {posts.map((post) => <TutorCard key={post.id} post={post} />)}
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && totalPages > 1 && (
                            <Pagination className="mt-8">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (currentPage > 1) { setCurrentPage(currentPage - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
                                            }}
                                            className={currentPage === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                        <PaginationItem key={p}>
                                            <PaginationLink
                                                href="#"
                                                isActive={p === currentPage}
                                                onClick={(e) => { e.preventDefault(); setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                                                className="cursor-pointer text-xs font-bold"
                                            >
                                                {p}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (currentPage < totalPages) { setCurrentPage(currentPage + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
                                            }}
                                            className={currentPage === totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
