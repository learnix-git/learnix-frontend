"use client";

import React from "react";
import { BreadcrumbComponent } from "@/components/ui/Breadcrumb";

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface TwoColumnLayoutProps {
  title?: string;
  description?: string;
  breadcrumb?: BreadcrumbItem[];
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  extraHeader?: React.ReactNode;
  containerClassName?: string;
}

export function TwoColumnLayout({
  title,
  description,
  breadcrumb,
  children,
  sidebar,
  extraHeader,
  containerClassName = "",
}: TwoColumnLayoutProps) {
  return (
    <div className="min-h-screen bg-transparent pb-24">
      {/* ═══ BREADCRUMB ═══ */}
      {(!breadcrumb || breadcrumb.length > 0) && (
        <div className="bg-white/40 dark:bg-slate-950/40 backdrop-blur-md border-b border-white/60 dark:border-white/5">
          <div className="max-w-[1280px] mx-auto px-4 py-4">
            <BreadcrumbComponent pathList={breadcrumb} />
          </div>
        </div>
      )}

      <div className={`max-w-[1280px] mx-auto px-4 py-8 ${containerClassName}`}>
        {/* ═══ HEADER ═══ */}
        {(title || extraHeader) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            {title && (
              <div className="flex flex-row items-center gap-3">
                <div className="h-8 w-1.5 rounded-full bg-primary" />
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none">{title}</h1>
              </div>
            )}
            {extraHeader && <div className="flex items-center gap-3">{extraHeader}</div>}
          </div>
        )}

        {description && (
          <p className="mb-8 text-[15px] text-muted-foreground max-w-2xl">{description}</p>
        )}

        {/* items-stretch: cho 2 cột cao bằng nhau (đáy khớp nhau), đỉnh luôn thẳng hàng vì description
           đã nằm ở header dùng chung phía trên, không còn nằm riêng trong cột form nữa */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch">
          {/* Main Content Column */}
          <div className="flex-1 w-full min-w-0">
            {children}
          </div>

          {/* Sidebar Column */}
          {sidebar && (
            <div className="w-full lg:w-[320px] shrink-0">
              <div className="space-y-4 lg:space-y-6 lg:sticky lg:top-24">
                {sidebar}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}