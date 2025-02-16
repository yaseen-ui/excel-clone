"use client";

import React, { useState } from "react";
import Excel from "./components/Excel";

const Home = () => {
  return (
    <div className="flex flex-col h-screen w-screen">
      <Excel />
    </div>
  );
};

export default Home;
