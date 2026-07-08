"use client";

import * as React from "react";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";

import { Button } from "@/components/ui/Button";
import { Cn } from "@/lib/utils";

// ! Các kiểu dữ liệu của Carousel
type CarouselApi = UseEmblaCarouselType[1];
type CarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = CarouselParameters[0];
type CarouselPlugin = CarouselParameters[1];

// ! Props của Carousel
type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

// ! Context của Carousel
type CarouselContext = CarouselProps & {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
};

// ! Context dùng chung cho Carousel
const CarouselContext =
  React.createContext<CarouselContext | null>(null);

// ! Hook lấy dữ liệu từ Carousel Context
function CarouselHook() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error(
      "CarouselHook must be used within a <Carousel />",
    );
  }

  return context;
}

// ! Carousel chính
function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins,
  );

  const [canScrollPrev, setCanScrollPrev] =
    React.useState(false);

  const [canScrollNext, setCanScrollNext] =
    React.useState(false);

  // ! Cập nhật trạng thái nút điều hướng
  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return;

    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  // ! Chuyển về slide trước
  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  // ! Chuyển sang slide tiếp theo
  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  // ! Điều hướng bằng bàn phím
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  // ! Trả API ra ngoài nếu có
  React.useEffect(() => {
    if (!api || !setApi) return;

    setApi(api);
  }, [api, setApi]);

  // ! Lắng nghe sự kiện thay đổi slide
  React.useEffect(() => {
    if (!api) return;

    onSelect(api);

    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        orientation:
          orientation ??
          (opts?.axis === "y"
            ? "vertical"
            : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        data-slot="carousel"
        role="region"
        aria-roledescription="carousel"
        onKeyDownCapture={handleKeyDown}
        className={Cn("relative", className)}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

// ! Vùng chứa các slide
function CarouselContent({
  className,
  viewportClassName,
  ...props
}: React.ComponentProps<"div"> & {
  viewportClassName?: string;
}) {
  const { carouselRef, orientation } =
    CarouselHook();

  return (
    <div
      ref={carouselRef}
      data-slot="carousel-content"
      className={Cn(
        "overflow-hidden",
        viewportClassName,
      )}
    >
      <div
        className={Cn(
          "flex",
          orientation === "horizontal"
            ? "-ml-4"
            : "-mt-4 flex-col",
          className,
        )}
        {...props}
      />
    </div>
  );
}

// ! Một slide của Carousel
function CarouselItem({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { orientation } = CarouselHook();

  return (
    <div
      data-slot="carousel-item"
      role="group"
      aria-roledescription="slide"
      className={Cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal"
          ? "pl-4"
          : "pt-4",
        className,
      )}
      {...props}
    />
  );
}

// ! Nút chuyển về slide trước
function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const {
    orientation,
    scrollPrev,
    canScrollPrev,
  } = CarouselHook();

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      className={Cn(
        "absolute touch-manipulation rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      {...props}
    >
      <ChevronLeftIcon className="Cn-rtl-flip" />
      <span className="sr-only">
        Previous slide
      </span>
    </Button>
  );
}

// ! Nút chuyển sang slide tiếp theo
function CarouselNext({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const {
    orientation,
    scrollNext,
    canScrollNext,
  } = CarouselHook();

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      disabled={!canScrollNext}
      onClick={scrollNext}
      className={Cn(
        "absolute touch-manipulation rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      {...props}
    >
      <ChevronRightIcon className="Cn-rtl-flip" />
      <span className="sr-only">
        Next slide
      </span>
    </Button>
  );
}

// ! Export
export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselHook,
};