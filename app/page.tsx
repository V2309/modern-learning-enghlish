'use client';

import React from 'react';
import Hero from '@/components/home/Hero';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import FeaturedCourses from '@/components/home/FeaturedCourses';
import HowItWorks from '@/components/home/HowItWorks';
import Pricing from '@/components/home/Pricing';
import Testimonials from '@/components/home/Testimonials';
import Faq from '@/components/home/Faq';
import Footer from '@/components/home/Footer';

const Home = () => {
  return (
    <div className="w-full bg-[#f8fafc] dark:bg-background overflow-x-hidden min-h-screen text-foreground select-none">
      <Hero />
      <WhyChooseUs />
      <FeaturedCourses />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <Faq />
   
    </div>
  );
};

export default Home;
