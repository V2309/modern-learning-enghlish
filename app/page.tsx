'use client';

import React from 'react';
import Hero from '@/components/home/Hero';
import ImpactStatement from '@/components/home/ImpactStatement';
import FeatureBento from '@/components/home/FeatureBento';
import NumberedFeatures from '@/components/home/NumberedFeatures';
import Testimonials from '@/components/home/Testimonials';
import Pricing from '@/components/home/Pricing';
import Faq from '@/components/home/Faq';
import CtaBanner from '@/components/home/CtaBanner';

export default function HomePage() {
  return (
    <div className="w-full bg-clay-bg overflow-x-hidden min-h-screen text-foreground select-none relative transition-colors">
      {/* 1. Hero 3D Section */}
      <Hero />

      {/* 2. Dynamic Impact Counter Banner */}
      <ImpactStatement />

      {/* 3. 3D Bento Grid ("Our Approach") */}
      <FeatureBento />

      {/* 4. Key Metrics & Interactive Numbered Features (01, 02, 03) */}
      <NumberedFeatures />

      {/* 5. GSAP + ScrollTrigger Pinned Kinetic Testimonials Gallery */}
      <Testimonials />

      {/* 6. Pricing & Flexible Plans */}
      <Pricing />

      {/* 7. Frequently Asked Questions Accordion */}
      <Faq />

      {/* 8. High-Conversion 3D CTA Banner */}
      <CtaBanner />
    </div>
  );
}
