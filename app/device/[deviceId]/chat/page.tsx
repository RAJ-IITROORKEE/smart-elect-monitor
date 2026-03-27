import { notFound } from "next/navigation";

type ChatPageProps = {
  params: Promise<{ deviceId: string }>;
};

export default async function DeviceChatPage({ params }: ChatPageProps) {
  const { deviceId } = await params;

  if (!deviceId) {
    notFound();
  }

  return (
    <div className="mx-auto flex h-screen max-w-6xl items-center justify-center px-4">
      <div className="w-full rounded-xl border border-border/60 bg-card p-6 text-center">
        <h1 className="text-xl font-semibold">Device Chat Placeholder</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          AI chat for <span className="font-mono text-foreground">{deviceId}</span> is currently in progress.
        </p>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: ChatPageProps) {
  const { deviceId } = await params;
  return {
    title: `Chat - ${deviceId} | VoltEdge`,
    description: `Device chat workspace for ${deviceId} (frontend placeholder).`,
  };
}
