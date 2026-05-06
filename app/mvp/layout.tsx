import React from "react";
import { Shell } from "@/components/layout/Shell";

export default function MVPLayout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}
