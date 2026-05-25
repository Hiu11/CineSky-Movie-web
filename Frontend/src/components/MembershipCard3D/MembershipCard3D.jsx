import { useRef, useState } from 'react';
import './MembershipCard3D.css';

export default function MembershipCard3D({ user, recentBookings }) {
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Tinh toan do nghieng xoay tu -20 den 20 do
    const rotateY = ((mouseX / width) - 0.5) * 40;
    const rotateX = ((mouseY / height) - 0.5) * -40;

    const glareX = (mouseX / width) * 100;
    const glareY = (mouseY / height) * 100;

    setRotate({ x: rotateX, y: rotateY });
    setGlare({ x: glareX, y: glareY, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare({ ...glare, opacity: 0 });
  };

  const membershipTier = user?.membership?.tier || "Member";
  const points = Number(user?.membership?.points || 0).toLocaleString("vi-VN");
  const totalSpent = recentBookings?.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0) || 0;
  
  let tierClass = "membership-card--member";
  const tierLower = membershipTier.toLowerCase();
  if (tierLower.includes("vàng") || tierLower === "gold") tierClass = "membership-card--gold";
  else if (tierLower.includes("bạc") || tierLower === "silver") tierClass = "membership-card--silver";
  else if (tierLower.includes("kim cương") || tierLower === "diamond") tierClass = "membership-card--diamond";

  return (
    <div className="membership-3d-wrapper">
      <div 
        className={`membership-card-3d ${tierClass}`}
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        }}
      >
        <div 
          className="membership-card-glare"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.6) 0%, transparent 60%)`,
            opacity: glare.opacity
          }}
        />
        
        <div className="membership-card__content">
          <div className="membership-card__header">
            <span className="membership-card__brand">CINESKY</span>
            <span className="membership-card__tier">{membershipTier}</span>
          </div>
          
          <div className="membership-card__body">
            <div className="membership-card__chip"></div>
            <div className="membership-card__contactless">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 14c-.6-1.2-.6-2.8 0-4M12 16.5c-1.4-2.8-1.4-6.2 0-9M15.5 19c-2.3-4.5-2.3-9.5 0-14"/>
              </svg>
            </div>
          </div>
          
          <div className="membership-card__info">
            <div className="membership-card__name">{user?.fullName || user?.name || "NGƯỜI DÙNG CINESKY"}</div>
            <div className="membership-card__stats">
              <div className="membership-stat">
                <small>Tích lũy</small>
                <strong>{points} pt</strong>
              </div>
              <div className="membership-stat">
                <small>Chi tiêu</small>
                <strong>{totalSpent.toLocaleString("vi-VN")} đ</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
