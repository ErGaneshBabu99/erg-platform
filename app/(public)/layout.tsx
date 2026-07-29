import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FloatingAssistant } from "@/components/ai-assistant/floating-assistant";
import { AmbientBackground } from "@/components/layout/ambient-background";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AmbientBackground />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <FloatingAssistant />
    </>
  );
}

