import type { Metadata } from "next";
import { ContactSection } from "@/components/home/contact-section";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Contact Us – Er G Engineering Hub Nepal",
  description:
    "Contact Er G Nepal for district rates in Word/Excel format, engineering consultancy, or any inquiry. WhatsApp, call, or email us.",
  alternates: { canonical: "/contact" },
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Contact" },
];

export default function ContactPage() {
  return (
    <>
      <div className="bg-gradient-to-br from-navy-950 to-navy-700 py-12 px-4">
        <div className="container-erg">
          <Breadcrumb items={breadcrumbs} className="mb-4 text-navy-300" />
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
            Contact Us
          </h1>
          <p className="text-navy-200 text-lg max-w-xl">
            Reach out for district rates in Word/Excel format, engineering consultancy, or any other inquiry.
          </p>
        </div>
      </div>
      <ContactSection />
    </>
  );
}
