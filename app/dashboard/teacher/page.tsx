"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, BookOpen, Star, Plus, Calendar, Clock,
  CheckCircle2, AlertCircle, PlayCircle, ChevronRight,
  ArrowUpRight, GraduationCap, Layers, Wallet, CalendarX,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { Empty } from "@/components/ui/Empty";

import { Classroom, Schedule } from "@/lib/api/types";
import { DashboardTeacher } from "@/lib/api/dashboard";
import { FormatMoney } from "@/lib/utils";

function KpiCell({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) {
  return (
    <div className="flex min-w-[140px] flex-1 items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-white/55 px-4 py-3 dark:border-white/10 dark:bg-white/5">
      <div className="space-y-0.5">
        <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{label}</div>
        <div className="text-xl font-black tabular-nums text-foreground">{value}</div>
      </div>
      {icon}
    </div>
  );
}

export default function TeacherDashboardPage() {
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [resClasses, resSchedule] = await Promise.all([
          DashboardTeacher.getClasses(),
          DashboardTeacher.getSchedule(),
        ]);

        if (resClasses.status === "SUCCESS" && resClasses.data) {
          setClasses(resClasses.data);
        }
        if (resSchedule.status === "SUCCESS" && resSchedule.data) {
          setSchedule(resSchedule.data);
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu Dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Tính toán KPI
  const activeCount = classes.filter((c) => c.status === "active" || c.active).length;
  const totalStudents = classes.reduce((sum, c) => sum + (c.count || 0), 0);
  const totalRevenue = classes.reduce((sum, c) => {
    const classFee = c.fee || 0;
    const studentsCount = c.count || 0;
    return sum + (classFee * studentsCount);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">Đang tải dữ liệu giảng viên...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="max-w-[1280px] mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="mb-8 flex items-center gap-3">
          <div className="h-8 w-1.5 rounded-full bg-primary" />
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Bảng điều khiển cho giáo viên</h1>
        </div>

        <div className="space-y-6">
          {/* HERO / WELCOME CARD */}
          <Card className="!p-4 sm:!p-5 !rounded-3xl">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <Badge variant="primary" className="gap-2 py-1 text-[11px] uppercase tracking-[0.16em]">
                  <GraduationCap className="h-3.5 w-3.5" /> Chào mừng trở lại 👋
                </Badge>
                <div className="space-y-2">
                  <h2 className="m-0 text-2xl font-black tracking-tight text-foreground sm:text-3xl">Mọi thứ đã sẵn sàng</h2>
                  <p className="m-0 max-w-[66ch] text-[14px] leading-6 text-muted-foreground">
                    Tiếp tục quản lý lớp học, theo dõi tiến độ học sinh và chuẩn bị cho buổi dạy tiếp theo
                  </p>
                </div>
              </div>

              <Button nativeButton={false} render={<Link href="/classrooms/create" />} className="h-11 w-full rounded-2xl px-5 text-[13px] shadow-lg shadow-primary/20 sm:w-auto">
                <Plus className="h-4 w-4" /> Tạo lớp học mới
              </Button>
            </div>

            <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-200/70 pt-5 dark:border-white/10">
              <KpiCell label="Lớp học đang hoạt động" value={activeCount} icon={<BookOpen className="h-4 w-4 text-primary" />} />
              <KpiCell label="Học viên đang theo học" value={totalStudents} icon={<Users className="h-4 w-4 text-emerald-500" />} />
              <KpiCell label="Đánh giá trung bình" value="4.9 ⭐" icon={<Star className="h-4 w-4 text-amber-500" />} />
              <KpiCell label="Thu nhập trung bình" value={FormatMoney(totalRevenue)} icon={<Wallet className="h-4 w-4 text-purple-500" />} />
            </div>
          </Card>

          {/* MAIN CONTENT GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* DANH SÁCH LỚP HỌC */}
            <div className="xl:col-span-2 space-y-3 flex flex-col">
              <div className="flex items-center justify-between px-1">
                <h3 className="m-0 text-[13px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Lớp học của bạn</h3>
                <Link href="/dashboard/teacher/classes" className="flex items-center gap-1 text-[13px] font-bold text-primary hover:underline">
                  Xem tất cả <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {classes.length === 0 ? (
                <Empty
                  variant="default"
                  className="flex-1"
                  icon={<BookOpen className="h-8 w-8" />}
                  title="Danh sách đang trống"
                  description="Bắt đầu hành trình giảng dạy của bạn bằng cách tạo lớp học đầu tiên và kết nối với học sinh"
                  action={
                    <Button nativeButton={false} render={<Link href="/classrooms/create" />} className="h-11 w-full rounded-2xl px-5 text-[13px] shadow-lg shadow-primary/20 sm:w-auto">
                      <Plus className="h-4 w-4" /> Tạo lớp học mới
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {classes.map((cls) => {
                    const isActive = cls.status === "active" || cls.active;
                    return (
                      <Card key={cls.id} hover className="!p-4 sm:!p-5 !rounded-3xl">
                        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_220px]">
                          <div className="min-w-0 space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                              {isActive ? (
                                <Badge variant="success" className="gap-1.5"><CheckCircle2 className="h-3 w-3" /> Đang mở</Badge>
                              ) : (
                                <Badge variant="warning" className="gap-1.5"><AlertCircle className="h-3 w-3" /> Bản nháp</Badge>
                              )}
                              <Badge variant="secondary" className="gap-1.5"><Layers className="h-3.5 w-3.5" /> {cls.lessons || 0} bài giảng</Badge>
                            </div>

                            <Link href={`/dashboard/teacher/classes/${cls.id}`} className="block w-fit max-w-full">
                              <h3 className="m-0 line-clamp-2 text-lg font-black leading-snug tracking-tight text-foreground transition-colors hover:text-primary sm:text-xl">
                                {cls.name}
                              </h3>
                            </Link>

                            <div className="grid gap-2 sm:grid-cols-2">
                              <div className="rounded-2xl border border-slate-200/70 bg-white/55 px-3 py-3 dark:border-white/10 dark:bg-white/5">
                                <div className="flex items-center gap-2 text-[12px] font-bold text-muted-foreground"><Users className="h-3.5 w-3.5 text-primary" /> Học sinh</div>
                                <div className="mt-1 truncate text-[13px] font-bold text-foreground">{cls.count || 0}</div>
                              </div>
                              <div className="rounded-2xl border border-slate-200/70 bg-white/55 px-3 py-3 dark:border-white/10 dark:bg-white/5">
                                <div className="flex items-center gap-2 text-[12px] font-bold text-muted-foreground"><Wallet className="h-3.5 w-3.5 text-emerald-500" /> Học phí</div>
                                <div className="mt-1 truncate text-[13px] font-bold text-foreground">{cls.price || "Miễn phí"}</div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                            <div className="space-y-3">
                              <div className="text-[12px] font-bold text-muted-foreground">Đánh giá</div>
                              {(cls.rating || 0) > 0 ? <Rating rating={cls.rating!} showCount={false} /> : <span className="text-sm text-muted-foreground">Chưa có đánh giá</span>}
                            </div>

                            <div className="grid gap-2">
                              <Button nativeButton={false} render={<Link href={`/classrooms/${cls.id}`} />} className="h-10 w-full rounded-xl text-[13px]">
                                Quản lý <ChevronRight className="h-4 w-4" />
                              </Button>
                              <Button nativeButton={false} variant="outline" render={<Link href={`/classrooms/${cls.id}`} />} className="h-10 w-full rounded-xl dark:!bg-transparent dark:!text-white dark:hover:!bg-white/10">
                                Xem tin <ArrowUpRight className="h-4 w-4" />
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

            {/* LỊCH DẠY HÔM NAY */}
            <div className="space-y-3 flex flex-col">
              <div className="flex items-center justify-between px-1">
                <h3 className="m-0 text-[13px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Lịch dạy của bạn</h3>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>

              <Card className="!p-4 sm:!p-5 !rounded-3xl space-y-4 flex-1 flex flex-col">
                <p className="m-0 text-[12px] font-medium text-muted-foreground">
                  {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}
                </p>

                {schedule.length > 0 ? (
                  <div className="space-y-3">
                    {schedule.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-slate-200/70 bg-white/55 p-4 dark:border-white/10 dark:bg-white/5 space-y-3">
                        <div className="flex items-center justify-between text-[12px] font-bold text-primary">
                          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {item.time}</span>
                          <Badge variant="primary" className="text-[10px] uppercase tracking-wide">Sắp diễn ra</Badge>
                        </div>
                        <h4 className="text-sm font-bold leading-snug text-foreground">{item.title}</h4>
                        <p className="truncate text-xs text-muted-foreground">Lớp: {item.class}</p>
                        <Button nativeButton={false} render={<Link href={item.url || "#"} />} className="h-9 w-full rounded-xl bg-primary/10 text-xs text-primary hover:bg-primary hover:text-primary-foreground">
                          <PlayCircle className="h-4 w-4" /> Chuẩn bị tài liệu ngay!
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty
                    variant="default"
                    className="flex-1 !py-6"
                    icon={<CalendarX className="h-7 w-7" />}
                    title="Lịch dạy đang trống"
                    description="Hôm nay bạn không có buổi dạy nào. Hãy dành thời gian nghỉ ngơi và nạp lại năng lượng!"
                  />
                )}

                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-600 dark:text-amber-400">Mẹo cho giáo viên</div>
                  <p className="m-0 text-xs leading-relaxed text-muted-foreground">
                    Đăng tài liệu trước buổi học ít nhất 2 tiếng sẽ giúp học sinh chuẩn bị bài tốt hơn! ⭐
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}