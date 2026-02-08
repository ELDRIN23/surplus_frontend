import React, { useState, useEffect } from 'react';
import './FakeRazorpay.css';

const FakeRazorpay = ({ amount, onPaymentSuccess, onPaymentFailure, isOpen, onClose, userName, userEmail }) => {
    const [step, setStep] = useState('methods'); // methods, card, processing, success
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    const playSuccessSound = () => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'); // A nice "ding/success" sound
        audio.play().catch(err => console.log('Audio play failed', err));
    };

    const getCardType = (number) => {
        if (number.startsWith('4')) return 'Visa';
        if (number.startsWith('5')) return 'MasterCard';
        if (number.startsWith('6')) return 'RuPay';
        return '';
    };

    const handleCardSubmit = (e) => {
        e.preventDefault();
        setStep('processing');
        
        // Simulate network delay
        setTimeout(() => {
            playSuccessSound();
            setStep('success');
            setTimeout(() => {
                onPaymentSuccess('fake_payment_id_' + Date.now());
            }, 1500);
        }, 3000);
    };

    if (!isOpen) return null;

    return (
        <div className="rzp-overlay">
            <div className="rzp-modal">
                <div className="rzp-header">
                    <div className="rzp-header-left">
                        <img src="https://razorpay.com/favicon.png" alt="Razorpay" className="rzp-logo" />
                        <div className="rzp-header-text">
                            <h3>Surplus Food Marketplace</h3>
                            <p>Amount: ₹{amount}</p>
                        </div>
                    </div>
                    <button className="rzp-close" onClick={onClose}>×</button>
                </div>

                <div className="rzp-body">
                    {step === 'methods' && (
                        <div className="rzp-methods">
                            <p className="rzp-section-title">PAYMENT METHODS</p>
                            <div className="rzp-method-item" onClick={() => setStep('card')}>
                                <div className="rzp-method-icon">💳</div>
                                <div className="rzp-method-info">
                                    <h4>Card</h4>
                                    <p>Visa, MasterCard, RuPay, and more</p>
                                </div>
                                <span className="rzp-arrow">›</span>
                            </div>
                            <div className="rzp-method-item disabled">
                                <div className="rzp-method-icon">🏦</div>
                                <div className="rzp-method-info">
                                    <h4>Netbanking</h4>
                                    <p>All Indian banks</p>
                                </div>
                                <span className="rzp-arrow">›</span>
                            </div>
                            <div className="rzp-method-item disabled">
                                <div className="rzp-method-icon">📱</div>
                                <div className="rzp-method-info">
                                    <h4>UPI</h4>
                                    <p>Google Pay, PhonePe, and more</p>
                                </div>
                                <span className="rzp-arrow">›</span>
                            </div>
                        </div>
                    )}

                    {step === 'card' && (
                        <form className="rzp-card-form" onSubmit={handleCardSubmit}>
                            <p className="rzp-section-title">CARD DETAILS</p>
                            <div className="rzp-input-group rzp-card-input-wrapper">
                                <input 
                                    type="text" 
                                    placeholder="Card Number" 
                                    maxLength="19"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                                    required 
                                />
                                <span className="rzp-card-type">{getCardType(cardNumber)}</span>
                            </div>
                            <div className="rzp-input-row">
                                <input 
                                    type="text" 
                                    placeholder="Expiry (MM/YY)" 
                                    maxLength="5"
                                    value={expiry}
                                    onChange={(e) => setExpiry(e.target.value)}
                                    required 
                                />
                                <input 
                                    type="password" 
                                    placeholder="CVV" 
                                    maxLength="3"
                                    value={cvv}
                                    onChange={(e) => setCvv(e.target.value)}
                                    required 
                                />
                            </div>
                            <div className="rzp-input-group">
                                <input type="text" placeholder="Card Holder Name" defaultValue={userName} />
                            </div>
                            
                            <button type="submit" className="rzp-pay-btn">PAY ₹{amount}</button>
                            <button type="button" className="rzp-back-btn" onClick={() => setStep('methods')}>Back</button>
                        </form>
                    )}

                    {step === 'processing' && (
                        <div className="rzp-loader-container">
                            <div className="rzp-spinner"></div>
                            <p>Confirming with your bank...</p>
                            <p className="rzp-subtext">Do not refresh or close the window</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="rzp-success-container">
                            <div className="rzp-checkmark">✓</div>
                            <p className="rzp-success-title">Payment Successful</p>
                            <p>Wait while we redirect you...</p>
                        </div>
                    )}
                </div>

                <div className="rzp-footer">
                    <p>Powered by <span>Razorpay</span></p>
                    <div className="rzp-secure">🔒 PCI DSS Compliant</div>
                </div>
            </div>
        </div>
    );
};

export default FakeRazorpay;
