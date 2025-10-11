"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function AnimatedCard({ children, className = "" }: Props) {
  return (
    <div
      className={
        "rounded-2xl border border-slate-200 bg-white shadow-sm transition-transform duration-200 will-change-transform hover:shadow-md hover:-translate-y-0.5 " +
        className
      }
    >
      {children}
    </div>
  );
}


