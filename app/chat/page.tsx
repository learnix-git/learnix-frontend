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
import type { ChatUser } from "@/lib/chat/types";

type ServiceContext = {
  id: number;
  name: string;
  thumbnail: string | null;
  price: number | null;
  priceUnit: string | null;
  alias?: string | null;
  /** SLA fields (V2 §6.2). */
  deliveryDays?: number | null;
  revisionLimit?: number | null;
  reviewDuration?: number | null;
  isFreelancer?: boolean | null;
};
type ProjectContext = {
  id: number;
  name: string;
  alias: string | null;
  statusTitle: string | null;
};
/**
 * Order gắn với conversation (V2 §18.1) — truyền cho ChatWindow để
 * hiển thị badge trong header.
 */
type ConversationOrderContext = {
  id: number;
  code: string | null;
  status: number | null;
  statusTitle: string | null;
  statusTitles: { vi?: string; en?: string } | null;
  type: "service" | "project" | "legacy" | null;
} | null;

function WindowLoading() {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/20 animate-pulse relative">
      <div className="absolute top-12 right-12 h-80 w-80 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none" />
      <div className="absolute bottom-12 left-12 h-72 w-72 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header Skeleton */}
      <div className="sticky top-0 h-16 px-4 md:px-6 border-b border-slate-100 dark:border-white/5 flex items-center bg-white/60 dark:bg-zinc-950/40 backdrop-blur-xl flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-zinc-800 flex-shrink-0" />
          <div className="space-y-2">
            <div className="h-3.5 w-28 bg-slate-200 dark:bg-zinc-800 rounded-md" />
            <div className="h-2 w-20 bg-slate-200/80 dark:bg-zinc-800/80 rounded-md" />
          </div>
        </div>
      </div>

      {/* Messages Skeleton */}
      <div className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex justify-start">
            <div className="w-[50%] p-4 bg-slate-200/40 dark:bg-zinc-800/40 rounded-2xl rounded-tl-sm space-y-2">
              <div className="h-3 w-full bg-slate-300 dark:bg-zinc-700/60 rounded-md" />
              <div className="h-3 w-3/4 bg-slate-300 dark:bg-zinc-700/60 rounded-md" />
            </div>
          </div>
          <div className="flex justify-end">
            <div className="w-[40%] p-4 bg-slate-200/60 dark:bg-zinc-800/60 rounded-2xl rounded-tr-sm space-y-2">
              <div className="h-3 w-full bg-slate-300 dark:bg-zinc-700/80 rounded-md" />
              <div className="h-3 w-2/3 bg-slate-300 dark:bg-zinc-700/80 rounded-md" />
            </div>
          </div>
          <div className="flex justify-start">
            <div className="w-[55%] p-4 bg-slate-200/40 dark:bg-zinc-800/40 rounded-2xl rounded-tl-sm space-y-2">
              <div className="h-3 w-full bg-slate-300 dark:bg-zinc-700/60 rounded-md" />
              <div className="h-3 w-5/6 bg-slate-300 dark:bg-zinc-700/60 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Input Skeleton */}
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
        Hộp thư MinaHub
      </h3>
      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
        Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu trao đổi chi
        tiết công việc.
      </p>
    </div>
  );
}

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const authUser = useAuth((s) => s.user);

  const myId = authUser?.id ?? GetUser()?.id ?? 0;

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedPeer, setSelectedPeer] = useState<ChatUser | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectContext | null>(
    null
  );
  const [selectedService, setSelectedService] = useState<ServiceContext | null>(
    null
  );
  const [selectedOrder, setSelectedOrder] =
    useState<ConversationOrderContext>(null);
  const [opening, setOpening] = useState(false);

  const openConversation = useCallback(
    async (
      id: number,
      peer: ChatUser | null,
      project: ProjectContext | null = null,
      service: ServiceContext | null = null,
      order: ConversationOrderContext = null
    ) => {
      setSelectedId(id);
      setSelectedPeer(peer);
      setSelectedProject(project);
      setSelectedService(service);
      setSelectedOrder(order);
    },
    []
  );

  const userParam = searchParams.get("user");
  const cParam = searchParams.get("c");
  const peerIdParam = searchParams.get("peerId");
  const peerNameParam = searchParams.get("peerName");
  const peerAvatarParam = searchParams.get("peerAvatar");
  const peerAliasParam = searchParams.get("peerAlias");
  const projectIdParam = searchParams.get("projectId");
  const projectNameParam = searchParams.get("projectName");
  const serviceIdParam = searchParams.get("serviceId");
  const serviceNameParam = searchParams.get("serviceName");

  useEffect(() => {
    if (!myId) return;

    // Build project context from URL params (decode làm tại chỗ, không memo)
    // để mỗi lần effect chạy đều có giá trị mới nhất từ useSearchParams.
    const projectIdNum = Number(projectIdParam);
    const projectFromUrl: ProjectContext | null =
      Number.isFinite(projectIdNum) && projectIdNum > 0
        ? {
            id: projectIdNum,
            name: projectNameParam
              ? decodeURIComponent(projectNameParam)
              : "",
            alias: null,
            statusTitle: null,
          }
        : null;

    // Build service context from URL params (tương tự project). Khi chỉ có
    // URL params, thumbnail/price/priceUnit chưa biết — để null, ChatWindow
    // sẽ fallback icon Package. Khi API trả về conv.service đầy đủ, sẽ
    // được ghi đè ở slow path bên dưới.
    const serviceIdNum = Number(serviceIdParam);
    const serviceFromUrl: ServiceContext | null =
      Number.isFinite(serviceIdNum) && serviceIdNum > 0
        ? {
            id: serviceIdNum,
            name: serviceNameParam
              ? decodeURIComponent(serviceNameParam)
              : "",
            thumbnail: null,
            price: null,
            priceUnit: null,
            isFreelancer: null,
          }
        : null;

    // ─── Service path: mở/tạo cuộc trò chuyện gắn với dịch vụ ───────────
    // Ưu tiên serviceId nếu có — buyer click "Nhắn tin cho Freelancer" từ
    // trang chi tiết dịch vụ sẽ land ở đây với { c, peerId, serviceId, serviceName }.
    if (serviceFromUrl) {
      // Fast path: caller đã pre-upsert và truyền conversation id + peer info.
      if (cParam && peerIdParam) {
        const id = Number(cParam);
        const peerId = Number(peerIdParam);
        if (
          Number.isFinite(id) && id > 0 &&
          Number.isFinite(peerId) && peerId > 0
        ) {
          openConversation(
            id,
            {
              id: peerId,
              name: peerNameParam ? decodeURIComponent(peerNameParam) : "Người dùng",
              avatar: peerAvatarParam ? decodeURIComponent(peerAvatarParam) : null,
              alias: peerAliasParam ? decodeURIComponent(peerAliasParam) : null,
            },
            null,
            serviceFromUrl
          );
          return;
        }
      }

      // Slow path: chỉ có serviceId, gọi upsert để server resolve creator.
      let cancelled = false;
      setOpening(true);
      ChatAPI.upsertConversation({ serviceId: serviceFromUrl.id })
        .then((res) => {
          if (cancelled) return;
          if (res.success === true && res.data) {
            const conv = res.data;
            // Ưu tiên dùng object `service` đầy đủ từ response (có thumbnail,
            // price, priceUnit). Fallback về URL params hoặc id-based name.
            const svc = conv.service;
            const name =
              svc?.title ||
              serviceFromUrl.name ||
              conv.serviceName ||
              `Dịch vụ #${serviceFromUrl.id}`;
            openConversation(
              conv.id,
              conv.peer,
              null,
              svc
                ? {
                    id: svc.id,
                    name,
                    thumbnail: svc.thumbnail,
                    price: svc.price,
                    priceUnit: svc.priceUnit,
                    alias: svc.alias,
                  }
                : {
                    id: serviceFromUrl.id,
                    name,
                    thumbnail: null,
                    price: null,
                    priceUnit: null,
                    alias: null,
                    isFreelancer: null,
                  }
            );
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

    // Fast path: caller (e.g. freelancer page) đã pre-upsert và truyền
    // conversation id + peer info qua URL. Mở thẳng, skip network call.
    if (cParam && peerIdParam) {
      const id = Number(cParam);
      const peerId = Number(peerIdParam);
      if (
        Number.isFinite(id) && id > 0 &&
        Number.isFinite(peerId) && peerId > 0
      ) {
        openConversation(
          id,
          {
            id: peerId,
            name: peerNameParam ? decodeURIComponent(peerNameParam) : "Người dùng",
            avatar: peerAvatarParam ? decodeURIComponent(peerAvatarParam) : null,
            alias: peerAliasParam ? decodeURIComponent(peerAliasParam) : null,
          },
          projectFromUrl
        );
        return;
      }
    }

    if (!userParam) return;
    const peerId = Number(userParam);
    if (!Number.isFinite(peerId) || peerId <= 0) return;

    // Slow path: cũng truyền projectId (nếu có) để server upsert đúng cuộc
    // trò chuyện gắn với dự án, response sẽ có type/projectId/projectName.
    const upsertInput: { peerId: number; projectId?: number } = { peerId };
    if (projectFromUrl) {
      upsertInput.projectId = projectFromUrl.id;
    }

    let cancelled = false;
    setOpening(true);

    ChatAPI.upsertConversation(upsertInput)
      .then((res) => {
        if (cancelled) return;
        if (res.success === true && res.data) {
          const conv = res.data;
          // Ưu tiên object `project` đầy đủ từ response (có statusTitle + alias).
          const proj = conv.project;
          const project: ProjectContext | null =
            conv.type === "project" && proj
              ? {
                  id: proj.id,
                  name: proj.name || conv.projectName || "",
                  alias: proj.alias ?? null,
                  statusTitle: conv.statusTitle ?? proj.statusTitle ?? null,
                }
              : null;
          openConversation(conv.id, conv.peer, project);
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
    projectIdParam,
    projectNameParam,
    serviceIdParam,
    serviceNameParam,
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
        myId={Number(myId)}
        selectedId={selectedId}
        onSelect={({
          id,
          peer,
          type,
          projectId,
          projectName,
          projectAlias,
          serviceId,
          serviceName,
          serviceAlias,
          serviceThumbnail,
          serviceIsFreelancer,
          statusTitle,
          order,
        }) => {
          const project: ProjectContext | null =
            type === "project" && projectId
              ? {
                  id: projectId,
                  name: projectName ?? "",
                  alias: projectAlias ?? null,
                  statusTitle: statusTitle ?? null,
                }
              : null;
          const service: ServiceContext | null =
            type === "service" && serviceId
              ? {
                  id: serviceId,
                  name: serviceName ?? "",
                  /**
                   * Ưu tiên alias từ `conv.service.alias` — ChatWindow build
                   * link "Xem dịch vụ" qua `/dich-vu/:slug` (xem
                   * `next.config.ts` rewrites `/dich-vu/:slug → /find-services/:slug`).
                   * Fallback về id chỉ khi service không có slug.
                   */
                  alias: serviceAlias ?? null,
                  thumbnail: serviceThumbnail ?? null,
                  price: null,
                  priceUnit: null,
                  isFreelancer: serviceIsFreelancer ?? null,
                }
              : null;
          openConversation(id, peer, project, service, order);
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
            myId={Number(myId)}
            project={selectedProject}
            service={selectedService}
            /**
             * Chỉ cho phép gửi offer khi:
             *   - conversation type=service (đã có `selectedService`)
             *   - current user là service owner (`isFreelancer === true`)
             * BE flag `isFreelancer` được cache trong ServiceContext và chỉ
             * truthy khi user-as-freelancer đang mở service của chính mình.
             */
            canSendOffer={Boolean(
              selectedService && selectedService.isFreelancer === true
            )}
            conversationOrder={selectedOrder}
            onBack={() => {
              setSelectedId(null);
              setSelectedPeer(null);
              setSelectedProject(null);
              setSelectedService(null);
              setSelectedOrder(null);
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
