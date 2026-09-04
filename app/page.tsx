import Navbar from '@/components/navbar';
import Hero from '@/components/hero';
import TrustedBy from '@/components/trusted-by';
import Features from '@/components/features';
import Workflow from '@/components/workflow';
import AiEngine from '@/components/ai-engine';
import Stakeholders from '@/components/stakeholders';
import Metrics from '@/components/metrics';
import Testimonials from '@/components/testimonials';
import Pricing from '@/components/pricing';
import Faq from '@/components/faq';
import Footer from '@/components/footer';

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white antialiased">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <Workflow />
      <AiEngine />
      <Stakeholders />
      <Metrics />
      <Testimonials />
      <Pricing />
      <Faq />
      <Footer />
    </main>
  );
}
