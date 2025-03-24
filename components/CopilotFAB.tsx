"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, Loader2, X } from "lucide-react";
import Card from "../components/ui/card";
import CardContent from "../components/ui/card";
import { Button } from "@/components/ui/button";
import { createUser, getPatient } from "@/lib/actions/patient.actions";
import { databases } from "@/lib/appwrite.config";

const YOUR_OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
export default function CopilotFAB() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<
    { sender: string; text: string; time: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const userMessage = { sender: "user", text: input, time: timestamp };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${YOUR_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "You are a helpful medical assistant.",
              },
              { role: "user", content: input },
            ],
          }),
        }
      );

      const data = await response.json();
      const botMessage = {
        sender: "bot",
        text: data.choices[0].message.content,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Error fetching response. Please try again.",
          time: timestamp,
        },
      ]);
    }

    setLoading(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end">
      {open && (
        <Card className="w-[26rem] h-[34rem] shadow-xl border p-4 bg-zinc-900 flex flex-col rounded-xl animate-fade-in overflow-scroll-y">
          <div className="flex flex-col justify-between p-2 ">
            <span className="font-semibold text-2xl flex justify-start pb-4">
              Hi There!
            </span>
            <span className="font-semibold text-sm text-zinc-400">
              Founders of CarePulse here. Ask us anything or give your feedback.
            </span>
          </div>
          <CardContent className="bg-zinc-900 flex flex-col flex-grow overflow-y-auto space-y-2 p-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg max-w-3/4 ${msg.sender === "user" ? "bg-green-500 text-white self-end" : "bg-zinc-800 text-white self-start"}`}
              >
                <div className="text-sm font-medium">{msg.text}</div>
                <div className="text-xs text-gray-600 mt-1">{msg.time}</div>
              </div>
            ))}
            {loading && (
              <div className="text-gray-500 text-sm flex items-center">
                <Loader2 className="animate-spin mr-2" /> Bot is typing...
              </div>
            )}
            <div ref={chatEndRef}></div>
          </CardContent>
          <div className="p-2 border-t flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="border p-2 rounded-lg flex-grow focus:outline-none focus:ring focus:ring-zinc-500"
            />
            <Button
              onClick={sendMessage}
              className="ml-2 mr-3 items-center bg-green-500 text-white rounded-lg p-5"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </Button>
          </div>
        </Card>
      )}
      <Button
        onClick={() => setOpen(!open)}
        className="rounded-full  py-8 px-6 m-7 bg-zinc-900 text-white shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-110 animate-bounce"
      >
        {open ? <X size={24} /> : <MessageCircle size={29} />}
      </Button>
    </div>
  );
}
