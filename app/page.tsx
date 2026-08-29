'use client';

import React from 'react';
import Hero from '@/components/home/Hero';
import TrustStrip from '@/components/home/TrustStrip';
import FeatureBento from '@/components/home/FeatureBento';
import HowItWorks from '@/components/home/HowItWorks';
import FeaturedCourses from '@/components/home/FeaturedCourses';
import Testimonials from '@/components/home/Testimonials';
import Pricing from '@/components/home/Pricing';
import Faq from '@/components/home/Faq';
import CtaBanner from '@/components/home/CtaBanner';

export default function HomePage() {
  return (
    <div className="w-full bg-background overflow-x-hidden min-h-screen text-foreground select-none">
      <Hero />
      <TrustStrip />
      <FeatureBento />
      <HowItWorks />
      <FeaturedCourses />
      <Testimonials />
      <Pricing />
      <Faq />
      <CtaBanner />
    </div>
  );
}
