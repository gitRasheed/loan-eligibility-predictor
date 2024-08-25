import React from 'react';
import dynamic from 'next/dynamic';

const EligibilityForm = dynamic(() => import('@/components/EligibilityForm'), { ssr: false });
const BackgroundEffect = dynamic(() => import('@/components/BackgroundEffect'), { ssr: false });
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false });

export default function Home() {
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <BackgroundEffect />
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold mb-8 text-center text-white">Loan Eligibility Checker</h1>
          <EligibilityForm />
          <Footer />
        </div>
      </main>
    </div>
  );
}