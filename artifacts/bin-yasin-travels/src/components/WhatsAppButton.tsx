import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/923018780888"
      target="_blank"
      rel="noopener noreferrer"
      data-testid="whatsapp-float-btn"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-xl transition-all duration-300 hover:scale-110"
      title="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7 fill-white" />
    </a>
  );
}
