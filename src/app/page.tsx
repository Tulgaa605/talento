import HeroSection from "../components/HeroSection";
import ProcessSection from "../components/ProcessSection";
import { Footer } from "../components/Footer";
import JobListingSection from "../components/JobListingSection";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="relative bg-white w-full min-h-screen">
      <HeroSection />
      <ProcessSection />
      <JobListingSection />
      <Footer />
    </main>
  );
}
