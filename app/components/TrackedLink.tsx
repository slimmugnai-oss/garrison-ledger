"use client";
import { track } from "@/lib/track";

export default function TrackedLink({ 
  href, 
  title, 
  children, 
  className,
  eventName = "resource_click"
}: { 
  href: string; 
  title: string; 
  children: React.ReactNode; 
  className?: string;
  eventName?: string;
}) {
  const handleClick = () => {
    track(eventName, { resource: title, url: href });
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}

