// * Accept * //

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Star, Users, GraduationCap, Wallet, CalendarDays,
  LogIn, ArrowLeft, Rss, ClipboardList, BookOpen,
  Clock, Target, PlayCircle, BarChart3, Megaphone,
  CheckCircle2, AlertCircle, FolderOpen, Info,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { Empty } from "@/components/ui/Empty";
import ClassroomsProgress from "@/components/classrooms/ClassroomsProgress";

import type { Classroom, Exam, Member } from "@/lib/api/types";
import { ClassroomsAPI } from "@/lib/api/classrooms";
import { FormatMoney, FormatTime } from "@/lib/utils";

// Trạng thái
type ExamState = Exam & Record<string, any>;
type MemberState = Member & Record<string, any>;
type ClassroomState = Classroom & Record<string, any>;

const TABS = [
  { key: "overview", label: "Tổng quan", icon: Info },
  { key: "feed", label: "Bảng tin", icon: Rss },
  { key: "exams", label: "Bài tập", icon: ClipboardList },
  { key: "members", label: "Thành viên", icon: Users },
] as const;

type TabMap = (typeof TABS)[number]["key"];

// Khung xương
function SkeletonCard() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8 space-y-6">
      <Card className="!p-4 sm:!p-6 !rounded-3xl space-y-4">
        <Skeleton className="h-5 w-32 !rounded-full" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 !rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <Skeleton className="h-11 w-full !rounded-2xl" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="lg:col-span-4">
          <Card className="!p-5 !rounded-3xl space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-11 w-full !rounded-xl" />
            <Skeleton className="h-24 w-full" />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function DetailClassroomPage() {
  const params = useParams();
  const id = params?.id as string;

  const [exams, setExams] = useState<ExamState[]>([]);
  const [members, setMembers] = useState<MemberState[]>([]);
  const [feed, setFeed] = useState<Record<string, any>[]>([]);
  const [classroom, setClassroom] = useState<ClassroomState | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [joining, setJoining] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [active, setActive] = useState<TabMap>("overview");

  // Fetch dữ liệu từ BE
  const fetchData = useCallback(async (ID: string) => {
    setLoading(true);
    setNotFound(false);

    try {
      const res = await ClassroomsAPI.getById(ID);
      
      if (res && res.status === "SUCCESS" && res.data) {
        const classData = res.data;
        
        setFeed(classData.feed || []);
        setExams(classData.exams || []);
        setMembers(classData.members || []);
        setClassroom(classData as ClassroomState);

      } else {
        setNotFound(true);
        toast.error(res?.message || "Không thể tải thông tin lớp học");
      }
    } catch (error) {
      setNotFound(true);
      toast.error("Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    fetchData(id);
  }, [id, fetchData]);

  //  Xử lý tham gia lớp học
  const handleJoin = async () => {
    if (!id) return;
    setJoining(true);
    try {
      const res = await ClassroomsAPI.joinClass(id);
      if (res && res.status === "SUCCESS") {
        toast.success("Đăng ký tham gia lớp học thành công!");
        setClassroom((prev) =>
          prev ? { ...prev, isEnrolled: true, enrolled: (prev.enrolled || 0) + 1 } : prev
        );
      } else {
        toast.error(res?.message || "Không thể đăng ký lớp học lúc này");
      }
    } catch (error: any) {
      toast.error(error?.message || "Đã xảy ra lỗi khi đăng ký lớp học");
    } finally {
      setJoining(false);
    }
  };

  // ═══ LOADING STATE ═══
  if (loading) {
    return (
      <div className="min-h-screen bg-transparent pb-24">
        <SkeletonCard />
      </div>
    );
  }

  // ═══ NOT FOUND STATE ═══
  if (notFound || !classroom) {
    return (
      <div className="min-h-screen bg-transparent pb-24">
        <div className="max-w-[720px] mx-auto px-4 py-16">
          <Empty
            variant="default"
            icon={<FolderOpen className="h-8 w-8" />}
            title="Không tìm thấy lớp học"
            description="Lớp học tồn tại hoặc bạn không có quyền truy cập"
            action={
              <Button nativeButton={false} render={<Link href="/classrooms" />} className="h-11 rounded-2xl px-6 text-[13px]">
                <ArrowLeft className="h-4 w-4" /> Quay lại danh sách lớp học
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const enrolled = members.length || 0;
  const capacity = classroom.capacity || 0;

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="max-w-[1280px] mx-auto px-4 py-8 space-y-6">

        {/* ═══ HERO BANNER ═══ */}
        <Card className="!p-4 sm:!p-6 !rounded-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={classroom.active ? "success" : "warning"}>
              {classroom.active ? "Đang mở" : "Tạm đóng"}
            </Badge>
            <Badge variant="secondary" className="gap-1.5">
              <GraduationCap className="h-3.5 w-3.5" /> {classroom.grade === 13 ? "Đại học" : `Khối ${classroom.grade}`}
            </Badge>
          </div>

          <h1 className="m-0 mt-3 text-2xl font-black leading-snug tracking-tight text-foreground sm:text-3xl">
            {classroom.name}
          </h1>
          <p className="m-0 mt-1.5 text-[13px] font-bold text-primary">Mã lớp: {classroom.code}</p>

          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-200/70 pt-4 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Avatar alt={classroom.teacherAvatar} size="sm" />
              <span className="text-[13px] font-medium text-muted-foreground">
                Giáo viên: <span className="font-bold text-foreground">{classroom.teacherName || classroom.teacher}</span>
              </span>
            </div>
            <span className="flex items-center gap-1.5 text-sm font-bold text-amber-500">
              <Star className="h-4 w-4 fill-amber-500" /> {(classroom.rating || 0).toFixed(1)}
            </span>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ═══ MAIN CONTENT ═══ */}
          <div className="lg:col-span-8 space-y-4">
            {/* Tab navigation */}
            <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200/70 bg-white/55 p-1.5 dark:border-white/10 dark:bg-white/5">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = active === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActive(tab.key)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold transition-all cursor-pointer sm:flex-none ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "text-muted-foreground hover:bg-white/60 dark:hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            {active === "overview" && (
              <Card className="!p-4 sm:!p-6 !rounded-3xl">
                {classroom.description?.trim() ? (
                  <p className="m-0 whitespace-pre-line text-[14px] leading-relaxed text-muted-foreground">
                    {classroom.description}
                  </p>
                ) : (
                  <Empty variant="default" icon={<Info className="h-7 w-7" />} title="Chưa có mô tả cho lớp học này" description="Giáo viên chưa cập nhật phần giới thiệu cho lớp học" />
                )}
              </Card>
            )}

            {active === "feed" && (
              <div className="space-y-4">
                {feed.length === 0 ? (
                  <Empty variant="default" icon={<Megaphone className="h-8 w-8" />} title="Chưa có thông báo nào" description="Giáo viên chưa đăng thông báo nào trong lớp học này " />
                ) : (
                  feed.map((post) => (
                    <Card key={post.id} className="!p-4 sm:!p-5 !rounded-3xl">
                      <div className="flex items-start gap-3">
                        <Avatar alt={post.author || classroom.teacherName || classroom.teacher} size="md" />
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-foreground">{post.author || classroom.teacherName || classroom.teacher}</span>
                            <span className="text-xs text-muted-foreground">• {FormatTime(post.createdAt || post.created)}</span>
                          </div>
                          <p className="m-0 text-[14px] leading-relaxed text-muted-foreground">{post.content}</p>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {active === "exams" && (
              <div className="space-y-4">
                {exams.length === 0 ? (
                  <Empty variant="default" icon={<ClipboardList className="h-8 w-8" />} title="Chưa có bài thi nào" description="Chưa có bài tập nào" />
                ) : (
                  exams.map((exam) => (
                    <Card key={exam.id} className="!p-4 sm:!p-5 !rounded-3xl">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 space-y-2.5">
                          <Badge variant={exam.status === "open" ? "success" : "warning"}>
                            {exam.status === "open" ? "Đang mở" : "Đã đóng"}
                          </Badge>
                          <h3 className="m-0 text-base font-black tracking-tight text-foreground sm:text-lg">{exam.title}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-[12px] font-medium text-muted-foreground">
                            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {exam.duration} phút</span>
                            <span className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5" /> Mục tiêu: {exam.threshold} điểm</span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          {exam.status === "open" ? (
                            <Button nativeButton={false} render={<Link href={`/exams/${exam.id}`} />} className="h-10 w-full rounded-xl px-6 text-[13px] sm:w-auto">
                              <PlayCircle className="h-4 w-4" /> Vào thi
                            </Button>
                          ) : exam.hasResult ? (
                            <Button nativeButton={false} variant="outline" render={<Link href={`/exams/${exam.id}/result`} />} className="h-10 w-full rounded-xl px-6 text-[13px] sm:w-auto">
                              <BarChart3 className="h-4 w-4" /> Xem kết quả
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              disabled 
                              className="h-10 w-full rounded-xl px-6 text-[13px] sm:w-auto !bg-amber-500/10 !text-amber-700 dark:!text-amber-400 !border-amber-500/20 !opacity-100 disabled:opacity-100 cursor-not-allowed"                            >
                              Đã đóng
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {active === "members" && (
              <Card className="!p-4 sm:!p-5 !rounded-3xl space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/55 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                  <span className="flex items-center gap-2 text-[13px] font-bold text-muted-foreground">
                    <Users className="h-4 w-4 text-primary" /> Sĩ số lớp học
                  </span>
                  <span className="text-sm font-black text-foreground">{enrolled}/{capacity} học viên</span>
                </div>

                {members.length === 0 ? (
                  <Empty variant="default" icon={<Users className="h-8 w-8" />} title="Chưa có học viên nào" description="Lớp học chưa có ai tham gia" />
                ) : (
                  <div className="space-y-2.5">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/55 p-3.5 dark:border-white/10 dark:bg-white/5"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar alt={member.name} src={member.avatar} size="md" />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-bold text-foreground">{member.name}</div>
                            <div className="truncate text-xs text-muted-foreground">{member.email}</div>
                          </div>
                        </div>
                        <span className="flex shrink-0 items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
                          <CalendarDays className="h-3.5 w-3.5" /> Tham gia: {FormatTime(member.joinedAt || member.created)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* ═══ STICKY SIDEBAR ═══ */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-6 space-y-4">
              <Card className="!p-5 !rounded-3xl space-y-5">
                {/* Học phí */}
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                    <Wallet className="h-3.5 w-3.5 text-emerald-500" /> Học phí
                  </div>
                  {!classroom.fee || classroom.fee === 0 ? (
                    <div className="mt-1.5">
                      <Badge variant="success" className="text-sm">Miễn phí</Badge>
                    </div>
                  ) : (
                    <div className="mt-1 text-2xl font-black tracking-tight text-foreground">
                      {FormatMoney(classroom.fee)}
                    </div>
                  )}
                </div>

                {/* Action button */}
                {classroom.isEnrolled ? (
                  <Button
                    nativeButton={false}
                    variant="outline"
                    render={<Link href={`/classrooms/${classroom.id}`} />}
                    className="h-12 w-full rounded-2xl text-[13px] border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <LogIn className="h-4 w-4" /> Vào không gian học
                  </Button>
                ) : (
                  <Button
                    onClick={handleJoin}
                    loading={joining}
                    disabled={!classroom.active}
                    className="h-12 w-full rounded-2xl text-[13px] bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/30"
                  >
                    {joining ? "Đang đăng ký..." : classroom.active ? "Đăng ký tham gia" : "Lớp học đang tạm đóng"}
                  </Button>
                )}

                {/* Metadata list */}
                <div className="space-y-3 border-t border-slate-200/70 pt-4 dark:border-white/10">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="flex items-center gap-1.5 font-bold text-muted-foreground">
                      <GraduationCap className="h-3.5 w-3.5" /> Khối lớp
                    </span>
                    <span className="font-bold text-foreground">{classroom.grade}</span>
                  </div>

                  {/* ! Gemini: Đã sử dụng component ClassroomsProgress ở đây */}
                  <ClassroomsProgress current={enrolled} capacity={capacity} />

                  <div className="flex items-center justify-between text-[13px]">
                    <span className="flex items-center gap-1.5 font-bold text-muted-foreground">
                      {classroom.active ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <AlertCircle className="h-3.5 w-3.5 text-amber-500" />}
                      Trạng thái
                    </span>
                    <Badge variant={classroom.active ? "success" : "warning"}>
                      {classroom.active ? "Đang mở" : "Tạm đóng"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[13px]">
                    <span className="flex items-center gap-1.5 font-bold text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" /> Ngày tạo
                    </span>
                    <span className="font-bold text-foreground">{FormatTime(classroom.created)}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}