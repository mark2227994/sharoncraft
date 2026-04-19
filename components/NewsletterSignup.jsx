import Icon from "./icons";
import { useState } from "react";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

export default function NewsletterSignup() {
  const { elementRef, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email) {
      setError("Please enter your email");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    // Simulate submission
    setSubscribed(true);
    setEmail("");
    setError("");

    // Reset after 4 seconds
    setTimeout(() => {
      setSubscribed(false);
    }, 4000);
  };

  return (
    <section ref={elementRef} className={`newsletter ${isVisible ? 'newsletter--visible' : ''}`}>
      <div className="newsletter__inner">
        <div className="newsletter__content">
          <div className="newsletter__icon">
            <Icon name="mail" size={40} />
          </div>
          
          <h2 className="newsletter__title">Get 15% Off Your First Order</h2>
          <p className="newsletter__description">
            Join our community of artisan lovers. Get exclusive access to new collections, 
            behind-the-scenes stories, and special discounts.
          </p>

          <div className="newsletter__benefits">
            <div className="newsletter__benefit">
              <Icon name="check" size={18} />
              <span>15% off discount code sent immediately</span>
            </div>
            <div className="newsletter__benefit">
              <Icon name="check" size={18} />
              <span>Early access to limited editions</span>
            </div>
            <div className="newsletter__benefit">
              <Icon name="check" size={18} />
              <span>Artisan stories straight to your inbox</span>
            </div>
          </div>

          <form className="newsletter__form" onSubmit={handleSubmit}>
            <div className="newsletter__input-group">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className="newsletter__input"
                disabled={subscribed}
              />
              <button 
                type="submit" 
                className="newsletter__button"
                disabled={subscribed}
              >
                {subscribed ? (
                  <>
                    <Icon name="check" size={20} />
                    <span>Subscribed!</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <Icon name="arrowR" size={20} />
                  </>
                )}
              </button>
            </div>
            
            {error && <p className="newsletter__error">{error}</p>}
            
            {subscribed && (
              <p className="newsletter__success">
                ✓ Check your inbox for your 15% discount code!
              </p>
            )}
          </form>

          <p className="newsletter__consent">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>

        <div className="newsletter__visual">
          <div className="newsletter__pattern">
            <div className="newsletter__pattern-item" style={{ animationDelay: '0s' }} />
            <div className="newsletter__pattern-item" style={{ animationDelay: '0.2s' }} />
            <div className="newsletter__pattern-item" style={{ animationDelay: '0.4s' }} />
            <div className="newsletter__pattern-item" style={{ animationDelay: '0.6s' }} />
            <div className="newsletter__pattern-item" style={{ animationDelay: '0.8s' }} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .newsletter {
          padding: var(--space-8) var(--gutter);
          background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
          position: relative;
          overflow: hidden;
        }

        .newsletter__inner {
          max-width: var(--max-width);
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-7);
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .newsletter__content {
          color: white;
        }

        .newsletter__icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          background: linear-gradient(135deg, #C04D29, #D4A574);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--space-4);
          color: white;
        }

        .newsletter__title {
          font-size: 2.25rem;
          font-weight: 700;
          margin: 0 0 var(--space-3) 0;
          line-height: 1.2;
          color: white;
        }

        .newsletter__description {
          font-size: 1rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.8);
          margin: 0 0 var(--space-5) 0;
        }

        .newsletter__benefits {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-bottom: var(--space-5);
        }

        .newsletter__benefit {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.9375rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .newsletter__benefit svg {
          color: #D4A574;
          flex-shrink: 0;
        }

        .newsletter__form {
          margin-bottom: var(--space-4);
        }

        .newsletter__input-group {
          display: flex;
          gap: 12px;
          margin-bottom: var(--space-3);
        }

        .newsletter__input {
          flex: 1;
          padding: 14px 18px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 0.9375rem;
          transition: all 0.3s ease;
        }

        .newsletter__input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .newsletter__input:focus {
          outline: none;
          border-color: #C04D29;
          background: rgba(255, 255, 255, 0.15);
        }

        .newsletter__input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .newsletter__button {
          padding: 14px 28px;
          background: linear-gradient(135deg, #C04D29, #D4A574);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.9375rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: flex;
          align-items: center;
          gap: var(--space-2);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }

        .newsletter__button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(192, 77, 41, 0.4);
        }

        .newsletter__button:disabled {
          opacity: 0.8;
          cursor: not-allowed;
        }

        .newsletter__error {
          color: #ff6b6b;
          font-size: 0.875rem;
          margin: 0;
        }

        .newsletter__success {
          color: #51cf66;
          font-size: 0.875rem;
          margin: 0;
          font-weight: 500;
        }

        .newsletter__consent {
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
        }

        .newsletter__visual {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          min-height: 300px;
        }

        .newsletter__pattern {
          display: flex;
          gap: var(--space-3);
          flex-wrap: wrap;
          max-width: 300px;
        }

        .newsletter__pattern-item {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(192, 77, 41, 0.4), rgba(212, 165, 116, 0.3));
          animation: float 4s ease-in-out infinite;
          border: 2px solid rgba(212, 165, 116, 0.3);
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @media (max-width: 768px) {
          .newsletter {
            padding: var(--space-6) var(--gutter);
          }

          .newsletter__inner {
            grid-template-columns: 1fr;
            gap: var(--space-6);
          }

          .newsletter__title {
            font-size: 1.75rem;
          }

          .newsletter__input-group {
            flex-direction: column;
          }

          .newsletter__button {
            width: 100%;
            justify-content: center;
          }

          .newsletter__visual {
            min-height: 200px;
          }

          .newsletter__pattern {
            max-width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
}
