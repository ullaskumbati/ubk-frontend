import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, RotateCcw, User, Paperclip, FileText, X, Loader2 } from "lucide-react";

const SUGGESTIONS = [
  "Summarize my document",
  "What are the key points?",
  "Hi! What can you do?",
];

export default function ChatBot({ api, showMessage }) {
  const [messages, setMessages] = useState([]); // [{ role, content, sources? }]
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);

  const sessionIdRef = useRef(crypto.randomUUID());
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadDocs = async () => {
    try {
      const res = await api.get("/documents");
      setDocs(res.data.data || []);
    } catch {
      /* the list is optional, so stay quiet */
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const errorText = (err) => err?.response?.data?.message || err?.message || "Something went wrong";

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allows picking the same file again
    if (!file) return;
    if (file.type !== "application/pdf") {
      showMessage?.("Only PDF files are supported right now", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showMessage?.("File too large (max 10 MB)", "error");
      return;
    }

    const form = new FormData();
    form.append("file", file);
    setUploading(true);
    try {
      await api.post("/documents/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showMessage?.(`"${file.name}" uploaded and indexed`);
      await loadDocs();
    } catch (err) {
      showMessage?.(errorText(err), "error");
    } finally {
      setUploading(false);
    }
  };

  const removeDoc = async (id) => {
    try {
      await api.delete(`/documents/${id}`);
      setDocs((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      showMessage?.(errorText(err), "error");
    }
  };

  const sendMessage = async (text) => {
    const message = text.trim();
    if (!message || loading) return;

    setInput("");
    setLoading(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);

    const updateLast = (patch) =>
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { ...copy[copy.length - 1], ...patch };
        return copy;
      });

    try {
      const baseURL = api.defaults.baseURL || "";
      const res = await fetch(`${baseURL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId: sessionIdRef.current, message }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || "Something went wrong");
      }

      // sources arrive in a header (backend must expose it in CORS)
      try {
        const header = res.headers.get("X-Sources");
        if (header) updateLast({ sources: JSON.parse(decodeURIComponent(header)) });
      } catch {
        /* ignore a bad header */
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        updateLast({ content: full });
      }
    } catch (err) {
      updateLast({ content: "Sorry, I couldn't get an answer. Please try again." });
      showMessage?.(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => {
    setMessages([]);
    sessionIdRef.current = crypto.randomUUID();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-100">
          <Bot size={20} className="text-cyan-400" /> AI Document Assistant
        </h2>
        <button
          onClick={newChat}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 py-2 px-3 rounded-xl bg-[#0d121f] border border-slate-800 transition-all"
        >
          <RotateCcw size={14} /> New chat
        </button>
      </div>

      {/* Uploaded documents */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {docs.map((d) => (
          <span
            key={d._id}
            className="flex items-center gap-1.5 text-[11px] text-slate-300 pl-2.5 pr-1.5 py-1 rounded-full bg-[#0d121f] border border-slate-800"
          >
            <FileText size={12} className="text-cyan-400" />
            <span className="max-w-[160px] truncate">{d.fileName}</span>
            <button
              onClick={() => removeDoc(d._id)}
              title="Remove"
              className="text-slate-500 hover:text-red-400"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        {docs.length === 0 && (
          <span className="text-[11px] text-slate-500">
            No documents yet. Upload a PDF to chat with it.
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.length === 0 && (
          <div className="text-center mt-14">
            <Bot size={40} className="mx-auto text-cyan-400 mb-3" />
            <p className="text-sm text-slate-400 mb-5">
              Upload a PDF and ask questions about it, or just chat.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs text-slate-300 px-3 py-2 rounded-xl bg-[#0d121f] border border-slate-800 hover:border-cyan-500 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-8 h-8 shrink-0 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Bot size={16} className="text-cyan-400" />
              </div>
            )}
            <div className="max-w-[80%]">
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-cyan-500 text-black"
                    : "bg-[#0d121f] border border-slate-800 text-slate-200"
                }`}
              >
                {m.content || (loading && i === messages.length - 1 ? "Thinking..." : "")}
              </div>
              {m.sources?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {m.sources.map((s, j) => (
                    <span
                      key={j}
                      className="flex items-center gap-1 text-[10px] text-slate-400 px-2 py-0.5 rounded-full bg-[#0d121f] border border-slate-800"
                    >
                      <FileText size={10} className="text-cyan-400" />
                      <span className="max-w-[140px] truncate">{s.fileName}</span> · p.{s.page}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {m.role === "user" && (
              <div className="w-8 h-8 shrink-0 rounded-full bg-slate-800 flex items-center justify-center">
                <User size={16} className="text-slate-300" />
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="flex gap-2 pt-4 mt-2 border-t border-slate-800/80"
      >
        <input ref={fileRef} type="file" accept="application/pdf" onChange={handleUpload} className="hidden" />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          title="Upload a PDF"
          className="flex items-center justify-center w-12 rounded-xl bg-[#0d121f] border border-slate-800 text-slate-300 hover:border-cyan-500 transition-all disabled:opacity-50"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={uploading ? "Indexing your PDF..." : "Ask about your documents..."}
          disabled={loading}
          className="flex-1 bg-[#0d121f] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex items-center gap-2 px-5 rounded-xl bg-cyan-500 text-black text-sm font-semibold hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={16} /> Send
        </button>
      </form>
    </div>
  );
}