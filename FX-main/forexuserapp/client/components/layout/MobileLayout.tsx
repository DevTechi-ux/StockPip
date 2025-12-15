import { ReactNode } from "react";
import MobileNav from "@/components/trading/MobileNav";

export default function MobileLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <MobileNav />
    </>
  );
}





