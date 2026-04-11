import React, { useState } from 'react';
import { CreditCard, Lock, X, CheckCircle, Download, Printer } from 'lucide-react';
import './PaymentGateway.css';

const PaymentGateway = ({ train, selectedSeats, passengerName, passengerAge, onClose, onSuccess }) => {
  const [step, setStep] = useState('payment');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  const totalPrice = train.price * selectedSeats.length;
  const gst = (totalPrice * 0.05).toFixed(2);
  const finalPrice = (parseFloat(totalPrice) + parseFloat(gst)).toFixed(2);

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const handlePayment = (e) => {
    e.preventDefault();
    
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      alert('Please enter a valid 16-digit card number');
      return;
    }

    setProcessing(true);
    setStep('qr'); // Show QR code

    // Auto-close QR and show receipt after 4 seconds
    setTimeout(() => {
      const pnr = 'PNR' + Math.floor(1000000000 + Math.random() * 9000000000);
      const booking = {
        pnr,
        passengerName,
        age: passengerAge,
        train: train.name,
        from: train.from,
        to: train.to,
        departure: train.departure,
        arrival: train.arrival,
        class: train.class,
        seats: selectedSeats.length,
        seatNumbers: selectedSeats.join(', '),
        totalPrice,
        gst,
        finalPrice,
        bookingDate: new Date().toLocaleString(),
        paymentMethod: 'UPI Payment',
        status: 'Confirmed'
      };
      
      setBookingDetails(booking);
      setProcessing(false);
      setStep('receipt');
      onSuccess(booking);
    }, 4000);
  };

  if (step === 'qr') {
    return (
      <div className="payment-overlay">
        <div className="qr-container">
          <div className="qr-header">
            <h2>Scan QR to Pay</h2>
            <p>Use any UPI app to complete payment</p>
          </div>
          
          <div className="qr-body">
            <div className="qr-code">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://youtu.be/xMHJGd3wwZk?si=9K1JmdC_KGmkivZw" 
                alt="Payment QR Code"
              />
            </div>
            
            <div className="amount-display">
              <p>Amount to Pay</p>
              <h1>₹{finalPrice}</h1>
            </div>
            
            <div className="processing-indicator">
              <div className="spinner"></div>
              <p>Waiting for payment confirmation...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'receipt') {
    return (
      <div className="payment-overlay">
        <div className="receipt-container">
          <div className="receipt-header">
            <CheckCircle size={60} color="#10b981" />
            <h2>Payment Successful!</h2>
            <p>Your ticket has been booked</p>
          </div>

          <div className="receipt-body">
            <div className="receipt-section">
              <h3>🎫 Booking Details</h3>
              <div className="detail-row">
                <span>PNR Number:</span>
                <strong>{bookingDetails.pnr}</strong>
              </div>
              <div className="detail-row">
                <span>Passenger Name:</span>
                <strong>{bookingDetails.passengerName}</strong>
              </div>
              <div className="detail-row">
                <span>Age:</span>
                <strong>{bookingDetails.age}</strong>
              </div>
              <div className="detail-row">
                <span>Booking Date:</span>
                <strong>{bookingDetails.bookingDate}</strong>
              </div>
            </div>

            <div className="receipt-section">
              <h3>🚂 Train Details</h3>
              <div className="detail-row">
                <span>Train Name:</span>
                <strong>{bookingDetails.train}</strong>
              </div>
              <div className="detail-row">
                <span>Route:</span>
                <strong>{bookingDetails.from} → {bookingDetails.to}</strong>
              </div>
              <div className="detail-row">
                <span>Departure:</span>
                <strong>{bookingDetails.departure}</strong>
              </div>
              <div className="detail-row">
                <span>Class:</span>
                <strong>{bookingDetails.class}</strong>
              </div>
              <div className="detail-row">
                <span>Seats:</span>
                <strong>{bookingDetails.seatNumbers}</strong>
              </div>
            </div>

            <div className="receipt-section">
              <h3>💰 Payment Details</h3>
              <div className="detail-row">
                <span>Ticket Price:</span>
                <strong>₹{bookingDetails.totalPrice}</strong>
              </div>
              <div className="detail-row">
                <span>GST (5%):</span>
                <strong>₹{bookingDetails.gst}</strong>
              </div>
              <div className="detail-row total-row">
                <span>Total Paid:</span>
                <strong>₹{bookingDetails.finalPrice}</strong>
              </div>
            </div>
          </div>

          <div className="receipt-actions">
            <button className="btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-overlay">
      <div className="payment-modal">
        <div className="payment-header">
          <h2><Lock size={24} /> Secure Payment</h2>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="payment-summary">
          <h3>Order Summary</h3>
          <div className="summary-item">
            <span>Train: {train.name}</span>
          </div>
          <div className="summary-item">
            <span>Seats: {selectedSeats.join(', ')}</span>
          </div>
          <div className="summary-item">
            <span>Ticket Price</span>
            <span>₹{totalPrice}</span>
          </div>
          <div className="summary-item">
            <span>GST (5%)</span>
            <span>₹{gst}</span>
          </div>
          <div className="summary-item total">
            <strong>Total Amount</strong>
            <strong>₹{finalPrice}</strong>
          </div>
        </div>

        <form className="payment-form" onSubmit={handlePayment}>
          <div className="form-group">
            <label><CreditCard size={18} /> Card Number</label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              maxLength="19"
              required
            />
          </div>

          <div className="form-group">
            <label>Cardholder Name</label>
            <input
              type="text"
              placeholder="YOUR NAME"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Expiry</label>
              <input
                type="text"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, '');
                  if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
                  setExpiryDate(v);
                }}
                maxLength="5"
                required
              />
            </div>
            <div className="form-group">
              <label>CVV</label>
              <input
                type="password"
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                maxLength="3"
                required
              />
            </div>
          </div>

          <div className="payment-info">
            <p>🔒 Secure payment • Demo mode</p>
          </div>

          <button type="submit" className="btn-pay" disabled={processing}>
            {processing ? 'Processing...' : `Pay ₹${finalPrice}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentGateway;