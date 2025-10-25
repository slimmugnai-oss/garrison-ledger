"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Success() {
  const router = useRouter();
  useEffect(() => {
    const path = localStorage.getItem("gl:lastTool");
    if (path) {
      localStorage.removeItem("gl:lastTool");
      router.replace(path);
    } else {
      router.replace("/dashboard");
    }
  }, [router]);
  return <div className="p-6">Activating your access…</div>;
}

