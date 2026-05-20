import type { Metadata } from "next";
import { getScenarioById } from "@/lib/prompts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ scenario: string }>;
}): Promise<Metadata> {
  const { scenario: scenarioId } = await params;
  const scenario = getScenarioById(scenarioId);

  if (!scenario) {
    return { title: "Demo — VoiceCloser AI" };
  }

  return {
    title: `${scenario.name} Demo — VoiceCloser AI`,
    description: scenario.description,
  };
}

export default function ScenarioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
