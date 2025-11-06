import HeroSection from "../components/HeroSection";
import ProcessSection from "../components/ProcessSection";
import { Footer } from "../components/Footer";
import JobListingSection from "../components/JobListingSection";

// Home page - шинэ ажлын зарууд харагдах хэрэгтэй
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
