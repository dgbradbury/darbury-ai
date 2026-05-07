// ChatMessage — individual chat bubble
// User:      Teal #189B93 bg, Ink #191D23 text
// Assistant: Dark Teal #334B49 bg, Off-white #F0F2F3 text
// Typing:    three animated dots in Slate 500 #78919E

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isTyping?: boolean;
}

export default function ChatMessage({ role, content, isTyping }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className="max-w-[82%] px-3.5 py-2.5 text-sm leading-relaxed"
        style={{
          fontFamily: "var(--font-inter), Inter, sans-serif",
          backgroundColor: isUser ? "#189B93" : "#334B49",
          color: isUser ? "#191D23" : "#F0F2F3",
          borderRadius: isUser
            ? "1rem 1rem 0.25rem 1rem"
            : "1rem 1rem 1rem 0.25rem",
        }}
      >
        {isTyping ? (
          <span className="flex gap-1 items-center h-4">
            <span
              className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{ backgroundColor: "#78919E", animationDelay: "0ms" }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{ backgroundColor: "#78919E", animationDelay: "150ms" }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{ backgroundColor: "#78919E", animationDelay: "300ms" }}
            />
          </span>
        ) : (
          <span
            dangerouslySetInnerHTML={{
              __html: content
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                .replace(/\*(.*?)\*/g, "<em>$1</em>")
                .replace(/\n/g, "<br />"),
            }}
          />
        )}
      </div>
    </div>
  );
}
