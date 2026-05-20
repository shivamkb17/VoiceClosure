import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Demo — VoiceCloser AI",
  description:
    "Try VoiceCloser AI live. Pick a scenario — dental clinic, salon, law firm, or restaurant — and experience AI-powered voice reception.",
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
