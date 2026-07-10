"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen, Clock, AlertCircle, Target, Award, Flame,
  PlayCircle, Calendar, ArrowUpRight, ChevronRight,
  GraduationCap, Zap, Video, FileText, Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Empty } from "@/components/ui/Empty";

// ============ TYPES ============
interface Classroom {
  id: string;
  name: string;
  code: string;
  teacher: string;
  totalLessons: number;
  completedLessons: number;
  status: "ongoing" | "ending" | "completed";
}

interface ScheduleItem {
  id: string;
  time: string;
  className: string;
  room: string;
  isLive?: boolean;
}

interface Assignment {
  id: string;
  title: string;
  className: string;
  dueText: string;
  urgency: "high" | "medium";
}

interface StudentStats {
  enrolledClasses: number;
  pendingAssignments: number;
  averageProgress: number;
  rewardPoints: number;
}

interface ResumeLesson {
  classroomName: string;
  lessonTitle: string;
  progress: number;
  href: string;
}

// ============ MOCK DATA ============
const MOCK_CLASSES: Classroom[] = [
  { id: "1", name: "Luyện thi THPT Quốc Gia môn Toán 2026 - Mức 8+", code: "TOAN-8PLUS", teacher: "Thầy Nguyễn Văn Hưng", totalLessons: 24, completedLessons: 16, status: "ongoing" },
  { id: "2", name: "Chuyên đề Hàm Số & Hình học Không gian Nâng cao", code: "HAMSO-NC", teacher: "Thầy Nguyễn Văn Hưng", totalLessons: 12, completedLessons: 11, status: "ending" },
  { id: "3", name: "Ngữ Pháp Tiếng Anh Trọng Tâm Kỳ Thi THPT", code: "ENG-GRAM", teacher: "Cô Trần Thị Lan", totalLessons: 18, completedLessons: 18, status: "completed" },
];

const MOCK_SCHEDULE: ScheduleItem[] = [
  { id: "1", time: "19:30 - 21:00", className: "Luyện thi THPT Toán 2026", room: "Phòng Zoom 01", isLive: true },
  { id: "2", time: "21:15 - 22:30", className: "Chuyên đề Hàm Số", room: "Google Meet" },
];

const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: "1", title: "Bài tập Hàm số ôn tập tuần 3", className: "Chuyên đề Hàm Số", dueText: "Còn 5 tiếng", urgency: "high" },
  { id: "2", title: "Đề luyện tập Hình học không gian", className: "Luyện thi THPT Toán 2026", dueText: "Ngày mai", urgency: "medium" },
];

const MOCK_STATS: StudentStats = {
  enrolledClasses: MOCK_CLASSES.length,
  pendingAssignments: MOCK_ASSIGNMENTS.length,
  averageProgress: 78,
  rewardPoints: 1240,
};

const MOCK_RESUME: ResumeLesson = {
  classroomName: "Luyện thi THPT Toán 2026",
  lessonTitle: "Bài 16: Ứng dụng đạo hàm khảo sát hàm số",
  progress: 66,
  href: "/dashboard/student/classes/1/lessons/16",
};

const STATUS_MAP: Record<Classroom["status"], { label: string; variant: "info" | "warning" | "success" }> = {
  ongoing: { label: "Đang diễn ra", variant: "info" },
  ending: { label: "Sắp kết thúc", variant: "warning" },
  completed: { label: "Đã hoàn thành", variant: "success" },
};

// ============ SMALL PARTS ============
function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10 ${className}`}>
      <div
        className="h-full rounded-full bg-primary transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function KpiCell({ label, value, icon, alert }: { label: string; value: number | string; icon?: React.ReactNode; alert?: boolean }) {
  return (
    <div
      className={`flex min-w-[140px] flex-1 items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
        alert
          ? "border-rose-500/30 bg-rose-500/10 dark:border-rose-500/20"
          : "border-slate-200/70 bg-white/55 dark:border-white/10 dark:bg-white/5"
      }`}
    >
      <div className="space-y-0.5">
        <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{label}</div>
        <div className={`text-xl font-black tabular-nums ${alert ? "text-rose-600 dark:text-rose-400" : "text-foreground"}`}>{value}</div>
      </div>
      {icon}
    </div>
  );
}

// ============ PAGE ============
export default function StudentDashboardPage() {
  const [classes] = useState<Classroom[]>(MOCK_CLASSES);
  const [schedule] = useState<ScheduleItem[]>(MOCK_SCHEDULE);
  const [assignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [stats] = useState<StudentStats>(MOCK_STATS);
  const [resume] = useState<ResumeLesson>(MOCK_RESUME);
  const [streak] = useState<number>(12);

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="max-w-[1280px] mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="mb-8 flex items-center gap-3">
          <div className="h-8 w-1.5 rounded-full bg-primary" />
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Bảng điều khiển học tập</h1>
        </div>

        <div className="space-y-6">
          {/* HERO / WELCOME CARD */}
          <Card className="!p-4 sm:!p-5 !rounded-3xl">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="primary" className="gap-2 py-1 text-[11px] uppercase tracking-[0.16em]">
                    <GraduationCap className="h-3.5 w-3.5" /> Chào mừng trở lại
                  </Badge>
                  <Badge variant="warning" className="gap-1.5 py-1 text-[11px]">
                    <Flame className="h-3.5 w-3.5" /> Chuỗi {streak} ngày học liên tiếp 🔥
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h2 className="m-0 text-2xl font-black tracking-tight text-foreground sm:text-3xl">Chào mừng trở lại, Hưng Nguyễn 👋</h2>
                  <p className="m-0 max-w-[66ch] text-[14px] leading-6 text-muted-foreground">
                    Cố lên nhé! Duy trì chuỗi ngày học để không mất phong độ, còn {stats.pendingAssignments} bài tập đang chờ bạn hoàn thành.
                  </p>
                </div>
              </div>

              <Button nativeButton={false} render={<Link href={resume.href} />} className="h-11 w-full rounded-2xl px-5 text-[13px] shadow-lg shadow-primary/20 sm:w-auto">
                <PlayCircle className="h-4 w-4" /> Học tiếp bài gần nhất
              </Button>
            </div>

            {/* Resume learning strip */}
            <div className="mt-5 rounded-2xl border border-slate-200/70 bg-white/55 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{resume.classroomName}</div>
                  <div className="truncate text-sm font-bold text-foreground">{resume.lessonTitle}</div>
                </div>
                <span className="shrink-0 text-sm font-black text-primary">{resume.progress}%</span>
              </div>
              <ProgressBar value={resume.progress} className="mt-3" />
            </div>

            <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-200/70 pt-5 dark:border-white/10">
              <KpiCell label="Lớp học đang tham gia" value={stats.enrolledClasses} icon={<BookOpen className="h-4 w-4 text-primary" />} />
              <KpiCell
                label="Bài tập cần nộp"
                value={stats.pendingAssignments}
                alert={stats.pendingAssignments > 0}
                icon={<AlertCircle className={`h-4 w-4 ${stats.pendingAssignments > 0 ? "text-rose-500" : "text-emerald-500"}`} />}
              />
              <KpiCell label="Tiến độ trung bình" value={`${stats.averageProgress}%`} icon={<Target className="h-4 w-4 text-blue-500" />} />
              <KpiCell label="Điểm thưởng tích lũy" value={stats.rewardPoints.toLocaleString("vi-VN")} icon={<Award className="h-4 w-4 text-amber-500" />} />
            </div>
          </Card>

          {/* MAIN CONTENT GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* CỘT TRÁI: LỚP HỌC CỦA TÔI */}
            <div className="xl:col-span-2 space-y-3 flex flex-col">
              <div className="flex items-center justify-between px-1">
                <h3 className="m-0 text-[13px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Lớp học của tôi</h3>
                <Link href="/dashboard/student/classes" className="flex items-center gap-1 text-[13px] font-bold text-primary hover:underline">
                  Xem tất cả <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {classes.length === 0 ? (
                <Empty
                  variant="default"
                  className="flex-1"
                  icon={<BookOpen className="h-8 w-8" />}
                  title="Bạn chưa đăng ký lớp học nào"
                  description="Khám phá kho lớp học đa dạng của Learnix và bắt đầu hành trình chinh phục mục tiêu của bạn."
                  action={
                    <Button nativeButton={false} render={<Link href="/lop-hoc" />} className="h-11 w-full rounded-2xl px-6 text-[13px] shadow-lg shadow-primary/20">
                      <Sparkles className="h-4 w-4" /> Khám phá lớp học ngay
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {classes.map((cls) => {
                    const percent = Math.round((cls.completedLessons / cls.totalLessons) * 100);
                    const statusInfo = STATUS_MAP[cls.status];
                    return (
                      <Card key={cls.id} hover className="!p-4 sm:!p-5 !rounded-3xl">
                        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_200px]">
                          <div className="min-w-0 space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                              <Badge variant="secondary" className="gap-1.5">
                                <FileText className="h-3.5 w-3.5" /> Mã lớp: {cls.code}
                              </Badge>
                            </div>

                            <h3 className="m-0 line-clamp-2 text-lg font-black leading-snug tracking-tight text-foreground sm:text-xl">
                              {cls.name}
                            </h3>

                            <p className="m-0 text-[13px] font-medium text-muted-foreground">
                              Giảng viên: <span className="font-bold text-foreground">{cls.teacher}</span>
                            </p>

                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[12px] font-bold text-muted-foreground">
                                <span>Tiến độ học tập</span>
                                <span className="text-foreground">{cls.completedLessons}/{cls.totalLessons} bài ({percent}%)</span>
                              </div>
                              <ProgressBar value={percent} />
                            </div>
                          </div>

                          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                            <div>
                              <div className="text-[12px] font-bold text-muted-foreground">Hoàn thành</div>
                              <div className="mt-1 text-2xl font-black text-foreground">{percent}%</div>
                            </div>

                            <div className="grid gap-2">
                              <Button nativeButton={false} render={<Link href={`/dashboard/student/classes/${cls.id}`} />} className="h-10 w-full rounded-xl text-[13px]">
                                Vào lớp học <ChevronRight className="h-4 w-4" />
                              </Button>
                              <Button
                                nativeButton={false}
                                variant="outline"
                                render={<Link href={`/dashboard/student/classes/${cls.id}/assignments`} />}
                                className="h-10 w-full rounded-xl text-[13px]"
                              >
                                Xem bài tập <ArrowUpRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CỘT PHẢI: LỊCH HỌC & DEADLINE */}
            <div className="space-y-4 flex flex-col">
              {/* Widget: Lịch học hôm nay */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="m-0 text-[13px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Lịch học hôm nay</h3>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>

                <Card className="!p-4 sm:!p-5 !rounded-3xl space-y-3">
                  <p className="m-0 text-[12px] font-medium text-muted-foreground">
                    {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}
                  </p>

                  {schedule.length > 0 ? (
                    <div className="space-y-3">
                      {schedule.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-slate-200/70 bg-white/55 p-4 dark:border-white/10 dark:bg-white/5 space-y-2.5">
                          <div className="flex items-center justify-between text-[12px] font-bold text-primary">
                            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {item.time}</span>
                            {item.isLive ? (
                              <Badge variant="outline" className="animate-pulse gap-1 border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                🔴 Đang live
                              </Badge>
                            ) : (
                              <Badge variant="info">Sắp diễn ra</Badge>
                            )}
                          </div>
                          <h4 className="text-sm font-bold leading-snug text-foreground">{item.className}</h4>
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Video className="h-3.5 w-3.5" /> {item.room}
                          </p>
                          <Button className="h-9 w-full rounded-xl bg-primary/10 text-xs text-primary hover:bg-primary hover:text-primary-foreground">
                            <PlayCircle className="h-4 w-4" /> Vào phòng học ngay
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty
                      variant="default"
                      className="!py-6"
                      icon={<Calendar className="h-7 w-7" />}
                      title="Không có lịch học"
                      description="Hôm nay bạn không có buổi học nào được lên lịch."
                    />
                  )}
                </Card>
              </div>

              {/* Widget: Bài tập cần nộp gấp */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="m-0 text-[13px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Bài tập cần nộp gấp</h3>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </div>

                <Card className="!p-4 sm:!p-5 !rounded-3xl space-y-3">
                  {assignments.length > 0 ? (
                    assignments.map((a) => (
                      <div key={a.id} className="rounded-2xl border border-slate-200/70 bg-white/55 p-4 dark:border-white/10 dark:bg-white/5 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="m-0 line-clamp-1 text-sm font-bold text-foreground">{a.title}</h4>
                          <Badge variant={a.urgency === "high" ? "outline" : "warning"} className={a.urgency === "high" ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0" : "shrink-0"}>
                            {a.dueText}
                          </Badge>
                        </div>
                        <p className="m-0 truncate text-xs text-muted-foreground">Lớp: {a.className}</p>
                      </div>
                    ))
                  ) : (
                    <Empty variant="default" className="!py-6" icon={<Award className="h-7 w-7" />} title="Không có bài tập nào" description="Bạn đã hoàn thành hết bài tập, tuyệt vời!" />
                  )}
                </Card>
              </div>

              {/* Widget: Góc động lực */}
              <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-400">
                  <Zap className="h-3.5 w-3.5" /> Góc động lực
                </div>
                <p className="m-0 text-xs leading-relaxed text-muted-foreground">
                  "Mỗi bài học hôm nay là một bước tiến gần hơn đến ước mơ của bạn." Cố gắng duy trì chuỗi {streak} ngày học liên tiếp nhé! 🚀
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}