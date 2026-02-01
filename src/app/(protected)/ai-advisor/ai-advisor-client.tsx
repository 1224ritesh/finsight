"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { auth } from "@/lib/auth";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Send, Sparkles, Trash2 } from "lucide-react";

type MessagePart = {
  type: string;
  text: string;
};

interface AIAdvisorClientProps {
  session: typeof auth.$Infer.Session;
}

export default function AIAdvisorClient({ session }: AIAdvisorClientProps) {
  const STORAGE_KEY = `finsight-ai-chat-${session.user.id}`;
  const [annualCTC, setAnnualCTC] = useState("");
  const [taxRegime, setTaxRegime] = useState<"old" | "new">("new");
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai",
    }),
  });

  // Load messages from localStorage when session is ready
  useEffect(() => {
    if (typeof window !== "undefined" && session.user.id) {
      const savedMessages = localStorage.getItem(STORAGE_KEY);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    }
  }, [session.user.id, STORAGE_KEY, setMessages]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0 && session.user.id) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages, STORAGE_KEY, session.user.id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const clearChat = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([]);
  };

  const suggestedQuestions = [
    "How can I save tax legally?",
    "Is my monthly budget healthy?",
    "Where should I start investing first?",
    "What are the best tax-saving investment options?",
    "How much should I save each month?",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || status === "streaming") return;

    // Pass CTC and tax regime as request-level options
    await sendMessage(
      { text: inputValue },
      {
        body: {
          includeContext: true,
          ...(annualCTC &&
            !isNaN(parseFloat(annualCTC)) && {
              annualCTC: parseFloat(annualCTC),
              taxRegime: taxRegime,
            }),
        },
      },
    );
    setInputValue("");
  };

  const askSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto">
      {/* Header */}
      <div className="shrink-0 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8" />
            AI Financial Advisor
          </h1>
          <p className="text-gray-600 mt-2">
            Get personalized financial advice powered by AI
          </p>
        </div>
        {messages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear Chat
          </Button>
        )}
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-hidden bg-white border rounded-lg shadow-sm flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <Card className="max-w-2xl w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    Suggested Questions
                  </CardTitle>
                  <CardDescription>
                    Try asking one of these questions to get started
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {suggestedQuestions.map((sq, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3"
                      onClick={() => askSuggestion(sq)}
                    >
                      {sq}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-4 w-4 text-primary" />
                        <span className="text-xs font-semibold text-gray-600">
                          AI Advisor
                        </span>
                      </div>
                    )}
                    <div
                      className={`prose prose-sm max-w-none ${
                        message.role === "user" ? "prose-invert" : "prose-gray"
                      }`}
                    >
                      {message.parts
                        .filter((part) => part.type === "text")
                        .map((part: MessagePart, i: number) => (
                          <ReactMarkdown key={i} remarkPlugins={[remarkGfm]}>
                            {part.text}
                          </ReactMarkdown>
                        ))}
                    </div>
                  </div>
                </div>
              ))}

              {status === "streaming" && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-primary" />
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          Analyzing your finances...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="shrink-0 border-t bg-gray-50 p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error instanceof Error ? error.message : String(error)}
                </AlertDescription>
              </Alert>
            )}

            {/* Advanced Options */}
            <div className="space-y-3 p-3 border rounded-lg bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="annualCTC" className="text-xs">
                    Annual CTC (₹)
                  </Label>
                  <Input
                    id="annualCTC"
                    type="number"
                    placeholder="e.g., 1200000"
                    value={annualCTC}
                    onChange={(e) => setAnnualCTC(e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="taxRegime" className="text-xs">
                    Tax Regime
                  </Label>
                  <select
                    id="taxRegime"
                    value={taxRegime}
                    onChange={(e) =>
                      setTaxRegime(e.target.value as "old" | "new")
                    }
                    className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm"
                  >
                    <option value="new">New Regime</option>
                    <option value="old">Old Regime</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Textarea
                placeholder="Ask me anything about personal finance, taxes, investments..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                rows={2}
                className="resize-none flex-1"
                disabled={status === "streaming"}
              />
              <Button
                type="submit"
                size="icon"
                disabled={status === "streaming" || !inputValue.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Disclaimer */}
      <Alert className="mt-4 shrink-0">
        <Brain className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>Note:</strong> AI provides general guidance. Consult a
          certified financial professional for specific advice.
        </AlertDescription>
      </Alert>
    </div>
  );
}
