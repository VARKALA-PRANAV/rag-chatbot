import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Send, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";

const STORAGE_KEY = "messages";
const HISTORY_KEY = "chat-history";

const loadStoredMessages = () => {
  try {
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    return savedMessages ? JSON.parse(savedMessages) : [];
  } catch (error) {
    console.log(error);
    return [];
  }
};

const loadSavedHistory = () => {
  try {
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    return savedHistory ? JSON.parse(savedHistory) : [];
  } catch (error) {
    console.log(error);
    return [];
  }
};

const getChatTitle = (chatMessages) => {
  const firstUserMessage = chatMessages.find((msg) => msg.role === "user");
  const text = firstUserMessage?.content || "Untitled Chat";
  return text.length > 28 ? `${text.slice(0, 25)}...` : text;
};

function App() {
const [question, setQuestion] = useState("");
const [messages, setMessages] = useState(() => loadStoredMessages());
const [savedChats, setSavedChats] = useState(() => loadSavedHistory());
const [loading, setLoading] = useState(false);
const [historySaved, setHistorySaved] = useState(true);

const messagesEndRef = useRef(null);

useEffect(() => {
messagesEndRef.current?.scrollIntoView({
behavior: "smooth",
});
}, [messages, loading]);

useEffect(() => {
if (messages.length > 0) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  setHistorySaved(true);
} else {
  localStorage.removeItem(STORAGE_KEY);
}
}, [messages]);

const newChat = () => {
setMessages([]);
setQuestion("");
setHistorySaved(false);
localStorage.removeItem(STORAGE_KEY);
};

const saveHistory = () => {
if (messages.length === 0) return;

const newEntry = {
  id: Date.now().toString(),
  title: getChatTitle(messages),
  savedAt: new Date().toLocaleString(),
  messages: [...messages],
};

setSavedChats((prev) => {
  const updatedHistory = [newEntry, ...prev.filter((item) => item.id !== newEntry.id)];
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  return updatedHistory;
});

setHistorySaved(true);
};

const loadHistoryChat = (chat) => {
setMessages(chat.messages);
setQuestion("");
setHistorySaved(true);
};

const copyToClipboard = (text) => {
navigator.clipboard.writeText(text);
};

const sendMessage = async () => {
  const trimmedQuestion = question.trim();
  if (!trimmedQuestion || loading) return;

  const userMessage = {
    role: "user",
    content: trimmedQuestion,
  };

  setMessages((prev) => [...prev, userMessage]);
  setQuestion("");
  setLoading(true);

  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/chat",
      {
        question: userMessage.content,
      }
    );

    const botMessage = {
      role: "assistant",
      content: response.data.answer,
    };

    setMessages((prev) => [...prev, botMessage]);
  } catch (error) {
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "⚠️ Failed to get response from server.",
      },
    ]);

    console.log(error);
  } finally {
    setLoading(false);
  }
};

return (
    <div className="h-screen bg-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-5">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">RAG Assistant 🚀</h1>

        <button
          onClick={newChat}
          className="w-full bg-gray-100 hover:bg-gray-200 rounded-2xl p-4 transition"
        >
          + New Chat
        </button>

        <button
          onClick={saveHistory}
          disabled={messages.length === 0 || historySaved}
          className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {historySaved ? "History Saved" : "Save History"}
        </button>

        {savedChats.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Saved History
            </p>
            <div className="space-y-2">
              {savedChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => loadHistoryChat(chat)}
                  className="w-full rounded-2xl bg-gray-50 px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                >
                  <div className="font-medium">{chat.title}</div>
                  <div className="text-xs text-gray-400">{chat.savedAt}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col bg-white">

    {/* Header */}
    <div className="h-16 bg-white border-b border-gray-200 flex items-center px-8">
      <h1 className="text-2xl font-semibold">
        AI Assistant
      </h1>
    </div>

    {/* Messages */}
    <div className="flex-1 overflow-y-auto px-8 py-10 space-y-6 bg-white">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-700 text-center">
            What do you want to know?
          </h1>
        </div>
      ) : (
        messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-3xl rounded-3xl px-6 py-4 shadow-md ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              <ReactMarkdown>
                {msg.content}
              </ReactMarkdown>

              {msg.role === "assistant" && (
                <button
                  onClick={() => copyToClipboard(msg.content)}
                  className="mt-4 flex items-center gap-2 text-gray-500 hover:text-blue-600"
                >
                  <Copy size={16} />
                  Copy
                </button>
              )}
            </div>
          </div>
        ))
      )}

      {loading && (
        <div className="flex justify-start">
          <div className="bg-white border rounded-3xl px-6 py-5 shadow-lg">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef}></div>

    </div>

    {/* Input */}
    <div className="bg-white border-t border-gray-100 p-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="mx-auto flex w-full max-w-3xl items-center rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything..."
          className="flex-1 bg-transparent outline-none px-2 text-base text-gray-800 placeholder:text-gray-400"
        />

        <button
          type="button"
          onClick={() => sendMessage()}
          disabled={loading}
          className="ml-2 rounded-2xl bg-blue-600 p-3 text-white transition hover:bg-blue-500 disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
      </div>
    </div>
  );
}

export default App;
