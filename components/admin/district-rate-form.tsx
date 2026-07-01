"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDistrictRateSchema, type CreateDistrictRateInput } from "@/lib/validations/district-rate";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Save, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface District {
  id: string;
  name: string;
  province: { name: string };
}
interface FiscalYear {
  id: string;
  year: string;
}

interface Props {
  districts: District[];
  fiscalYears: FiscalYear[];
  defaultValues?: Partial<CreateDistrictRateInput>;
  districtRateId?: string;
}

export function DistrictRateForm({ districts, fiscalYears, defaultValues, districtRateId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateDistrictRateInput>({
    resolver: zodResolver(createDistrictRateSchema),
    defaultValues: {
      status: "DRAFT",
      ...defaultValues,
    },
  });

  const onSubmit = async (data: CreateDistrictRateInput) => {
    setLoading(true);
    setError(null);

    try {
      const url = districtRateId
        ? `/api/admin/district-rates/${districtRateId}`
        : "/api/admin/district-rates";
      const method = districtRateId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to save");
      }

      router.push("/admin/district-rates");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statusValue = watch("status");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="card-base p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Basic Information</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              District <span className="text-red-500">*</span>
            </label>
            <select {...register("districtId")} className="input-base">
              <option value="">Select district...</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.province.name})
                </option>
              ))}
            </select>
            {errors.districtId && (
              <p className="mt-1.5 text-sm text-red-600">{errors.districtId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Fiscal Year <span className="text-red-500">*</span>
            </label>
            <select {...register("fiscalYearId")} className="input-base">
              <option value="">Select fiscal year...</option>
              {fiscalYears.map((fy) => (
                <option key={fy.id} value={fy.id}>{fy.year}</option>
              ))}
            </select>
            {errors.fiscalYearId && (
              <p className="mt-1.5 text-sm text-red-600">{errors.fiscalYearId.message}</p>
            )}
          </div>
        </div>

        <Input
          label="PDF URL"
          {...register("pdfUrl")}
          error={errors.pdfUrl?.message}
          placeholder="https://files.erg.com.np/district-rates/..."
          hint="Upload to Cloudflare R2 or similar storage first, then paste the URL here"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="PDF Size (bytes)"
            type="number"
            {...register("pdfSize", { valueAsNumber: true })}
            error={errors.pdfSize?.message}
            placeholder="1024000"
          />
          <Input
            label="Number of Pages"
            type="number"
            {...register("pdfPages", { valueAsNumber: true })}
            error={errors.pdfPages?.message}
            placeholder="45"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Description (optional)
          </label>
          <textarea
            {...register("description")}
            rows={3}
            className="input-base resize-none"
            placeholder="Brief description about this district rate..."
          />
        </div>
      </div>

      <div className="card-base p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">SEO (optional)</h2>
        <Input
          label="SEO Title"
          {...register("seoTitle")}
          error={errors.seoTitle?.message}
          placeholder="District Rate of Kathmandu 2083-84 – Download PDF | Er G Nepal"
          hint="Max 70 characters. Leave blank for auto-generation."
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            SEO Description
          </label>
          <textarea
            {...register("seoDescription")}
            rows={2}
            className="input-base resize-none"
            placeholder="Download the official district rate of Kathmandu for fiscal year 2083-84..."
          />
          <p className="mt-1.5 text-xs text-gray-400">Max 160 characters. Leave blank for auto-generation.</p>
        </div>
      </div>

      <div className="card-base p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Publication Status</h2>
        <div className="flex gap-3">
          {(["DRAFT", "PUBLISHED", "ARCHIVED"] as const).map((s) => (
            <label
              key={s}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all flex-1",
                statusValue === s
                  ? "border-navy-600 bg-navy-50 dark:bg-navy-900/20 text-navy-700 dark:text-navy-300"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
              )}
            >
              <input
                type="radio"
                value={s}
                {...register("status")}
                className="sr-only"
              />
              <span className="text-sm font-medium capitalize">{s.toLowerCase()}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={loading} leftIcon={<Save className="w-4 h-4" />} className="flex-1">
          {districtRateId ? "Update District Rate" : "Save District Rate"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
