import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ReportCheckClient } from "@/components/report-check/ReportCheckClient";

export const metadata: Metadata = {
  title: "AI Report Reviewer – Er G Engineering Hub Nepal",
  description:
    "Upload your PDF or DOCX report, thesis, DPR, BOQ, or estimate. Our AI reviews it issue by issue — grammar, citations, formatting, and more.",
  alternates: { canonical: "/report-check" },
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "AI Report Reviewer" },
];

export default function ReportCheckPage() {
  return (
    <section className="relative overflow-hidden bg-navy-950 min-h-[calc(100vh-4rem)]">
      {/* Premium animated gradient mesh, consistent with the homepage hero */}
      <div className="absolute inset-0 mesh-gradient animate-gradient-shift pointer-events-none" />

      {/* Hero background image at low opacity with a dark overlay for readability */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/hero-bg1.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.18]"
        />
        <div className="absolute inset-0 bg-navy-950/70" />
      </div>

      {/* Ambient floating orbs, matching homepage hero */}
      <div className="absolute top-10 right-[8%] w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-0 left-[5%] w-80 h-80 bg-navy-500/20 rounded-full blur-3xl animate-float-slow pointer-events-none" />

      <div className="container-erg relative py-14 md:py-20">
        <Breadcrumb items={breadcrumbs} className="mb-8 text-navy-300" />

        <div className="text-center max-w-2xl mx-auto mb-12 animate-erg-fade-up">
          <div className="flex items-center justify-center gap-2.5 mb-5">
            <span className="inline-block w-6 h-px bg-accent" />
            <span className="text-accent text-xs font-semibold tracking-[0.18em] uppercase">
              AI-Powered Document Review
            </span>
            <span className="inline-block w-6 h-px bg-accent" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white leading-[1.1] tracking-tight mb-5">
            AI Report Reviewer
          </h1>
          <p className="text-navy-300 text-base md:text-lg leading-relaxed">
            Upload your PDF or DOCX document. Our AI will carefully review your document,
            identify issues one by one, and help improve the quality of your report.
          </p>
        </div>

        <div className="animate-erg-scale-in" style={{ animationDelay: "0.1s" }}>
          <ReportCheckClient />
        </div>
      </div>
    </section>
  );
}
