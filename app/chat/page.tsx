"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatAPI } from "@/lib/api/chat";
import { useAuth } from "@/lib/stores/auth";
import { GetUser } from "@/lib/auth/session";
import type { ChatUser, ChatCourseRef } from "@/lib/chat/types";

function ChatLoading() {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/20 animate-pulse relative">
      {/* Background skeleton*/}
      <div className="absolute top-12 right-12 h-80 w-80 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none" />
      <div className="absolute bottom-12 left-12 h-72 w-72 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header skeleton */}
      <div className="sticky top-0 h-16 px-4 md:px-6 border-b border-slate-100 dark:border-white/5 flex items-center bg-white/60 dark:bg-zinc-950/40 backdrop-blur-xl flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-zinc-800 flex-shrink-0" />

          <div className="space-y-2">
            <div className="h-3.5 w-28 bg-slate-200 dark:bg-zinc-800 rounded-md" />
            <div className="h-2 w-20 bg-slate-200/80 dark:bg-zinc-800/80 rounded-md" />
          </div>
        </div>
      </div>

      {/* Messages skeleton */}
      <div className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">

          {/* Incoming message */}
          <div className="flex justify-start">
            <div className="w-[50%] p-4 bg-slate-200/40 dark:bg-zinc-800/40 rounded-2xl rounded-tl-sm space-y-2">
              <div className="h-3 w-full bg-slate-300 dark:bg-zinc-750 rounded-md" />
              <div className="h-3 w-3/4 bg-slate-300 dark:bg-zinc-750 rounded-md" />
            </div>
          </div>

          {/* Outgoing message */}
          <div className="flex justify-end">
            <div className="w-[40%] p-4 bg-slate-200/60 dark:bg-zinc-800/60 rounded-2xl rounded-tr-sm space-y-2">
              <div className="h-3 w-full bg-slate-300 dark:bg-zinc-750 rounded-md" />
              <div className="h-3 w-2/3 bg-slate-300 dark:bg-zinc-750 rounded-md" />
            </div>
          </div>

        </div>
      </div>

      {/* Input skeleton */}
      <div className="sticky bottom-0 p-4 bg-white/60 dark:bg-zinc-950/40 backdrop-blur-xl border-t border-slate-100 dark:border-white/5 flex-shrink-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-slate-200 dark:bg-zinc-800 flex-shrink-0" />
          <div className="flex-1 h-11 bg-slate-200/50 dark:bg-zinc-800/50 rounded-2xl" />
          <div className="h-11 w-11 rounded-2xl bg-slate-200 dark:bg-zinc-800 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}

function ChatEmpty() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative bg-slate-50/50 dark:bg-slate-950/20">
      {/* Empty state background */}
      <div className="absolute top-12 right-12 h-80 w-80 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none" />
      <div className="absolute bottom-12 left-12 h-72 w-72 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Empty state icon */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 shadow-inner shadow-blue-500/10 animate-pulse mb-5">
        <MessageSquare className="h-8 w-8" />
      </div>

      {/* Empty state title */}
      <h3 className="mb-1 text-lg font-black uppercase tracking-tight text-slate-800 dark:text-slate-100">
        Hộp thư Learnix
      </h3>

      {/* Empty state description */}
      <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
        Chọn một cuộc trò chuyện từ danh sách bên trái để trao đổi chi tiết về lớp học và bài tập.
      </p>
    </div>
  );
}

export default function ChatPage() {
  // Lấy thông tin người dùng hiện tại
  const searchParams = useSearchParams();
  const userInfo = useAuth((s) => s.user);
  const userId = userInfo?.id 
               ? String(userInfo.id) 
               : GetUser()?.id 
               ? String(GetUser()?.id) 
               : "";

  // Trạng thái cuộc trò chuyện hiện tại
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedPeer, setSelectedPeer] = useState<ChatUser | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<ChatCourseRef | null>(null);

  // Trạng thái mở cuộc trò chuyện
  const [open, setOpen] = useState(false);

  // Hàm cập nhật cuộc trò chuyện đang mở
  const SetConversation = useCallback(
    async (
      id: string,
      peer: ChatUser | null,
      course: ChatCourseRef | null = null
    ) => {
      setSelectedId(id);
      setSelectedPeer(peer);
      setSelectedCourse(course);
    },
    []
  );

  // Lấy id người dùng
  const userParam = searchParams.get("user");

  // Lấy id cuộc trò chuyện
  const chatParam = searchParams.get("chat");
  
  // Lấy thông tin đối tượng user đang chat
  const peerIdParam = searchParams.get("peerId");
  const peerNameParam = searchParams.get("peerName");
  const peerAliasParam = searchParams.get("peerAlias");
  const peerAvatarParam = searchParams.get("peerAvatar");

  // Lấy thông tin khóa học user đang chat
  const courseIdParam = searchParams.get("courseId");
  const courseNameParam = searchParams.get("courseName");

  useEffect(() => {
    // Nếu chưa đăng nhập thì không render
    if (!userId) return;

    // Lấy thông tin khóa học từ URL
    const courseUrl: ChatCourseRef | null = courseIdParam
      ? {
          id: courseIdParam,
          name: courseNameParam,
          code: null,
          thumbnail: null,
          price: null,
        }
      : null;

    // Xử lý đoạn chat khóa học
    if (courseUrl) {
      if (chatParam && peerIdParam) {
        SetConversation(
          chatParam,
          {
            id: peerIdParam,
            name: peerNameParam,
            avatar: peerAvatarParam,
            alias: peerAliasParam,
          },
          courseUrl
        );
        return;
      }

      let cancelled = false;
      setOpen(true);

      // Gọi API tạo đoạn chat nếu chưa có và mở đoạn chat nếu đã có
      ChatAPI.UpsertConversation({ 
        peerId: peerIdParam || "", 
        courseId: courseUrl.id 
      })
        .then((res) => {
          if (cancelled) return;

          if (res.code === 200 && res.data) {
            SetConversation(
              res.data.id, 
              res.data.peer, 
              res.data.course
            );
          } else {
            toast.error(res.message || "Không thể mở cuộc trò chuyện");
          }
        })
        .catch((e) => {
          if (cancelled) return;

          toast.error(e instanceof Error ? e.message : "Lỗi không xác định");
        })
        .finally(() => {
          if (!cancelled) setOpen(false);
        });

      return () => {
        cancelled = true;
      };
    }

    // Xử lý đoạn chat riêng
    if (chatParam && peerIdParam) {
      SetConversation(
        chatParam,
        {
          id: peerIdParam,
          name: peerNameParam,
          avatar: peerAvatarParam,
          alias: peerAliasParam,
        },
        null
      );
      return;
    }

    if (!userParam) return;

    let cancelled = false;
    setOpen(true);

    // Gọi API tạo đoạn chat nếu chưa có và mở đoạn chat nếu đã có
    ChatAPI.UpsertConversation({ 
      peerId: userParam 
    })
      .then((res) => {
        if (cancelled) return;

        if (res.code === 200 && res.data) {
          SetConversation(
            res.data.id, 
            res.data.peer, 
            res.data.course
          );
        } else {
          toast.error(res.message || "Không thể mở cuộc trò chuyện");
        }
      })
      .catch((e) => {
        if (cancelled) return;
        
        toast.error(e instanceof Error ? e.message : "Lỗi không xác định");
      })
      .finally(() => {
        if (!cancelled) setOpen(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, userParam, chatParam, peerIdParam, peerNameParam, peerAvatarParam, courseIdParam, courseNameParam, SetConversation]);

  if (!userId) {
    return (
      <div className="h-[calc(100vh-64px)] w-full flex items-center justify-center text-sm text-muted-foreground">
        Vui lòng đăng nhập để sử dụng chat.
      </div>
    );
  }

  const isOpen = selectedId !== null || (open && userParam);

  return (
    <div className="h-[calc(100vh-64px)] w-full flex overflow-hidden bg-slate-50 dark:bg-[#09090b] text-foreground font-sans">
      <ChatList
        // Tham số type ChatList
        userId={userId}
        selectedId={selectedId}

        // Mở cuộc trò chuyện được chọn
        onSelect={(selectedChat: any) => {
          const course: ChatCourseRef | null =
            selectedChat.type === "course" && selectedChat.courseId
              ? {
                  id: selectedChat.courseId,
                  name: selectedChat.courseName,
                  code: selectedChat.courseCode,
                  thumbnail: selectedChat.courseThumbnail,
                  price: null,
                }
              : null;
          SetConversation(selectedChat.id, selectedChat.peer, course);
        }}

        // Ẩn danh sách chat trên mobile
        className={isOpen ? "hidden md:flex" : "flex"}
      />

      <div className={`flex-1 h-full min-w-0 ${isOpen ? "flex" : "hidden md:flex"}`}>
        {open && !selectedId ? (
          <ChatLoading />
        ) : selectedId && selectedPeer ? (
          <ChatWindow
            // Tham số type ChatWindow
            key={selectedId}

            userId={userId}
            conversationId={selectedId}
            
            peer={selectedPeer}
            course={selectedCourse}

            // Quay lại danh sách cuộc trò chuyện
            onBack={() => {
              setSelectedId(null);
              setSelectedPeer(null);
              setSelectedCourse(null);
              if (typeof window !== "undefined") {
                window.history.replaceState(null, "", window.location.pathname);
              }
            }}
          />
        ) : (
          // Chưa chọn cuộc trò chuyện
          <ChatEmpty />
        )}
      </div>
    </div>
  );
}