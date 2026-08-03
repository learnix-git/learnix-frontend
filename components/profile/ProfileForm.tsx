"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  IconLink,
  IconMapPin,
  IconUserCircle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";

import { updateUserInfo } from "@/lib/api/user";
export type OwnerItem = any;
export type SaveOwnerInfoRequest = any;
const saveOwnerInfo = updateUserInfo;
const saveOwnerInfoSchema = { safeParse: (d: any) => ({ success: true, data: d }) } as any;
const normalizeAlias = (s: string) => s;
import { Cn } from "@/lib/utils";

type FieldErrors = Partial<Record<"alias" | "about" | "city", string>>;

interface OwnerProfileFormProps {
  /** `create` yêu cầu alias + city bắt buộc; `edit` chỉ gửi field đã đổi. */
  mode: "create" | "edit";
  /** Dữ liệu khởi tạo khi edit (alias/about/locationCity). */
  initial?: Partial<OwnerItem> | undefined;
  /**
   * Được gọi sau khi save thành công. Không truyền item vì BE `save-owner-info`
   * chỉ trả về partial (alias/about/locationCity/status) — thiếu
   * `totalProjects`, `hiredFreelancers`, `user`. Page cha nên refetch
   * `getMyOwnerInfo()` để có full data trước khi render.
   */
  onSuccess: () => void;
  /** Optional — nếu có sẽ hiển thị nút Hủy. */
  onCancel?: () => void;
  submitLabel?: string;
}

export function ProfileForm({
  mode,
  initial,
  onSuccess,
  onCancel,
  submitLabel,
}: OwnerProfileFormProps) {
  const cities = [] as any[];

  const [alias, setAlias] = useState(initial?.alias ?? "");
  const [about, setAbout] = useState(initial?.about ?? "");
  const [cityId, setCityId] = useState<string | null>(
    initial?.locationCity ? String(initial.locationCity.id) : null
  );
  const [aliasTouched, setAliasTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Re-sync state khi `initial` thay đổi (vd: sau khi load xong `getMyOwnerInfo`).
  useEffect(() => {
    setAlias(initial?.alias ?? "");
    setAbout(initial?.about ?? "");
    setCityId(initial?.locationCity ? String(initial.locationCity.id) : null);
    setAliasTouched(false);
    setFieldErrors({});
    setFormError(null);
  }, [initial?.alias, initial?.about, initial?.locationCity?.id]);

  // Auto-normalize alias khi user paste / nhập tiếng Việt có dấu.
  useEffect(() => {
    if (mode !== "create" || !aliasTouched) return;
    const normalized = normalizeAlias(alias);
    if (normalized && normalized !== alias) {
      setAlias(normalized);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aliasTouched]);

  // Khi edit, lưu giá trị gốc để biết field nào đã đổi.
  const baseline = useMemo(
    () => ({
      alias: initial?.alias ?? "",
      about: initial?.about ?? "",
      cityId: initial?.locationCity ? String(initial.locationCity.id) : null,
    }),
    [initial?.alias, initial?.about, initial?.locationCity?.id]
  );

  const isDirty =
    alias !== baseline.alias ||
    about !== baseline.about ||
    cityId !== baseline.cityId;

  // City options cho Combobox — cache từ useGeneralStore (TTL 6h).
  const cityOptions = useMemo(
    () => cities.map((c) => ({ value: String(c.id), label: c.name })),
    [cities]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFieldErrors({});
    setFormError(null);

    const city = cityId ? Number(cityId) : undefined;
    const result = saveOwnerInfoSchema.safeParse({
      alias,
      about: about.trim() || "",
      city,
    });

    if (!result.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field === "alias" || field === "about" || field === "city") {
          nextErrors[field as keyof typeof nextErrors] = issue.message;
        }
      }
      setFieldErrors(nextErrors);

      const firstIssue = result.error.issues[0];
      toast.error(firstIssue?.message || "Vui lòng kiểm tra lại thông tin");
      return;
    }

    // Build body: create gửi alias + city + about; edit chỉ gửi field đã đổi.
    const body: Partial<SaveOwnerInfoRequest> = {};
    if (mode === "create") {
      body.alias = result.data.alias;
      if (result.data.about) body.about = result.data.about;
      if (result.data.city) body.city = result.data.city;
    } else {
      if (result.data.alias && result.data.alias !== baseline.alias) {
        body.alias = result.data.alias;
      }
      if ((about ?? "") !== baseline.about) {
        // Gửi kể cả rỗng — user muốn xóa thì BE nhận rỗng.
        body.about = about.trim();
      }
      const newCity = cityId ? Number(cityId) : null;
      if (newCity !== null && String(newCity) !== baseline.cityId) {
        body.city = newCity;
      }
    }

    if (mode === "edit" && Object.keys(body).length === 0) {
      toast.info("Bạn chưa thay đổi thông tin nào.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await saveOwnerInfo(body as SaveOwnerInfoRequest);
      if (res.data) {
        toast.success(
          mode === "create"
            ? "Tạo hồ sơ thành công!"
            : "Cập nhật hồ sơ thành công!"
        );
        onSuccess();
      } else {
        setFormError(res.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
        toast.error(res.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (error: unknown) {
      // Lỗi 409 — alias đã được dùng → hiện inline dưới form.
      const axiosError = error as {
        response?: { status?: number; data?: { msg?: string } };
      };
      if (axiosError?.response?.status === 409) {
        const msg = axiosError.response.data?.msg || "Alias đã được sử dụng";
        setFormError(msg);
        setFieldErrors((prev) => ({ ...prev, alias: msg }));
        toast.error(msg);
      } else {
        const message =
          error instanceof Error ? error.message : "Có lỗi xảy ra, vui lòng thử lại.";
        setFormError(message);
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ALIAS */}
      <div className="space-y-1.5">
        <label
          htmlFor="owner-alias"
          className="text-[13px] font-semibold text-foreground"
        >
          Alias <span className="text-destructive">*</span>
        </label>
        <div className="flex items-center gap-2 rounded-2xl border border-white/50 dark:border-white/10 bg-white/30 dark:bg-white/3 px-3 py-2 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20 transition-all backdrop-blur-xl">
          <span className="text-xs font-mono text-muted-foreground/70 select-none">
            learnix.vn/client/
          </span>
          <input
            id="owner-alias"
            type="text"
            value={alias}
            onChange={(e) => {
              const val = e.target.value.replace(/\s+/g, "");
              setAlias(val);
              setAliasTouched(true);
              if (fieldErrors.alias) {
                setFieldErrors((prev) => {
                  const { alias: _drop, ...rest } = prev;
                  return rest;
                });
              }
            }}
            placeholder="nguyen-van-a"
            disabled={submitting}
            className={Cn(
              "w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/60",
              "disabled:opacity-50 disabled:cursor-not-allowed resize-none mt-1"
            )}
            autoComplete="off"
            spellCheck={false}
          />
          {alias && (
            <a
              href={`/client/${alias}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
              title="Mở trang public"
            >
              <IconLink size={16} />
            </a>
          )}
        </div>
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] text-muted-foreground/80">
            URL công khai sẽ là{" "}
            <span className="font-mono font-semibold text-foreground/80">
              /client/{alias || "alias-cua-ban"}
            </span>
          </p>
          {fieldErrors.alias && (
            <p className="text-[11px] text-destructive font-medium">
              {fieldErrors.alias}
            </p>
          )}
        </div>
      </div>

      {/* CITY */}
      <div className="space-y-1.5">
        <Combobox
          label={mode === "create" ? "Tỉnh / Thành phố *" : "Tỉnh / Thành phố"}
          leftIcon={<IconMapPin size={16} />}
          options={cityOptions}
          value={cityId}
          onValueChange={(v) => {
            setCityId(v);
            if (fieldErrors.city) {
              setFieldErrors((prev) => {
                const { city: _drop, ...rest } = prev;
                return rest;
              });
            }
          }}
          placeholder={cities.length === 0 ? "Đang tải danh sách..." : "Chọn tỉnh/thành"}
          disabled={submitting || cities.length === 0}
          {...(initial?.locationCity?.name
            ? { defaultLabel: initial.locationCity.name }
            : {})}
        />
        {fieldErrors.city && (
          <p className="text-[11px] text-destructive font-medium">
            {fieldErrors.city}
          </p>
        )}
      </div>

      {/* ABOUT */}
      <div className="space-y-1.5">
        <label
          htmlFor="owner-about"
          className="text-[13px] font-semibold text-foreground flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <IconUserCircle size={16} className="text-muted-foreground" />
            Giới thiệu
          </span>
          <span
            className={Cn(
              "text-[10px] font-mono",
              about.length > 1000
                ? "text-destructive"
                : "text-muted-foreground/70"
            )}
          >
            {about.length}/1000
          </span>
        </label>
        <textarea
          id="owner-about"
          value={about}
          onChange={(e) => {
            setAbout(e.target.value);
            if (fieldErrors.about) {
              setFieldErrors((prev) => {
                const { about: _drop, ...rest } = prev;
                return rest;
              });
            }
          }}
          placeholder="Mô tả ngắn về doanh nghiệp / tổ chức của bạn, lĩnh vực hoạt động, phong cách làm việc..."
          rows={5}
          maxLength={1100}
          disabled={submitting}
          className={Cn(
            "w-full rounded-2xl border border-white/50 dark:border-white/10 bg-white/30 dark:bg-white/3 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all backdrop-blur-xl shadow-xs shadow-slate-200/50 dark:shadow-none resize-y",
            fieldErrors.about
              ? "border-destructive/50 focus:border-destructive focus:ring-destructive/20"
              : "",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        />
        {fieldErrors.about && (
          <p className="text-[11px] text-destructive font-medium">
            {fieldErrors.about}
          </p>
        )}
      </div>

      {/* FORM-LEVEL ERROR (e.g. 409 alias conflict) */}
      {formError && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-500/20 bg-rose-500/10 dark:bg-rose-500/5 px-4 py-3 text-sm text-rose-600 dark:text-rose-400"
        >
          {formError}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={submitting}
          >
            Hủy
          </Button>
        )}
        <Button
          type="submit"
          disabled={submitting || (mode === "edit" && !isDirty)}
          loading={submitting}
          className="min-w-[140px]"
        >
          {submitting
            ? "Đang lưu..."
            : submitLabel ?? (mode === "create" ? "Tạo hồ sơ" : "Lưu thay đổi")}
        </Button>
      </div>
    </form>
  );
}
