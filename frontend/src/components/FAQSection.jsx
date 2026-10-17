import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { faqData } from '../data/mockData';

const FAQSection = () => {
  const [openId, setOpenId] = useState(null);

  const toggleFAQ = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="faq-section">
      <div className="text-center mb-2">
        <span className="section-tag">GIẢI ĐÁP THẮC MẮC</span>
      </div>
      <h2 className="faq-title">Câu hỏi thường gặp về gói tập</h2>

      <div className="accordion-custom">
        {faqData.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div key={faq.id} className="accordion-item-custom">
              <button 
                className="accordion-header-custom"
                onClick={() => toggleFAQ(faq.id)}
              >
                <span>{faq.question}</span>
                {isOpen ? (
                  <FaChevronUp style={{ color: '#00E676' }} />
                ) : (
                  <FaChevronDown style={{ color: '#64748B' }} />
                )}
              </button>
              {isOpen && (
                <div className="accordion-content-custom">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQSection;
