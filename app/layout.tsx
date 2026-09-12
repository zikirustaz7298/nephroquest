import type { Metadata } from "next";
import "./globals.css";
import "./woodland.css";
import Shell from '../components/Shell';

export const metadata: Metadata = {
  title: "NephroQuest — Case-Based Nephrology Learning",
  description:
    "Diagnose-and-manage simulation for nephrology: order labs, interpret results, manage patients, get scored on clinical accuracy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><Shell>{children}</Shell></body>
    </html>
  );
}
