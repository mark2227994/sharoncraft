import { useState, useRef, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AIMessageReview() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerMessage, setCustomerMessage] = useState('');
  const [options, setOptions] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [editedMessage, setEditedMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);

  // Load customers on mount
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const res = await fetch('/api/admin/get-customers');
        const data = await res.json();
        setCustomers(data.customers || []);
      } catch (err) {
        console.error('Failed to load customers:', err);
      }
    };
    loadCustomers();
  }, []);

  // Filter customers based on search
  const filteredCustomers = customers.filter(c => {
    const searchLower = customerSearch.toLowerCase();
    return (
      c.name?.toLowerCase().includes(searchLower) ||
      c.phone?.includes(searchSearch)
    );
  });

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
    setShowCustomerList(false);
    setOrderHistory(customer.orders || []);
    setOptions(null);
    setEditedMessage('');
    setSelectedOption(null);
  };

  const handleGenerateOptions = async () => {
    if (!customerMessage.trim()) {
      setError('Please enter the customer message');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setSelectedOption(null);
    setEditedMessage('');

    try {
      const orderContext = {
        customerName: selectedCustomer?.name || 'Customer',
        orderDescription: selectedCustomer?.lastOrder || 'N/A',
        orderPrice: selectedCustomer?.lastOrderPrice,
        previousMessages: selectedCustomer?.lastMessage || ''
      };

      const res = await fetch('/api/admin/ai-message-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer?.id,
          customerMessage,
          orderContext
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate options');
      }

      setOptions(data.options);
    } catch (err) {
      setError(err.message || 'Failed to generate message options');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (index) => {
    setSelectedOption(index);
    setEditedMessage(options[index].text);
  };

  const handleSendToWhatsApp = () => {
    if (!selectedCustomer?.phone) {
      setError('Customer phone number not found');
      return;
    }

    if (!editedMessage.trim()) {
      setError('Message is empty');
      return;
    }

    // Format phone for WhatsApp (remove leading 0, add 254)
    let phone = selectedCustomer.phone;
    if (phone.startsWith('0')) {
      phone = '254' + phone.slice(1);
    }

    // Open WhatsApp
    const text = encodeURIComponent(editedMessage);
    const url = `https://wa.me/${phone}?text=${text}`;
    window.open(url, '_blank');

    // Log the message (optional: save to order history)
    setSuccess(`Message sent! Opening WhatsApp for ${selectedCustomer.name}`);
    setTimeout(() => {
      setCustomerMessage('');
      setOptions(null);
      setEditedMessage('');
      setSelectedOption(null);
      setSuccess('');
    }, 2000);
  };

  return (
    <AdminLayout>
      <div className="container">
        <div className="header">
          <h1>🤖 AI Message Review Tool</h1>
          <p>Generate smart reply options with different tones. Pick the best one, edit if needed, and send!</p>
        </div>

        {error && <div className="errorBanner">{error}</div>}
        {success && <div className="successBanner">{success}</div>}

        <div className="mainContent">
          {/* Left Column: Customer & Message Input */}
          <div className="column">
            <div className="card">
              <h2>1. Select Customer</h2>
              
              <div className="inputGroup">
                <input
                  type="text"
                  placeholder="Search customer by name or phone..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setShowCustomerList(true);
                  }}
                  onFocus={() => setShowCustomerList(true)}
                  className="input"
                />
                
                {showCustomerList && filteredCustomers.length > 0 && (
                  <div className="dropdown">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className="dropdownItem"
                        onClick={() => handleSelectCustomer(customer)}
                      >
                        <div className="dropdownName">{customer.name}</div>
                        <div className="dropdownPhone">{customer.phone}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedCustomer && (
                <div className="selectedCustomerCard">
                  <div className="customerInfo">
                    <div className="customerName">{selectedCustomer.name}</div>
                    <div className="customerPhone">{selectedCustomer.phone}</div>
                    {selectedCustomer.lastOrder && (
                      <div className="customerOrder">
                        Last: {selectedCustomer.lastOrder}
                      </div>
                    )}
                  </div>
                  <button
                    className="secondaryBtn"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setCustomerSearch('');
                      setShowCustomerList(false);
                    }}
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            <div className="card">
              <h2>2. What Did They Say?</h2>
              <textarea
                placeholder="Paste the customer message here..."
                value={customerMessage}
                onChange={(e) => setCustomerMessage(e.target.value)}
                className="textarea"
                rows={6}
              />
              <p className="helpText">
                Be specific about what the customer asked or said. AI uses this to generate better replies.
              </p>

              <button
                className="primaryBtn"
                onClick={handleGenerateOptions}
                disabled={loading || !selectedCustomer || !customerMessage.trim()}
              >
                {loading ? '🔄 Generating options...' : '✨ Generate Reply Options'}
              </button>
            </div>
          </div>

          {/* Right Column: Options & Editor */}
          <div className="column">
            {options && (
              <>
                <div className="card">
                  <h2>3. Pick Your Tone</h2>
                  <div className="optionsGrid">
                    {options.map((option, idx) => (
                      <div
                        key={idx}
                        className={`optionCard ${selectedOption === idx ? 'selectedOption' : ''}`}
                        onClick={() => handleSelectOption(idx)}
                      >
                        <div className="optionTone">
                          <span className="optionIcon">{option.icon}</span>
                          <div className="optionName">{option.tone}</div>
                        </div>
                        <div className="optionPreview">
                          {option.text.substring(0, 80)}...
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h2>4. Edit & Send</h2>
                  {selectedOption !== null && (
                    <>
                      <textarea
                        value={editedMessage}
                        onChange={(e) => setEditedMessage(e.target.value)}
                        className="textarea"
                        rows={8}
                      />
                      
                      <div className="messageStats">
                        <span>{editedMessage.length} characters</span>
                      </div>

                      <button
                        className="primaryBtn"
                        onClick={handleSendToWhatsApp}
                        disabled={!editedMessage.trim() || !selectedCustomer}
                      >
                        📱 Send to WhatsApp
                      </button>
                    </>
                  )}
                  
                  {selectedOption === null && options && (
                    <p className="helpText">
                      ← Pick one of the tone options above to edit and send
                    </p>
                  )}
                </div>
              </>
            )}

            {!options && !loading && (
              <div className="card">
                <div className="emptyState">
                  <p>📝 Fill in the customer message and click "Generate Reply Options"</p>
                  <p>You'll see 3 different tones to choose from!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .container {
          padding: 20px;
        }

        .header {
          margin-bottom: 30px;
        }

        .header h1 {
          font-size: 28px;
          margin: 0 0 8px 0;
          color: #333;
        }

        .header p {
          color: #666;
          margin: 0;
        }

        .errorBanner {
          background: #fee;
          border: 1px solid #fcc;
          color: #c33;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .successBanner {
          background: #efe;
          border: 1px solid #cfc;
          color: #3c3;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .mainContent {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
        }

        .card h2 {
          font-size: 16px;
          margin: 0 0 16px 0;
          color: #333;
        }

        .inputGroup {
          position: relative;
          margin-bottom: 12px;
        }

        .input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          box-sizing: border-box;
        }

        .input:focus {
          outline: none;
          border-color: #8B4513;
          box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
        }

        .dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-top: none;
          border-radius: 0 0 6px 6px;
          max-height: 200px;
          overflow-y: auto;
          z-index: 10;
        }

        .dropdownItem {
          padding: 10px 12px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: background 0.2s;
        }

        .dropdownItem:hover {
          background: #f8f8f8;
        }

        .dropdownName {
          font-weight: 500;
          color: #333;
        }

        .dropdownPhone {
          font-size: 12px;
          color: #999;
        }

        .selectedCustomerCard {
          background: #f5f0eb;
          border: 1px solid #d4cec8;
          border-radius: 6px;
          padding: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
        }

        .customerInfo {
          flex: 1;
        }

        .customerName {
          font-weight: 600;
          color: #333;
        }

        .customerPhone {
          font-size: 13px;
          color: #666;
        }

        .customerOrder {
          font-size: 12px;
          color: #999;
          margin-top: 4px;
        }

        .textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          font-family: 'Courier New', monospace;
          box-sizing: border-box;
          resize: vertical;
        }

        .textarea:focus {
          outline: none;
          border-color: #8B4513;
          box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
        }

        .helpText {
          font-size: 12px;
          color: #999;
          margin: 8px 0 0 0;
        }

        .primaryBtn {
          width: 100%;
          padding: 12px;
          background: #8B4513;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 12px;
          transition: background 0.2s;
        }

        .primaryBtn:hover:not(:disabled) {
          background: #6b3410;
        }

        .primaryBtn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .secondaryBtn {
          padding: 6px 12px;
          background: white;
          color: #666;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .secondaryBtn:hover {
          background: #f5f5f5;
          border-color: #999;
        }

        .optionsGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 12px;
        }

        .optionCard {
          background: #f9f9f9;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .optionCard:hover {
          border-color: #8B4513;
          background: #f5f0eb;
        }

        .selectedOption {
          background: #fff3e0;
          border-color: #8B4513;
          box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
        }

        .optionTone {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .optionIcon {
          font-size: 20px;
        }

        .optionName {
          font-weight: 600;
          color: #333;
          font-size: 13px;
        }

        .optionPreview {
          font-size: 12px;
          color: #666;
          line-height: 1.4;
        }

        .messageStats {
          font-size: 12px;
          color: #999;
          margin: 8px 0 12px 0;
        }

        .emptyState {
          text-align: center;
          padding: 40px 20px;
          color: #999;
        }

        .emptyState p {
          margin: 0 0 8px 0;
          line-height: 1.6;
        }

        @media (max-width: 900px) {
          .mainContent {
            grid-template-columns: 1fr;
          }

          .optionsGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
