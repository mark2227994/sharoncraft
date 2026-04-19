export default function WhatsAppFab() {
  const handleWhatsAppClick = () => {
    const phoneNumber = "254712345678"; // Replace with actual number from env
    const message = encodeURIComponent("Hi SharonCraft! I'm interested in your products. Can you help me?");
    window.open(
      `https://wa.me/${phoneNumber}?text=${message}`,
      "_blank"
    );
  };

  return (
    <>
      <button
        className="whatsapp-fab"
        onClick={handleWhatsAppClick}
        aria-label="Chat with us on WhatsApp"
        title="Chat on WhatsApp"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="whatsapp-fab__label">Chat</span>
      </button>

      <style jsx>{`
        .whatsapp-fab {
          position: fixed;
          bottom: 80px;
          right: 16px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #25d366;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          font-weight: 600;
          font-size: 12px;
          z-index: 40;
          animation: slideUp 0.4s ease;
        }

        .whatsapp-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(37, 211, 102, 0.5);
        }

        .whatsapp-fab:active {
          transform: scale(0.95);
        }

        .whatsapp-fab__label {
          position: absolute;
          bottom: -24px;
          white-space: nowrap;
          font-size: 11px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .whatsapp-fab:hover .whatsapp-fab__label {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .whatsapp-fab {
            width: 56px;
            height: 56px;
            bottom: 80px;
            right: 12px;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (min-width: 769px) {
          .whatsapp-fab {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
