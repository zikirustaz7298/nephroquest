import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NephroQuest — Case-Based Nephrology Learning",
  description:
    "Diagnose-and-manage simulation for nephrology: order labs, interpret results, manage patients, get scored on clinical accuracy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
