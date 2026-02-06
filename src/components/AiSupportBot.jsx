import { useState, useRef, useEffect } from 'react';
import './AiSupportBot.css';

const AiSupportBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm the Surplus Support Bot. How can I help you today?", sender: 'bot' }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleQuestion = async (question) => {
        // Add user message
        const userMsg = { id: Date.now(), text: question, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        // Simulate AI delay
        setTimeout(() => {
            let botResponse = "";
            
            // Simple logic for 3 main questions
            if (question.includes("How does this work")) {
                botResponse = "It's simple! Restaurants list their surplus food at a discount. You book it here and pick it up during the specified time slot. This reduces waste and saves you money!";
            } else if (question.includes("refund")) {
                botResponse = "If a restaurant cancels your order, you get a full refund instantly. However, if you miss your pickup time, we cannot offer a refund as the food is perishable.";
            } else if (question.includes("food safety")) {
                botResponse = "Safety is our priority. All partners are verified. We recommend consuming the food within 4 hours of pickup and checking it before consumption.";
            } else {
                botResponse = "I'm still learning! Please contact our support team at help@surplusmarket.com for more complex queries.";
            }

            setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className={`ai-bot-container ${isOpen ? 'open' : ''}`}>
            {/* Toggle Button */}
            {!isOpen && (
                <button className="ai-bot-toggle" onClick={() => setIsOpen(true)}>
                    <span className="bot-icon">🤖</span>
                    <span className="bot-label">Help</span>
                </button>
            )}

            {/* Chat Window */}
            <div className={`ai-chat-window ${isOpen ? 'active' : ''}`}>
                <div className="chat-header">
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <span style={{fontSize: '1.5rem'}}>🤖</span>
                        <div>
                            <h4>Surplus Assistant</h4>
                            <span className="status-dot">Online</span>
                        </div>
                    </div>
                    <button className="close-chat" onClick={() => setIsOpen(false)}>×</button>
                </div>

                <div className="chat-body">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`message ${msg.sender}`}>
                            <div className="message-content">{msg.text}</div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="message bot">
                            <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-options">
                    <p>Select a question:</p>
                    <div className="options-grid">
                        <button onClick={() => handleQuestion("How does this work?")}>
                            How does this work?
                        </button>
                        <button onClick={() => handleQuestion("Can I get a refund?")}>
                            Can I get a refund?
                        </button>
                        <button onClick={() => handleQuestion("Is the food safe?")}>
                            Is the food safe?
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiSupportBot;
