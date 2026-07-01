import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { FounderSection } from "@/components/home/founder-section";
import { AboutMe } from "@/components/home/about-me";
import { LatestRates } from "@/components/home/latest-rates";
import  GaneshPostPreview  from "@/components/home/ganesh-post-preview";
import { VacancyPreview } from "@/components/home/vacancy-preview";
import { Features } from "@/components/home/features";
import { ContactSection } from "@/components/home/contact-section";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Er G – Engineering Hub Nepal | District Rate Database",
  description:
    "Download official district rates for all 77 districts of Nepal. Free PDF, engineering blog, job vacancies, and professional resources by Ganesh Chapagain.",
};

export const revalidate = 3600;

async function getLatestRates() {
  try {
    return await prisma.districtRate.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 8,
      include: {
        district: { include: { province: { select: { name: true } } } },
        fiscalYear: { select: { year: true } },
      },
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const latestRates = await getLatestRates();

  return (
    <>
      <Hero />
      <FounderSection />
      <AboutMe />
      <LatestRates rates={latestRates as any} />
      <GaneshPostPreview />
      <VacancyPreview />
      <Features />
      <ContactSection />
    </>
  );
}
