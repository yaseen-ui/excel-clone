"use client";

import React, { useState } from "react";
import Timer from "./components/timer/Timer";
// import ZetaLayout from "./components/zeta/ZetaLayout";

const Home = () => {
  return (
    <div className="flex flex-col h-screen w-screen">
      {/* <ZetaLayout /> */}
      <Timer />
    </div>
  );
};

export default Home;
