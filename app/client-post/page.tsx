"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, BookOpen, FileText, MapPin, Wallet, Clock, Shield, Star, Users, Lightbulb, CheckCircle2 } from "lucide-react";
import { createRequest } from "@/lib/api/request";
import { getSubjects } from "@/lib/api/subject";
import { Subject, Mode, Venue, Slot, Unit } from "@/lib/api/types";
import { validateRequestForm } from "@/lib/validations/request";
import { Cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RequestInfo } from "@/components/request/RequestInfo";
import { RequestMode } from "@/components/request/RequestMode";
import { RequestBudget } from "@/components/request/RequestBudget";
import { RequestTime } from "@/components/request/RequestTime";
import { RequestDesc } from "@/components/request/RequestDesc";

// Types
export interface TopicEntry {
    key: string;
    subjectId: string | null;
    label: string;
}

export interface RequestFormData {
    title: string;
    topics: TopicEntry[];
    grades: number[];
    mode: Mode;
    city: string;
    ward: string;
    street: string;
    from: number;
    to: number;
    unit: Unit;
    count: number;
    venue: Venue;
    flexible: boolean;
    days: number[];
    slot: Slot | null;
    startTime: string;
    endTime: string;
    desc: string;
}

export interface AdminUnit {
    code: number;
    name: string;
}

// UI components
export function GetInputCls(hasError?: boolean, isTextarea = false) {
    return Cn(
        "w-full rounded-2xl border bg-white/50 dark:bg-white/5 px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all backdrop-blur-md",
        isTextarea ? "min-h-[140px] resize-y py-4" : "h-12",
        hasError ? "border-rose-500/40 focus:border-rose-500 focus:ring-rose-500/20" : "border-white/60 dark:border-white/10"
    );
}

export function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <p className="mt-1.5 flex items-center gap-1 text-[12px] text-rose-500">
            <AlertCircle className="h-3 w-3 shrink-0" /> {message}
        </p>
    );
}

// Section card component
export function SectionCard({ index, icon, title, id, children }: {
    index: number;
    icon: React.ReactNode;
    title: string;
    id?: string;
    children: React.ReactNode;
}) {
    return (
        <Card className="space-y-5" id={id}>
            <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-black text-sm">
                    {index}
                </div>
                <div className="flex items-center gap-2 text-foreground font-bold text-base">
                    {icon}
                    {title}
                </div>
            </div>
            {children}
        </Card>
    );
}

// Hero data
const HERO_TIPS = [
    { icon: Shield, text: "Gia sư xác minh danh tính & bằng cấp" },
    { icon: Star, text: "Đánh giá trung thực từ học sinh thực" },
    { icon: Users, text: "Miễn phí đăng bài, không phí môi giới" },
];

export default function ClientPostPage() {
    const router = useRouter();

    // State form dữ liệu yêu cầu
    const [form, setForm] = useState<RequestFormData>({
        title: "", topics: [], grades: [],
        mode: "ONLINE", city: "", ward: "", street: "",
        from: 0, to: 0, unit: "PER_SESSION", count: 2, desc: "",
        venue: "STUDENT", flexible: false, days: [], slot: null, startTime: "", endTime: ""
    });

    // Trạng thái lỗi và trạng thái submit
    const [errors, setErrors] = useState<Partial<Record<keyof RequestFormData, string>>>({});
    const [submitting, setSubmitting] = useState(false);

    // Trạng thái danh sách môn học
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [subjectsLoading, setSubjectsLoading] = useState(true);
    const [subjectSearch, setSubjectSearch] = useState("");

    // Trạng thái danh sách địa giới hành chính
    const [provinces, setProvinces] = useState<AdminUnit[]>([]);
    const [provincesLoading, setProvincesLoading] = useState(true);
    const [provinceCode, setProvinceCode] = useState<number | null>(null);
    const [wards, setWards] = useState<AdminUnit[]>([]);
    const [wardsLoading, setWardsLoading] = useState(false);

    // Hàm cập nhật 1 trường dữ liệu trong form
    const HandleUpdate = <K extends keyof RequestFormData>(field: K, value: RequestFormData[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    // Hàm chọn ca học
    const HandleSlotChange = (slot: Slot) => HandleUpdate("slot", slot);

    // Hàm chọn/bỏ chọn thứ trong tuần
    const ToggleDay = (day: number) => {
        const current = form.days;
        const isSelected = current.includes(day);
        const next = isSelected ? current.filter((d) => d !== day) : [...current, day].sort((a, b) => a - b);
        HandleUpdate("days", next);
    };

    // Gọi API lấy danh sách môn học
    useEffect(() => {
        getSubjects()
            .then((res) => {
                if (res.code === 200 && res.data)
                    setSubjects(Array.isArray(res.data) ? res.data : (res.data as any)?.items ?? []);
            })
            .catch(console.error)
            .finally(() => setSubjectsLoading(false));
    }, []);

    // Lọc danh sách môn học theo từ khóa tìm kiếm
    const filteredSubjects = useMemo(() => {
        const chosenIds = form.topics.map((t) => t.subjectId).filter(Boolean);
        return (subjects ?? [])
            .filter((s) => !chosenIds.includes(s.id))
            .filter((s) => s.name.toLowerCase().includes(subjectSearch.toLowerCase()));
    }, [subjects, form.topics, subjectSearch]);

    // Lấy danh sách Tỉnh/Thành
    useEffect(() => {
        fetch("https://provinces.open-api.vn/api/p/")
            .then((r) => r.json()).then(setProvinces)
            .catch(console.error).finally(() => setProvincesLoading(false));
    }, []);

    // Lấy danh sách Quận/Huyện dựa theo Tỉnh/Thành đã chọn
    useEffect(() => {
        if (!provinceCode) { setWards([]); return; }
        setWardsLoading(true);
        fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
            .then((r) => r.json()).then((d) => setWards(d.districts || []))
            .catch(console.error).finally(() => setWardsLoading(false));
    }, [provinceCode]);

    // Xử lý khi chọn Tỉnh/Thành phố mới
    const HandleProvinceChange = (codeStr: string | null) => {
        if (!codeStr) return;
        const code = parseInt(codeStr);
        setProvinceCode(code);
        HandleUpdate("city", provinces.find((p) => p.code === code)?.name ?? "");
        HandleUpdate("ward", "");
    };

    // Xử lý khi chọn Quận/Huyện mới
    const HandleWardChange = (codeStr: string | null) => {
        if (!codeStr) return;
        HandleUpdate("ward", wards.find((w) => w.code === parseInt(codeStr))?.name ?? "");
    };

    // Xử lý gửi form: validate, gọi API tạo yêu cầu, điều hướng khi thành công
    const HandleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Kiểm tra dữ liệu trước khi gửi
        const errs = validateRequestForm(form);
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            toast.error("Vui lòng kiểm tra lại thông tin!");
            const firstKey = Object.keys(errs)[0];
            setTimeout(() => document.getElementById(firstKey)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
            return;
        }

        setSubmitting(true);
        try {
            const res = await createRequest({
                title: form.title.trim(), desc: form.desc.trim(),
                topics: form.topics.map(t => ({
                    subject: t.subjectId || undefined,
                    custom: !t.subjectId ? t.label : undefined,
                })),
                level: "ALL" as const, grades: form.grades, mode: form.mode,
                city: form.mode === "OFFLINE" && form.venue === "STUDENT" ? form.city || undefined : undefined,
                ward: form.mode === "OFFLINE" && form.venue === "STUDENT" ? form.ward || undefined : undefined,
                street: form.mode === "OFFLINE" && form.venue === "STUDENT" ? form.street || undefined : undefined,
                from: form.from, to: form.to, unit: form.unit, count: form.count,
                venue: form.mode === "OFFLINE" ? form.venue : undefined,
                flexible: form.flexible,
                days: form.days,
                slot: form.slot || undefined,
                startTime: form.startTime || undefined,
                endTime: form.endTime || undefined,
            });

            if (res.code === 201 || res.code === 200) {
                toast.success("Đăng bài tìm gia sư thành công!");
                router.push("/");
            } else {
                toast.error(res.message || "Đăng bài thất bại.");
            }
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Đăng bài thất bại.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-64px)]">
            {/* Left panel hero */}
            <aside className="hidden lg:flex lg:w-[400px] xl:w-[460px] flex-col sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950 border-r border-white/5 p-10 xl:p-12">
                {/* Glow effects */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary/25 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-0 right-0 w-72 h-72 bg-sky-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "1.5s" }} />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_20%,transparent_100%)]" />
                </div>
                <div className="relative z-10 flex flex-col h-full gap-8">
                    {/* Badge and headline */}
                    <div>
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/25 text-primary text-[11px] font-bold tracking-widest uppercase mb-5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Miễn phí đăng bài
                        </span>
                        <h1 className="text-[2rem] xl:text-[2.2rem] font-black text-white leading-[1.15] tracking-tight mb-3">
                            Tìm đúng gia sư,<br />
                            <span className="text-primary">học đúng cách.</span>
                        </h1>
                        <p className="text-slate-400 text-[13px] leading-relaxed">
                            Đăng yêu cầu trong 2 phút — gia sư uy tín sẽ chủ động liên hệ với bạn.
                        </p>
                    </div>
                    {/* Illustration */}
                    <div className="flex-1 flex items-center justify-center relative min-h-[300px]">
                        <Image src="/images/request-illustration.svg" alt="Request Illustration" fill className="object-contain drop-shadow-2xl animate-float" priority />
                    </div>
                    {/* Commitment tips */}
                    <div className="space-y-2.5">
                        {HERO_TIPS.map(({ icon: Icon, text }) => (
                            <div key={text} className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-xl bg-primary/15 border border-primary/15 flex items-center justify-center shrink-0">
                                    <Icon className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <p className="text-[12px] text-slate-400">{text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Right panel form */}
            <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#09090b] pb-24">
                <form id="client-post-form" onSubmit={HandleSubmit} className="px-6 py-10 sm:px-10 lg:px-14 xl:px-16 max-w-4xl mx-auto space-y-6">
                    {/* Page title mobile only */}
                    <div className="lg:hidden">
                        <h1 className="text-2xl font-black text-foreground tracking-tight">Tìm gia sư phù hợp</h1>
                        <p className="text-sm text-muted-foreground mt-1">Điền thông tin để gia sư liên hệ với bạn</p>
                    </div>

                    {/* Subject info */}
                    <SectionCard index={1} icon={<BookOpen className="h-4 w-4 text-primary" />} title="Thông tin chung" id="title">
                        <RequestInfo form={form} errors={errors} handleUpdate={HandleUpdate} subjectsLoading={subjectsLoading} subjectSearch={subjectSearch} setSubjectSearch={setSubjectSearch} filteredSubjects={filteredSubjects} />
                    </SectionCard>

                    {/* Request description */}
                    <SectionCard index={2} icon={<FileText className="h-4 w-4 text-primary" />} title="Mô tả chi tiết" id="desc">
                        <RequestDesc form={form} errors={errors} handleUpdate={HandleUpdate} />
                    </SectionCard>

                    {/* Mode and location */}
                    <SectionCard index={3} icon={<MapPin className="h-4 w-4 text-primary" />} title="Hình thức" id="mode">
                        <RequestMode form={form} errors={errors} handleUpdate={HandleUpdate} provinces={provinces} provincesLoading={provincesLoading} provinceCode={provinceCode} handleProvinceChange={HandleProvinceChange} wards={wards} wardsLoading={wardsLoading} handleWardChange={HandleWardChange} />
                    </SectionCard>

                    {/* Budget */}
                    <SectionCard index={4} icon={<Wallet className="h-4 w-4 text-primary" />} title="Ngân sách" id="budget">
                        <RequestBudget form={form} errors={errors} handleUpdate={HandleUpdate} />
                    </SectionCard>

                    {/* Schedule */}
                    <SectionCard index={5} icon={<Clock className="h-4 w-4 text-primary" />} title="Lịch học" id="schedule">
                        <RequestTime form={form} errors={errors} handleUpdate={HandleUpdate} handleSlotChange={HandleSlotChange} toggleDay={ToggleDay} />
                    </SectionCard>

                    {/* Form actions */}
                    <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-white/5">
                        <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto rounded-2xl h-12 px-6 border border-white/50 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md hover:bg-white/30 dark:hover:bg-white/10 transition-all font-bold text-xs tracking-widest shadow-sm">
                            Hủy bỏ
                        </Button>
                        <Button size="lg" type="submit" loading={submitting} className="w-full sm:w-auto rounded-2xl h-12 px-8 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 font-bold text-xs tracking-widest transition-all hover:scale-[1.02]">
                            Đăng bài ngay
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    );
}