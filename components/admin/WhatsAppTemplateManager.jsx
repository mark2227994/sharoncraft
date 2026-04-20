import { useState } from "react";
import { WHATSAPP_TEMPLATES } from "../../lib/whatsapp-templates";

export default function WhatsAppTemplateManager() {
  const [selectedTemplate, setSelectedTemplate] = useState("customOrderReceived");
  const [customVariables, setCustomVariables] = useState({});
  const [preview, setPreview] = useState("");
  const [copied, setCopied] = useState(false);

  const templates = Object.keys(WHATSAPP_TEMPLATES);
  const templateFunction = WHATSAPP_TEMPLATES[selectedTemplate];

  // Detect variables in template by looking at function code
  const getTemplateVariables = (templateKey) => {
    const func = WHATSAPP_TEMPLATES[templateKey];
    const funcStr = func.toString();
    const matches = funcStr.match(/\$\{([^}]+)\}/g) || [];
    return matches.map(m => m.slice(2, -1));
  };

  const variables = getTemplateVariables(selectedTemplate);

  // Update preview when template or variables change
  const updatePreview = () => {
    try {
      if (variables.length === 0) {
        setPreview(templateFunction(""));
      } else if (variables.length === 1) {
        setPreview(templateFunction(customVariables[variables[0]] || `[${variables[0]}]`));
      } else {
        // For templates with multiple parameters
        const args = variables.map(v => customVariables[v] || `[${v}]`);
        setPreview(templateFunction(...args));
      }
    } catch (err) {
      setPreview("Error generating template. Please check your input.");
    }
  };

  const handleVariableChange = (variable, value) => {
    setCustomVariables(prev => ({ ...prev, [variable]: value }));
  };

  const copyToClipboard = async () => {
    updatePreview();
    try {
      await navigator.clipboard.writeText(preview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleTemplateChange = (e) => {
    setSelectedTemplate(e.target.value);
    setCustomVariables({});
    setPreview("");
  };

  // Update preview on mount and when dependencies change
  if (preview === "") {
    updatePreview();
  }

  return (
    <div className="whatsapp-template-manager">
      <style>{`
        .whatsapp-template-manager {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }

        .template-header {
          margin-bottom: 30px;
        }

        .template-header h2 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #111;
        }

        .template-header p {
          color: #666;
          font-size: 14px;
          line-height: 1.5;
        }

        .template-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 40px;
        }

        @media (max-width: 768px) {
          .template-section {
            grid-template-columns: 1fr;
          }
        }

        .template-selector {
          background: #f9f9f9;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
        }

        .template-selector label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin-bottom: 12px;
        }

        .template-selector select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          margin-bottom: 20px;
          font-family: inherit;
        }

        .template-variables {
          margin-top: 20px;
        }

        .variable-input {
          margin-bottom: 12px;
        }

        .variable-input label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #555;
          margin-bottom: 6px;
        }

        .variable-input input,
        .variable-input textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 13px;
          font-family: 'Monaco', 'Courier New', monospace;
        }

        .template-preview {
          background: #fff;
          border: 2px solid #C04D29;
          border-radius: 8px;
          padding: 20px;
          position: sticky;
          top: 20px;
        }

        .template-preview h3 {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .message-preview {
          background: #ecf9f8;
          border: 1px solid #b3e5e0;
          border-radius: 8px;
          padding: 16px;
          min-height: 200px;
          max-height: 400px;
          overflow-y: auto;
          font-size: 14px;
          line-height: 1.6;
          color: #333;
          font-family: 'Monaco', 'Courier New', monospace;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .copy-button {
          width: 100%;
          padding: 12px;
          margin-top: 16px;
          background: #C04D29;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
        }

        .copy-button:hover {
          background: #a63e20;
        }

        .copy-button.copied {
          background: #22c55e;
        }

        .copy-status {
          margin-top: 12px;
          font-size: 13px;
          color: #22c55e;
          text-align: center;
          font-weight: 600;
          min-height: 20px;
        }

        .template-description {
          font-size: 13px;
          color: #666;
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .no-variables {
          font-size: 13px;
          color: #999;
          font-style: italic;
          padding: 12px;
          background: #f5f5f5;
          border-radius: 4px;
          text-align: center;
        }
      `}</style>

      <div className="template-header">
        <h2>WhatsApp Message Templates</h2>
        <p>
          Professional message templates for common customer interactions. Customize with customer details and copy directly to WhatsApp.
        </p>
      </div>

      <div className="template-section">
        <div className="template-selector">
          <label htmlFor="template-select">Select a Template</label>
          <select
            id="template-select"
            value={selectedTemplate}
            onChange={handleTemplateChange}
          >
            <optgroup label="Custom Orders">
              <option value="customOrderReceived">Custom Order - Acknowledgment</option>
              <option value="quoteReady">Custom Order - Quote Ready</option>
              <option value="depositReceived">Custom Order - Deposit Received</option>
              <option value="productionUpdate">Custom Order - Production Update</option>
              <option value="readyForApproval">Custom Order - Ready for Final Approval</option>
              <option value="finalPaymentDue">Custom Order - Final Payment Due</option>
            </optgroup>
            <optgroup label="Shipping & Delivery">
              <option value="dispatchNotification">Dispatch Notification</option>
              <option value="deliveryConfirmed">Delivery Confirmed & Follow-up</option>
              <option value="deliveryIssueResolution">Delivery Issue Resolution</option>
            </optgroup>
            <optgroup label="Customer Communication">
              <option value="welcomeNewCustomer">Welcome New Customer</option>
              <option value="orderFollowUp">Order Follow-up (Incomplete)</option>
              <option value="inquiryResponse">General Inquiry Response</option>
              <option value="productRecommendation">Product Recommendation</option>
              <option value="promotionalOffer">Promotional Offer</option>
            </optgroup>
          </select>

          <div className="template-variables">
            {variables.length === 0 ? (
              <div className="no-variables">No variables needed for this template</div>
            ) : (
              variables.map(variable => (
                <div key={variable} className="variable-input">
                  <label htmlFor={variable}>
                    {variable.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  {variable === "progressDetails" || variable === "trackingInfo" || variable === "response" || variable === "solution" ? (
                    <textarea
                      id={variable}
                      value={customVariables[variable] || ""}
                      onChange={(e) => {
                        handleVariableChange(variable, e.target.value);
                        setPreview("");
                      }}
                      placeholder={`Enter ${variable}`}
                      rows={3}
                    />
                  ) : (
                    <input
                      id={variable}
                      type="text"
                      value={customVariables[variable] || ""}
                      onChange={(e) => {
                        handleVariableChange(variable, e.target.value);
                        setPreview("");
                      }}
                      placeholder={`Enter ${variable}`}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="template-preview">
          <h3>Message Preview</h3>
          <div className="message-preview">{preview}</div>
          <button
            className={`copy-button ${copied ? "copied" : ""}`}
            onClick={copyToClipboard}
          >
            {copied ? "Copied to Clipboard!" : "Copy to Clipboard"}
          </button>
          <div className="copy-status">
            {copied && "Ready to paste into WhatsApp!"}
          </div>
        </div>
      </div>

      <div className="template-info">
        <style>{`
          .template-info {
            background: #f5f5f5;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin-top: 40px;
          }

          .template-info h3 {
            font-size: 16px;
            font-weight: 600;
            color: #333;
            margin-bottom: 12px;
          }

          .template-info ul {
            list-style-position: inside;
            color: #666;
            font-size: 14px;
            line-height: 1.7;
          }

          .template-info li {
            margin-bottom: 8px;
          }

          .template-info strong {
            color: #333;
          }
        `}</style>
        <h3>How to Use These Templates</h3>
        <ul>
          <li>
            <strong>Select a template</strong> from the dropdown that matches the situation
          </li>
          <li>
            <strong>Fill in the variables</strong> (customer names, order references, amounts, etc.)
          </li>
          <li>
            <strong>Review the preview</strong> to make sure everything looks right
          </li>
          <li>
            <strong>Copy the message</strong> and paste directly into your WhatsApp conversation
          </li>
          <li>
            <strong>Customize if needed</strong> - add personal touches or additional details
          </li>
          <li>
            <strong>Send!</strong> All messages are professional, friendly, and detailed
          </li>
        </ul>
      </div>
    </div>
  );
}
