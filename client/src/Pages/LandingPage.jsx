import React, { lazy, Suspense } from "react";
const Section = lazy(() => import("../Component/Section/Section"));
const Section1 = lazy(() => import("../Component/Section/Section1"));
const Section2 = lazy(() => import("../Component/Section/Section2"));
const Section3 = lazy(() => import("../Component/Section/Section3"));
const Section4 = lazy(() => import("../Component/Section/Section4"));
const Section5 = lazy(() => import("../Component/Section/Section5"));
const Section6 = lazy(() => import("../Component/Section/Section6"));
const Section7 = lazy(() => import("../Component/Section/Section7"));
import './LandingPage.css'

const LandingPage = () => {
  return (
    <div className="main-container">
      <Suspense fallback={<div>Loading...</div>}>
        <Section />
      </Suspense>
        <div className="landingpage-container">
          <Suspense fallback={<div>Loading...</div>}>
            <Section1 />
          </Suspense>
          <Suspense fallback={<div>Loading...</div>}>
            <Section2 />
          </Suspense>
          <Suspense fallback={<div>Loading...</div>}>
            <Section3 />
          </Suspense>
          <Suspense fallback={<div>Loading...</div>}>
            <Section4 />
          </Suspense>
          <Section5 />
          <Suspense fallback={<div>Loading...</div>}>
            <Section6 />
          </Suspense>
          <Suspense fallback={<div>Loading...</div>}>
            <Section7 />
          </Suspense>
        </div>
      </div>
      
  );
};

export default LandingPage;
