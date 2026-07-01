import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { FounderTimeline } from "@/components/home/founder-timeline";
import { Target, Users, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "About – Er G Engineering Hub Nepal",
  description:
    "Er G is Nepal's premier engineering resource platform providing district rates, consultancy, and professional resources for Nepal's engineers.",
  alternates: { canonical: "/about" },
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "About" },
];

const values = [
  {
    icon: Target,
    title: "Accuracy",
    description: "All district rates are sourced directly from official Government of Nepal publications.",
  },
  {
    icon: Users,
    title: "Accessibility",
    description: "Free access for every engineer, contractor, and construction professional in Nepal.",
  },
  {
    icon: Award,
    title: "Quality",
    description: "Professional-grade resources built to the highest standards of engineering practice.",
  },
];

const roadmap = [
  { label: "District Rate Database", status: "live" },
  { label: "Engineering Blog", status: "live" },
  { label: "Vacancy Portal", status: "live" },
  { label: "Building Design Tools", status: "soon" },
  { label: "Valuation Calculator", status: "soon" },
  { label: "Online Courses", status: "soon" },
  { label: "AI Assistant", status: "soon" },
];

export default function AboutPage() {
  return (
    <>
      <div className="bg-navy-950 py-12 px-4 border-b border-white/5">
        <div className="container-erg">
          <Breadcrumb items={breadcrumbs} className="mb-4 text-navy-400" />
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
            About Er G
          </h1>
          <p className="text-navy-300 text-base max-w-xl">
            Nepal's engineering resource and consultancy platform.
          </p>
        </div>
      </div>

      <div className="container-erg py-14">
        <div className="max-w-2xl mb-16">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4 text-[15px]">
            Er G was built with one goal: to make engineering data accessible to every professional
            across Nepal — free, fast, and reliable. We believe engineers should never struggle to
            find official district rates or construction cost data.
          </p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-[15px]">
            We publish official district rates for all 77 districts, updated every fiscal year. Coming
            soon: building design tools, valuation calculators, engineering notes, vacancies, and more.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-10">
            {values.map((v) => (
              <div key={v.title} className="card-base p-5">
                <div className="w-10 h-10 bg-navy-50 dark:bg-navy-900/40 rounded-xl flex items-center justify-center mb-3">
                  <v.icon className="w-5 h-5 text-navy-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1.5">{v.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline, certifications, experience metrics */}
        <div className="max-w-4xl mb-16">
          <FounderTimeline />
        </div>

        <div className="max-w-2xl border-t border-gray-100 dark:border-gray-800 pt-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Platform Roadmap</h2>
          <div className="space-y-0">
            {roadmap.map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                <span className={
                  item.status === "live"
                    ? "text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full"
                    : "text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full"
                }>
                  {item.status === "live" ? "Live" : "Coming Soon"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
