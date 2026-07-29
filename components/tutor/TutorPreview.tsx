"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function TutorPreview({
  item,
  onClose,
}: {
  item: any;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!item) return null;
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm overflow-y-auto">
      {/* Backdrop click close */}
      <div className="fixed inset-0" onClick={onClose} />
      <div className="min-h-full flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-card w-full max-w-5xl h-[85vh] rounded-2xl overflow-hidden flex flex-col relative shadow-2xl z-10 pointer-events-auto">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center bg-background">
            <h3 className="font-bold text-lg truncate pr-4">{item.title}</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-muted"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-muted flex items-center justify-center overflow-hidden">
            {/* TRƯỜNG HỢP 1: VIDEO YOUTUBE */}
            {item.type === "youtube" ? (
              <iframe
                src={item.url}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : /* TRƯỜNG HỢP 2: HÌNH ẢNH */
              item.type === "image" ? (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="max-w-full max-h-full object-contain shadow-lg rounded-sm"
                  />
                </div>
              ) : (
                /* TRƯỜNG HỢP 3: PDF / TÀI LIỆU (Dùng iframe) */
                <iframe
                  src={item.url}
                  className="w-full h-full border-none"
                  title="Document Preview"
                />
              )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}