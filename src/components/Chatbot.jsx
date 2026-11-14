import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, RotateCcw, User } from "lucide-react";

const SUGGESTIONS = [
  "Suggest a quick vegetarian dinner",
  "What can I cook with eggs and rice?",
  "Give me a famous dish from Italy",
];

export default function ChatBot({ api, showMessage }) {
  const [messages, setMessages] = useState([]); // [{ role: "user" | "assistant", content }]
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // One id per conversation. The backend uses it to remember the chat history.
  const sessionIdRef = useRef(crypto.randomUUID());
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const message = text.trim();
    if (!message || loading) return;

    setInput("");
    setLoading(true);
    // add the user's message and an empty assistant message that we fill while streaming
    setMessages((prev) => [
      ...prev,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);

    const updateLastMessage = (content) =>
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content };
        return copy;
      });

    try {
      // axios can't stream in the browser, so we use fetch but reuse axios's baseURL
      const baseURL = api.defaults.baseURL || "";
      const res = await fetch(`${baseURL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // send cookies, same as the rest of your app
        body: JSON.stringify({ sessionId: sessionIdRef.current, message }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Something went wrong");
      }

      // read the response piece by piece as the LLM generates it
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        updateLastMessage(full);
      }
    } catch (err) {
      updateLastMessage("Sorry, I couldn't get an answer. Please try again.");
      showMessage?.(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const newChat = () => {
    setMessages([]);
    sessionIdRef.current = crypto.randomUUID(); // new id = fresh memory
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-100">
          <Bot size={20} className="text-cyan-400" /> AI Recipe Assistant
        </h2>
        <button
          onClick={newChat}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 py-2 px-3 rounded-xl bg-[#0d121f] border border-slate-800 transition-all"
        >
          <RotateCcw size={14} /> New chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.length === 0 && (
          <div className="text-center mt-16">
            <Bot size={40} className="mx-auto text-cyan-400 mb-3" />
            <p className="text-sm text-slate-400 mb-5">
              Ask me anything about recipes and cooking.
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
          <div
            key={i}
            className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && (
              <div className="w-8 h-8 shrink-0 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Bot size={16} className="text-cyan-400" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-cyan-500 text-black"
                  : "bg-[#0d121f] border border-slate-800 text-slate-200"
              }`}
            >
              {m.content || (loading && i === messages.length - 1 ? "Thinking..." : "")}
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
      <form onSubmit={handleSubmit} className="flex gap-2 pt-4 mt-2 border-t border-slate-800/80">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a recipe..."
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