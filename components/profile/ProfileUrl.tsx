"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

interface ProfileUrlProps {
  url: string;
  className?: string;
}

export function ProfileUrl({ url, className }: ProfileUrlProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Đã sao chép URL");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không thể sao chép. Vui lòng copy thủ công.");
    }
  };

  return (
    <Button
      type="button"
      onClick={handleCopy}
      variant="outline"
      size="sm"
      className={`shrink-0 ${className || ""}`}
      aria-label={copied ? "Đã sao chép" : "Sao chép URL"}
    >
      {copied ? (
        <>
          <Check size={14} className="mr-1.5 text-emerald-500" strokeWidth={2.5} />
          Đã sao chép
        </>
      ) : (
        <>
          <Copy size={14} className="mr-1.5" />
          Sao chép
        </>
      )}
    </Button>
  );
}
