import React, { useState } from 'react';
import PricingCard from '../components/PricingCard';
import FacilityBanner from '../components/FacilityBanner';
import ComparisonTable from '../components/ComparisonTable';
import FAQSection from '../components/FAQSection';
import { packagesData } from '../data/mockData';
import { FaStar } from 'react-icons/fa';

const PackagesPage = ({ onSelectPackage }) => {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <div className="packages-page">
      {/* Hero Header */}
      <section className="hero-header">
        <div className="badge-vip-program">
          <FaStar /> CHƯƠNG TRÌNH HỘI VIÊN CAO CẤP 2026
        </div>
        <h1 className="hero-title">
          Bảng giá & Gói tập thể hình <span>FitManager</span>
        </h1>
        <p className="hero-subtitle">
          Lựa chọn gói tập phù hợp với mục tiêu thể lực của bạn. Tập luyện không giới hạn, hỗ trợ từ PT chuyên nghiệp và cơ sở vật chất chuẩn 5 sao.
        </p>

        {/* Billing Toggle Switch */}
        <div className="billing-toggle-container">
          <button
            className={`toggle-btn ${!isYearly ? 'active' : ''}`}
            onClick={() => setIsYearly(false)}
          >
            Thanh toán Hàng tháng
          </button>
          <button
            className={`toggle-btn ${isYearly ? 'active' : ''}`}
            onClick={() => setIsYearly(true)}
          >
            <span>Thanh toán Theo năm</span>
            <span className="discount-tag">TIẾT KIỆM 20% + 2TH THÁNG PT</span>
          </button>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="pricing-grid">
        {packagesData.map((pkg) => (
          <PricingCard
            key={pkg.id}
            pkg={pkg}
            isYearly={isYearly}
            onSelectPackage={onSelectPackage}
          />
        ))}
      </section>

      {/* Facility & Satisfaction Banner */}
      <FacilityBanner />

      {/* Detailed Feature Comparison Table */}
      <ComparisonTable />

      {/* Frequently Asked Questions (FAQ) */}
      <FAQSection />
    </div>
  );
};

export default PackagesPage;
