"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { ChatList } from "@/components/chat/ChatList";
import ChatWindow from "@/components/chat/ChatWindow";
import { ChatAPI } from "@/lib/api/chat";
import { useAuth } from "@/lib/stores/auth";
import { GetUser } from "@/lib/auth/session";
import type { ChatUser, ChatCourseRef } from "@/lib/chat/types";

function WindowLoading() {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/20 animate-pulse relative">
      <div className="absolute top-12 right-12 h-80 w-80 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none" />
      <div className="absolute bottom-12 left-12 h-72 w-72 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="sticky top-0 h-16 px-4 md:px-6 border-b border-slate-100 dark:border-white/5 flex items-center bg-white/60 dark:bg-zinc-950/40 backdrop-blur-xl flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-zinc-800 flex-shrink-0" />
          <div className="space-y-2">
            <div className="h-3.5 w-28 bg-slate-200 dark:bg-zinc-800 rounded-md" />
            <div className="h-2 w-20 bg-slate-200/80 dark:bg-zinc-800/80 rounded-md" />
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex justify-start">
            <div className="w-[50%] p-4 bg-slate-200/40 dark:bg-zinc-800/40 rounded-2xl rounded-tl-sm space-y-2">
              <div className="h-3 w-full bg-slate-300 dark:bg-zinc-750 rounded-md" />
              <div className="h-3 w-3/4 bg-slate-300 dark:bg-zinc-750 rounded-md" />
            </div>
          </div>
          <div className="flex justify-end">
            <div className="w-[40%] p-4 bg-slate-200/60 dark:bg-zinc-800/60 rounded-2xl rounded-tr-sm space-y-2">
              <div className="h-3 w-full bg-slate-300 dark:bg-zinc-750 rounded-md" />
              <div className="h-3 w-2/3 bg-slate-300 dark:bg-zinc-750 rounded-md" />
            </div>
          </div>
          <div className="flex justify-start">
            <div className="w-[55%] p-4 bg-slate-200/40 dark:bg-zinc-800/40 rounded-2xl rounded-tl-sm space-y-2">
              <div className="h-3 w-full bg-slate-300 dark:bg-zinc-750 rounded-md" />
              <div className="h-3 w-5/6 bg-slate-300 dark:bg-zinc-750 rounded-md" />
            </div>
          </div>
        </div>
      </div>

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

function WindowEmpty() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative bg-slate-50/50 dark:bg-slate-950/20">
      <div className="absolute top-12 right-12 h-80 w-80 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none" />
      <div className="absolute bottom-12 left-12 h-72 w-72 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="w-20 h-20 bg-primary/10 text-primary dark:text-purple-400 rounded-full flex items-center justify-center mb-5 animate-pulse shadow-inner shadow-primary/5">
        <MessageSquare className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight mb-1 uppercase">
        Hộp thư Learnix
      </h3>
      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
        Chọn một cuộc trò chuyện từ danh sách bên trái để trao đổi chi tiết về lớp học và bài tập.
      </p>
    </div>
  );
}

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const authUser = useAuth((s) => s.user);

  const myId = authUser?.id ? String(authUser.id) : (GetUser()?.id ? String(GetUser()?.id) : "");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedPeer, setSelectedPeer] = useState<ChatUser | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<ChatCourseRef | null>(null);
  const [opening, setOpening] = useState(false);

  const openConversation = useCallback(
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

  const userParam = searchParams.get("user");
  const cParam = searchParams.get("c");
  const peerIdParam = searchParams.get("peerId");
  const peerNameParam = searchParams.get("peerName");
  const peerAvatarParam = searchParams.get("peerAvatar");
  const peerAliasParam = searchParams.get("peerAlias");
  const courseIdParam = searchParams.get("courseId");
  const courseNameParam = searchParams.get("courseName");

  useEffect(() => {
    if (!myId) return;

    const courseFromUrl: ChatCourseRef | null = courseIdParam
      ? {
          id: courseIdParam,
          name: courseNameParam ? decodeURIComponent(courseNameParam) : "",
          code: null,
          thumbnail: null,
          price: null,
        }
      : null;

    if (courseFromUrl) {
      if (cParam && peerIdParam) {
        openConversation(
          cParam,
          {
            id: peerIdParam,
            name: peerNameParam ? decodeURIComponent(peerNameParam) : "Người dùng",
            avatar: peerAvatarParam ? decodeURIComponent(peerAvatarParam) : null,
            alias: peerAliasParam ? decodeURIComponent(peerAliasParam) : null,
          },
          courseFromUrl
        );
        return;
      }

      let cancelled = false;
      setOpening(true);
      ChatAPI.UpsertConversation({ peerId: peerIdParam || "", courseId: courseFromUrl.id })
        .then((res) => {
          if (cancelled) return;
          if (res.code === 200 && res.data) {
            const conv = res.data;
            openConversation(conv.id, conv.peer, conv.course);
          } else {
            toast.error(res.message || "Không thể mở cuộc trò chuyện");
          }
        })
        .catch((e) => {
          if (cancelled) return;
          const msg = e instanceof Error ? e.message : "Lỗi không xác định";
          toast.error(msg);
        })
        .finally(() => {
          if (!cancelled) setOpening(false);
        });

      return () => {
        cancelled = true;
      };
    }

    if (cParam && peerIdParam) {
      openConversation(
        cParam,
        {
          id: peerIdParam,
          name: peerNameParam ? decodeURIComponent(peerNameParam) : "Người dùng",
          avatar: peerAvatarParam ? decodeURIComponent(peerAvatarParam) : null,
          alias: peerAliasParam ? decodeURIComponent(peerAliasParam) : null,
        },
        null
      );
      return;
    }

    if (!userParam) return;

    let cancelled = false;
    setOpening(true);

    ChatAPI.UpsertConversation({ peerId: userParam })
      .then((res) => {
        if (cancelled) return;
        if (res.code === 200 && res.data) {
          const conv = res.data;
          openConversation(conv.id, conv.peer, conv.course);
        } else {
          toast.error(res.message || "Không thể mở cuộc trò chuyện");
        }
      })
      .catch((e) => {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "Lỗi không xác định";
        toast.error(msg);
      })
      .finally(() => {
        if (!cancelled) setOpening(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    userParam,
    cParam,
    peerIdParam,
    peerNameParam,
    peerAvatarParam,
    courseIdParam,
    courseNameParam,
    myId,
    openConversation,
  ]);

  if (!myId) {
    return (
      <div className="h-[calc(100vh-64px)] w-full flex items-center justify-center text-sm text-muted-foreground">
        Vui lòng đăng nhập để sử dụng chat.
      </div>
    );
  }

  const isChatOpen = selectedId !== null || (opening && userParam);

  return (
    <div className="h-[calc(100vh-64px)] w-full flex overflow-hidden bg-slate-50 dark:bg-[#09090b] text-foreground font-sans">
      <ChatList
        myId={myId}
        selectedId={selectedId}
        onSelect={(selectedConv: any) => {
          const course: ChatCourseRef | null =
            selectedConv.type === "course" && selectedConv.courseId
              ? {
                  id: selectedConv.courseId,
                  name: selectedConv.courseName ?? "",
                  code: selectedConv.courseCode ?? null,
                  thumbnail: selectedConv.courseThumbnail ?? null,
                  price: null,
                }
              : null;
          openConversation(selectedConv.id, selectedConv.peer, course);
        }}
        className={isChatOpen ? "hidden md:flex" : "flex"}
      />

      <div className={`flex-1 h-full min-w-0 ${isChatOpen ? "flex" : "hidden md:flex"}`}>
        {opening && !selectedId ? (
          <WindowLoading />
        ) : selectedId && selectedPeer ? (
          <ChatWindow
            key={selectedId}
            conversationId={selectedId}
            peer={selectedPeer}
            myId={myId}
            course={selectedCourse}
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
          <WindowEmpty />
        )}
      </div>
    </div>
  );
}