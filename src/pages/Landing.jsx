import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import StorySection from '../components/landing/StorySection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import FeaturedProducts from '../components/landing/FeaturedProducts';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

export default function Landing() {
  return (
    <div>
      <HeroSection />
      <StorySection />
      <HowItWorksSection />
      <FeaturedProducts />
      <CTASection />
      <Footer />
    </div>
  );
}