import React from 'react';
import { FaCheckCircle, FaCrown, FaExpandAlt, FaRibbon } from 'react-icons/fa';

const PricingCard = ({ pkg, isYearly, onSelectPackage }) => {
  const price = isYearly ? pkg.priceYear : pkg.priceMonth;
  const periodText = isYearly ? 'đ / năm' : 'đ / tháng';

  const renderTopIcon = () => {
    if (pkg.id === 'basic') return <FaExpandAlt style={{ opacity: 0.6 }} />;
    if (pkg.id === 'premium') return <FaRibbon style={{ color: '#00E676' }} />;
    if (pkg.id === 'vip') return <FaCrown style={{ color: '#FFD700' }} />;
    return null;
  };

  return (
    <div className={`pricing-card ${pkg.isPopular ? 'featured' : ''}`}>
      {pkg.isPopular && (
        <div className="popular-badge">
          {pkg.badge || 'KHUYÊN DÙNG - PHỔ BIẾN NHẤT'}
        </div>
      )}

      <div>
        {/* Header line */}
        <div className="d-flex justify-content-between align-items-center mb-1">
          <div className="card-category">{pkg.category}</div>
          <div style={{ fontSize: '1rem', color: '#94A3B8' }}>
            {renderTopIcon()}
          </div>
        </div>

        {/* Title */}
        <h3 className="card-title">{pkg.name}</h3>

        {/* Subtitle */}
        <p className="card-description">{pkg.subtitle}</p>

        {/* Price box */}
        <div className="card-price-box">
          <span className={`card-price ${pkg.isPopular ? 'green-text' : ''}`}>
            {price}
          </span>
          <span className="card-price-period">{periodText}</span>
        </div>

        <div className="card-price-note">{pkg.note}</div>
      </div>

      <div>
        <div className="divider"></div>

        {/* Features list */}
        <ul className="feature-list">
          {pkg.features.map((feature, idx) => (
            <li key={idx} className="feature-item">
              <FaCheckCircle className="check-icon" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Button Action */}
        <button
          className={`btn-card-action ${pkg.isPopular ? 'btn-green' : ''}`}
          onClick={() => onSelectPackage(pkg)}
        >
          {pkg.buttonText}
        </button>
      </div>
    </div>
  );
};

export default PricingCard;
