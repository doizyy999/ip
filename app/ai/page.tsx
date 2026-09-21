import { ChatBox } from "@/components/ai/ChatBox";

export const metadata = { title: "TRACE — AI Assistant" };

export default function AiPage() {
  return (
    <div className="space-y-4 py-10">
      <h1 className="font-mono text-2xl font-bold tracking-widest text-cyber-cyan">
        AI ASSISTANT
      </h1>
      <p className="text-sm text-zinc-500">
        Powered by Groq. Streaming, markdown, quick actions. History tersimpan lokal.
      </p>
      <ChatBox />
    </div>
  );
}
