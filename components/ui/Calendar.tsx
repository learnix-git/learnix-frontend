"use client";

import * as React from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { Variants } from "@/components/ui/Button";
import { Cn } from "@/lib/utils";

// ! Kiểu Props của Calendar
export type CalendarProps = React.ComponentProps<typeof DayPicker>;

// ! Calendar dùng để chọn ngày tháng
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={Cn("p-3", className)}
      classNames={{
        // ! Bố cục tổng thể
        months:
          "flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0",

        month:
          "space-y-4",

        // ! Tiêu đề tháng
        caption:
          "relative mb-2 flex h-9 items-center justify-center pt-1",

        caption_label:
          "text-sm font-semibold",

        // ! Điều hướng tháng
        nav:
          "flex items-center",

        nav_button: Cn(
          Variants({ variant: "outline" }),
          "h-7 w-7 cursor-pointer bg-transparent p-0 opacity-50 hover:opacity-100",
        ),

        nav_button_previous:
          "absolute left-1 top-1",

        nav_button_next:
          "absolute right-1 top-1",

        // ! Bảng lịch
        table:
          "w-full border-collapse border-spacing-y-1",

        head_row:
          "flex",

        head_cell:
          "mb-1 w-9 rounded-md text-[0.8rem] font-normal text-muted-foreground",

        row:
          "mt-1.5 flex w-full gap-1",

        cell:
          "relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20",

        // ! Ngày trong lịch
        day: Cn(
          Variants({ variant: "ghost" }),
          "h-9 w-9 cursor-pointer rounded-xl p-0 font-normal transition-all aria-selected:opacity-100",
        ),

        day_selected:
          "rounded-xl bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",

        day_today:
          "rounded-xl bg-accent text-accent-foreground",

        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",

        day_disabled:
          "cursor-default text-muted-foreground opacity-50",

        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",

        day_range_end:
          "day-range-end",

        day_hidden:
          "invisible",

        // ! Ghi đè class từ bên ngoài
        ...classNames,
      }}
      components={{
        // ! Nút tháng trước
        IconLeft: () => (
          <ChevronLeft className="h-4 w-4" />
        ),

        // ! Nút tháng sau
        IconRight: () => (
          <ChevronRight className="h-4 w-4" />
        ),
      }}
      {...props}
    />
  );
}

// ! Export Component
export { Calendar };