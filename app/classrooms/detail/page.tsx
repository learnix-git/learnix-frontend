"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Copy, Check, Star, Users, GraduationCap, Wallet,
  Layers, Plus, Pencil, LogIn, LogOut, Megaphone,
  FileText, Clock, Target, PlayCircle, BarChart3,
  BookOpen, Download, Rss, ClipboardList, Library,
  ChevronRight, CalendarDays, AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Empty } from "@/components/ui/Empty";
import { FormatMoney } from "@/lib/utils";
import { ClassroomsAPI } from "@/lib/api/classrooms";
import { useAuth } from "@/lib/stores/auth";
import type { Classroom, Exam, Member } from "@/lib/api/types";

const TABS = [
  { key: "feed", label: "Thông báo", icon: Rss },
  { key: "exams", label: "Bài tập", icon: ClipboardList },
  { key: "members", label: "Thành viên", icon: Users },
  { key: "resources", label: "Tài liệu", icon: Library },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function ClassroomDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const classId = params?.id as string;

  // Lấy thông tin user đang đăng nhập từ Zustand store
  const user = useAuth((s: any) => s.user);
  const currentRole = user?.role?.toLowerCase() || "student";

  // ============ STATE DỮ LIỆU THẬT 100% (SẠCH BÓNG TYPE UI RÁC) ============
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  
  const [classroom, setClassroom] = useState<(Classroom & Record<string, any>) | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState<TabKey>("feed");
  const [copied, setCopied] = useState(false);

  // ============ GỌI API KÉO DATA THẬT ============
  const fetchAllData = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    try {
      // Bắn 5 API song song, thằng nào lỗi đéo ảnh hưởng thằng khác
      const [resClass, resMembers, resExams, resFeed, resResources] = await Promise.allSettled([
        ClassroomsAPI.getById(classId),
        ClassroomsAPI.getMembers(classId),
        ClassroomsAPI.getExams(classId),
        ClassroomsAPI.getFeed(classId),
        ClassroomsAPI.getResources(classId),
      ]);

      if (resClass.status === "fulfilled" && resClass.value?.data) {
        setClassroom(resClass.value.data as any);
      } else {
        toast.error("Không tìm thấy thông tin lớp học này!");
      }

      if (resMembers.status === "fulfilled" && resMembers.value?.data) {
        setMembers(resMembers.value.data as any);
      }
      if (resExams.status === "fulfilled" && resExams.value?.data) {
        setExams(resExams.value.data as any);
      }
      if (resFeed.status === "fulfilled" && resFeed.value?.data) {
        setFeed(resFeed.value.data as any);
      }
      if (resResources.status === "fulfilled" && resResources.value?.data) {
        setResources(resResources.value.data as any);
      }
    } catch (error) {
      console.error("❌ Lỗi tải dữ liệu lớp học:", error);
      toast.error("Đã xảy ra lỗi khi tải dữ liệu lớp học.");
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ============ HANDLERS ============
  const handleCopyCode = async () => {
    if (!classroom?.code) return;
    try {
      await navigator.clipboard.writeText(classroom.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Không thể sao chép mã lớp.");
    }
  };

  const handleJoinClass = async () => {
    setActionLoading(true);
    try {
      const res = await ClassroomsAPI.joinClass(classId);
      if (res.status === "SUCCESS") {
        toast.success("🎉 Tham gia lớp học thành công!");
        fetchAllData(); // Kéo lại data để cập nhật sĩ số
      }
    } catch (error: any) {
      toast.error(error.message || "Tham gia lớp học thất bại.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveClass = async () => {
    if (!confirm("Bạn có chắc chắn muốn rời khỏi lớp học này không?")) return;
    setActionLoading(true);
    try {
      const res = await ClassroomsAPI.leaveClass(classId);
      if (res.status === "SUCCESS") {
        toast.success("Đã rời khỏi lớp học.");
        router.push("/classrooms");
      }
    } catch (error: any) {
      toast.error(error.message || "Rời lớp thất bại.");
    } finally {
      setActionLoading(false);
    }
  };

  // ============ RENDER LOADING ============
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">Đang tải chi tiết lớp học...</p>
        </div>
      </div>
    );
  }

  // ============ RENDER ERROR STATE ============
  if (!classroom) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-16">
        <Empty
          variant="default"
          icon={<AlertCircle className="h-10 w-10 text-destructive" />}
          title="Lớp học không tồn tại"
          description="Lớp học này có thể đã bị xóa hoặc bạn không có quyền truy cập."
          action={
            <Button nativeButton={false} render={<Link href="/classrooms" />} className="rounded-2xl px-6">
              Quay lại danh sách lớp
            </Button>
          }
        />
      </div>
    );
  }

  const capacityPercent = Math.round(((classroom.enrolled || 0) / (classroom.capacity || 1)) * 100);
  const isTeacher = currentRole === "teacher" || classroom.teacherId === user?.id || classroom.teacher === user?.id;
  const isEnrolled = classroom.isEnrolled ?? false;

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="max-w-[1280px] mx-auto px-4 py-8 space-y-6">

        {/* ═══ HERO BANNER ═══ */}
        <Card className="!p-4 sm:!p-6 !rounded-3xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 max-w-3xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={classroom.active ? "success" : "warning"}>
                  {classroom.active ? "Đang mở" : "Tạm đóng"}
                </Badge>
                <Badge variant="secondary" className="gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5" /> Khối {classroom.grade}
                </Badge>
                <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                  <Star className="h-4 w-4 fill-amber-500" /> {(classroom.rating || 0).toFixed(1)}
                </div>
              </div>

              <h1 className="m-0 text-2xl font-black leading-snug tracking-tight text-foreground sm:text-3xl">
                {classroom.name}
              </h1>

              <p className="m-0 max-w-[70ch] text-[14px] leading-relaxed text-muted-foreground">
                {classroom.description || "Lớp học chưa có bài viết giới thiệu."}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={handleCopyCode}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200/70 bg-white/55 px-3 py-1.5 text-[12px] font-bold text-foreground transition-all hover:border-primary/30 dark:border-white/10 dark:bg-white/5"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  Mã lớp: <span className="text-primary">{classroom.code}</span>
                </button>

                <span className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
                  <Users className="h-3.5 w-3.5" /> GV: <span className="font-bold text-foreground">{classroom.teacherName || classroom.teacher || "Giảng viên Learnix"}</span>
                </span>

                <span className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
                  <Wallet className="h-3.5 w-3.5" /> <span className="font-bold text-foreground">{FormatMoney(classroom.fee || 0)}</span>
                </span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row lg:w-auto lg:flex-col">
              {isTeacher ? (
                <>
                  <Button
                    nativeButton={false}
                    render={<Link href={`/classrooms/edit?id=${classroom.id}`} />}
                    variant="outline"
                    className="h-11 w-full rounded-2xl px-6 text-[13px] sm:w-auto lg:w-full"
                  >
                    <Pencil className="h-4 w-4" /> Chỉnh sửa lớp
                  </Button>
                  <Button
                    nativeButton={false}
                    render={<Link href={`/classrooms/${classroom.id}/exams/create`} />}
                    className="h-11 w-full rounded-2xl px-6 text-[13px] shadow-lg shadow-primary/20 sm:w-auto lg:w-full"
                  >
                    <Plus className="h-4 w-4" /> Tạo bài thi mới
                  </Button>
                </>
              ) : isEnrolled ? (
                <Button
                  variant="outline"
                  onClick={handleLeaveClass}
                  disabled={actionLoading}
                  className="h-11 w-full rounded-2xl px-6 text-[13px] border-rose-200 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 dark:border-rose-900/30 dark:hover:text-rose-400 sm:w-auto lg:w-full"
                >
                  <LogOut className="h-4 w-4" /> {actionLoading ? "Đang xử lý..." : "Rời khỏi lớp học"}
                </Button>
              ) : (
                <Button
                  onClick={handleJoinClass}
                  disabled={actionLoading}
                  className="h-11 w-full rounded-2xl px-6 text-[13px] shadow-lg shadow-primary/20 sm:w-auto lg:w-full"
                >
                  <LogIn className="h-4 w-4" /> {actionLoading ? "Đang xử lý..." : "Tham gia lớp học"}
                </Button>
              )}
            </div>
          </div>

          {/* Sĩ số */}
          <div className="mt-5 flex items-center gap-4 border-t border-slate-200/70 pt-5 dark:border-white/10">
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between text-[12px] font-bold text-muted-foreground">
                <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Sĩ số</span>
                <span className="text-foreground">{classroom.enrolled || 0}/{classroom.capacity || 50} học viên</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${Math.min(capacityPercent, 100)}%` }} />
              </div>
            </div>
          </div>
        </Card>

        {/* ═══ TAB NAVIGATION ═══ */}
        <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200/70 bg-white/55 p-1.5 dark:border-white/10 dark:bg-white/5 sm:inline-flex">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
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

        {/* ═══ TAB CONTENT ═══ */}
        <div>
          {/* BẢNG TIN */}
          {activeTab === "feed" && (
            <div className="space-y-4">
              {feed.length === 0 ? (
                <Empty variant="default" icon={<Megaphone className="h-8 w-8" />} title="Chưa có thông báo nào" description="Giáo viên chưa đăng bài viết nào trong lớp học này." />
              ) : (
                feed.map((post: any) => (
                  <Card key={post.id} className="!p-4 sm:!p-5 !rounded-3xl">
                    <div className="flex items-start gap-3">
                      <Avatar alt={post.author || "Giảng viên"} size="md" />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-foreground">{post.author || "Giảng viên"}</span>
                          {post.pinned && (
                            <Badge variant="primary" className="gap-1 text-[10px]">
                              <Megaphone className="h-3 w-3" /> Đã ghim
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">• {post.createdAt || "Gần đây"}</span>
                        </div>
                        <p className="m-0 text-[14px] leading-relaxed text-muted-foreground">{post.content || post.message}</p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* TAB 2: BÀI TẬP & ĐỀ THI */}
          {activeTab === "exams" && (
            <div className="space-y-4">
              {exams.length === 0 ? (
                <Empty variant="default" icon={<ClipboardList className="h-8 w-8" />} title="Chưa có đề thi nào" description="Lớp học này chưa có bài tập hoặc đề thi được tạo." />
              ) : (
                exams.map((exam: any) => {
                  const isOpen = exam.status === "open" || exam.status === "PUBLISHED";
                  return (
                    <Card key={exam.id} className="!p-4 sm:!p-5 !rounded-3xl">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 space-y-2.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={isOpen ? "success" : "default"}>
                              {isOpen ? "Đang mở" : "Đã đóng"}
                            </Badge>
                          </div>
                          <h3 className="m-0 text-base font-black tracking-tight text-foreground sm:text-lg">{exam.title}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-[12px] font-medium text-muted-foreground">
                            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {exam.duration || 45} phút</span>
                            <span className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5" /> Mục tiêu: {exam.threshold || 5.0} điểm</span>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isOpen ? (
                            <Button nativeButton={false} render={<Link href={`/exams/${exam.id}`} />} variant="outline" className="h-10 w-full rounded-xl dark:!bg-transparent dark:!text-white dark:hover:!bg-white/10">
                              <PlayCircle className="h-4 w-4" /> Làm bài
                            </Button>
                          ) : exam.hasResult ? (
                            <Button nativeButton={false} render={<Link href={`/exams/${exam.id}/result`} />} variant="outline" className="h-10 w-full rounded-xl dark:!bg-transparent dark:!text-white dark:hover:!bg-white/10">
                              <BarChart3 className="h-4 w-4" /> Xem kết quả
                            </Button>
                          ) : (
                            <Button variant="outline" disabled className="h-10 w-full rounded-xl px-6 text-[13px] sm:w-auto">
                              Đã đóng
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: THÀNH VIÊN */}
          {activeTab === "members" && (
            <Card className="!p-4 sm:!p-5 !rounded-3xl space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/55 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <span className="flex items-center gap-2 text-[13px] font-bold text-muted-foreground">
                  <Users className="h-4 w-4 text-primary" /> Sĩ số
                </span>
                <span className="text-sm font-black text-foreground">{classroom.enrolled || 0}/{classroom.capacity || 50} học viên</span>
              </div>

              {members.length === 0 ? (
                <Empty variant="default" icon={<Users className="h-8 w-8" />} title="Chưa có học viên nào" description="Lớp học này hiện chưa có ai tham gia." />
              ) : (
                <div className="space-y-2.5">
                  {members.map((member: any) => (
                    <div
                      key={member.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/55 p-3.5 dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar alt={member.name || "Học viên"} src={member.avatar} size="md" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-bold text-foreground">{member.name || "Học viên Learnix"}</span>
                            {member.role === "TEACHER" && <Badge variant="primary" className="text-[10px]">Giảng viên</Badge>}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">{member.email || "Chưa cập nhật email"}</div>
                        </div>
                      </div>
                      <span className="flex shrink-0 items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" /> Tham gia: {member.joinedAt || "Gần đây"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* TAB 4: TÀI LIỆU / NGÂN HÀNG */}
          {activeTab === "resources" && (
            <div className="space-y-4">
              {resources.length === 0 ? (
                <Empty variant="default" icon={<Library className="h-8 w-8" />} title="Chưa có tài liệu nào" description="Giáo viên chưa đăng tài liệu hoặc ngân hàng câu hỏi nào." />
              ) : (
                resources.map((res: any) => (
                  <Card key={res.id} className="!p-4 sm:!p-5 !rounded-3xl">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${res.type === "bank" ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"}`}>
                          {res.type === "bank" ? <BookOpen className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="m-0 truncate text-sm font-bold text-foreground">{res.title || res.name}</h4>
                          <p className="m-0 text-xs text-muted-foreground">
                            {res.type === "bank" ? `${res.questionCount || 0} câu hỏi` : res.size || "Tài liệu đính kèm"}
                          </p>
                        </div>
                      </div>

                      {res.type === "bank" ? (
                        <Button nativeButton={false} render={<Link href={res.url || `/banks/${res.id}`} />} variant="outline" className="h-9 shrink-0 rounded-xl px-4 text-[13px]">
                          Xem ngân hàng <ChevronRight className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button nativeButton={false} render={<a href={res.url || "#"} target="_blank" rel="noreferrer" />} variant="outline" className="h-9 shrink-0 rounded-xl px-4 text-[13px]">
                          <Download className="h-4 w-4" /> Tải xuống
                        </Button>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}