import { Navbar } from "@/components/website/Navbar";
import { Footer } from "@/components/website/Footer";
import { OnboardingFlow } from "@/components/website/OnboardingFlow";
import { InstallPrompt } from "@/components/website/InstallPrompt";

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <OnboardingFlow />
      <InstallPrompt />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
