"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage, type ChatMsg } from "./ChatMessage";
import { QuickActions } from "./QuickActions";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

const MODELS = [
  { key: "fast", label: "Fast (Llama 3.1 8B)" },
  { key: "smart", label: "Smart (Llama 3.3 70B)" },
  { key: "coding", label: "Coding (Qwen 2.5 Coder)" },
] as const;

const STORAGE_KEY = "trace:chat";

export function ChatBox({ contextData }: { contextData?: unknown }) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState<string>("smart");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    let finalContent = content;
    if (contextData) {
      finalContent = `${content}\n\nKonteks data scan:\n${JSON.stringify(contextData).slice(0, 3000)}`;
    }
    const next: ChatMsg[] = [...messages, { role: "user", content: finalContent }];
    setMessages([...messages, { role: "user", content }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.slice(-20).map((m) => ({ role: m.role, content: m.content })),
          model,
        }),
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const snapshot = acc;
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: snapshot };
          return copy;
        });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chat gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-xl border border-zinc-800 bg-zinc-900/60">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-300"
        >
          {MODELS.map((m) => (
            <option key={m.key} value={m.key}>{m.label}</option>
          ))}
        </select>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setMessages([]);
            localStorage.removeItem(STORAGE_KEY);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="space-y-3 pt-8 text-center">
            <p className="font-mono text-sm text-zinc-500">
              Tanya apa aja soal OSINT, analisis data, atau minta bikin laporan.
            </p>
            <QuickActions onPick={(p) => send(p)} disabled={loading} />
          </div>
        )}
        {messages.map((m, i) => (
          <ChatMessage key={i} msg={m} />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-zinc-800 p-3">
        {messages.length > 0 && (
          <div className="mb-2">
            <QuickActions onPick={(p) => send(p)} disabled={loading} />
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
            placeholder="Ketik pertanyaan..."
            className="h-10 flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-cyber-cyan focus:outline-none"
            disabled={loading}
          />
          <Button onClick={() => send()} disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
