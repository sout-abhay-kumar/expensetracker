
import { Link } from "react-router-dom";
import {
  Send,
  MessageCircle,
  RefreshCw,
  Bell,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import "../styles/TelegramComingSoon.css";
import { FallingLeaves } from "falling-leaves/react";


const features = [
  {
    icon: MessageCircle,
    title: "Track by chatting",
    description: "Send a simple message to record an expense.",
  },
  {
    icon: RefreshCw,
    title: "Automatic sync",
    description: "Your Telegram expenses appear in SmartSpend.",
  },
  {
    icon: Bell,
    title: "Smart updates",
    description: "Receive spending summaries and helpful alerts.",
  },
];

export default function TelegramComingSoon() {
    return (
      <main className="telegram-page">
        <FallingLeaves
          fullScreen
          count={40}
          wind={[0.2, 1.2]}
          shapes={["maple", "ginkgo"]}
          zIndex={1}
        />
        <div className="telegram-content">
          <Link to="/dashboard" className="telegram-back">
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <section className="telegram-hero">
            <div className="telegram-icon">
              <Send size={34} />
              <span className="telegram-icon-sparkle">
                <Sparkles size={15} />
              </span>
            </div>

            <span className="telegram-status">
              <span className="status-dot" />
              COMING SOON
            </span>

            <h1>
              Your expenses,
              <br />
              <span>just a message away.</span>
            </h1>

            <p className="telegram-description">
              We're working on bringing ExpenseTracker to Telegram. Soon, you'll
              be able to record expenses, track spending, and receive useful
              insights — all through a simple chat.
            </p>

            <div className="telegram-preview">
              <div className="preview-header">
                <div className="preview-avatar">
                  <Send size={17} />
                </div>
                <div>
                  <strong>ExpenseTracker Bot</strong>
                  <span>Your personal expense assistant</span>
                </div>
                <span className="preview-online">Soon</span>
              </div>

              <div className="preview-chat">
                <div className="chat-message user-message">
                  Spent ₹250 on lunch
                  <span>12:30 PM</span>
                </div>

                <div className="chat-message bot-message">
                  <strong>Expense recorded! 🎉</strong>
                  <p>₹250 · Food</p>
                  <span>12:30 PM</span>
                </div>
              </div>

              <div className="preview-input">
                <span>Send a message...</span>
                <div className="preview-send">
                  <Send size={15} />
                </div>
              </div>
            </div>

            <div className="telegram-features">
              {features.map(({ icon: Icon, title, description }) => (
                <div className="telegram-feature" key={title}>
                  <div className="feature-icon">
                    <Icon size={19} />
                  </div>
                  <div>
                    <strong>{title}</strong>
                    <p>{description}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="telegram-footer">
              Simple conversations. Smarter money management.
            </p>
          </section>
        </div>
      </main>
    );
}
