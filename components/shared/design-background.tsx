"use client";

import * as React from "react";

export function DesignBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] opacity-20 blur-[120px]"
        style={{
          background: "radial-gradient(circle, oklch(0.6 0.15 260) 0%, transparent 70%)"
        }}
      />
      <div 
        className="absolute bottom-0 right-0 w-[600px] h-[600px] opacity-10 blur-[100px]"
        style={{
          background: "radial-gradient(circle, oklch(0.7 0.1 200) 0%, transparent 70%)"
        }}
      />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
    </div>
  );
}
