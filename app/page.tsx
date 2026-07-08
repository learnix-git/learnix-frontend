import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { WhyChoose } from "@/components/home/WhyChoose";
import { Services } from "@/components/home/Services";
import { Benefits } from "@/components/home/Benefits";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Testimonials } from "@/components/home/Testimonials";
import { CTA } from "@/components/home/CTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <WhyChoose />
      <HowItWorks />
      <Features />
      <Benefits />
      <Testimonials />
      <CTA />
    </>
  );
}