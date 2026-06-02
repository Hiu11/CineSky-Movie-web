import React from "react";
import "./FnBSelector.css";

const FNB_ITEMS = [
  { id: "combo1", name: "Combo 1 Big Popcorn + 1 Coke", price: 75000, desc: "1 Bắp lớn + 1 Nước ngọt lớn", image: "/assets/images/fnb-combo1.jpg" },
  { id: "combo2", name: "Combo 1 Big Popcorn + 2 Coke", price: 95000, desc: "1 Bắp lớn + 2 Nước ngọt lớn", image: "/assets/images/fnb-combo2.jpg" },
  { id: "popcorn_sweet", name: "Bắp rang bơ ngọt", price: 55000, desc: "Bắp rang bơ caramel cỡ lớn", image: "/assets/images/fnb-popcorn.jpg" },
  { id: "coke", name: "Nước ngọt Coke", price: 35000, desc: "Ly lớn 32oz", image: "/assets/images/fnb-coke.jpg" },
];

export default function FnBSelector({ selectedFnB, onUpdateFnB, formatCurrency, isDesktopViewport }) {
  const getQuantity = (id) => {
    const item = selectedFnB.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

  const handleIncrease = (item) => {
    const qty = getQuantity(item.id);
    onUpdateFnB(item.id, qty + 1, item);
  };

  const handleDecrease = (item) => {
    const qty = getQuantity(item.id);
    if (qty > 0) {
      onUpdateFnB(item.id, qty - 1, item);
    }
  };

  return (
    <div className="fnb-selector-panel booking-panel-glass">
      <div className="fnb-header">
        <span className="booking-page__eyebrow">Bước 4</span>
        <h3>Bắp nước & Quà lưu niệm</h3>
        <p>Đặt trước trực tuyến để nhận ưu đãi và không phải xếp hàng</p>
      </div>

      <div className="fnb-grid">
        {FNB_ITEMS.map((item) => (
          <div key={item.id} className={`fnb-item-card ${getQuantity(item.id) > 0 ? "selected" : ""}`}>
            <div className="fnb-item-info">
              <h4>{item.name}</h4>
              <p>{item.desc}</p>
              <span className="fnb-price">{formatCurrency(item.price)} đ</span>
            </div>
            
            <div className="fnb-qty-controls">
              <button 
                type="button" 
                className="fnb-qty-btn decrease"
                onClick={() => handleDecrease(item)}
                disabled={getQuantity(item.id) === 0}
              >
                -
              </button>
              <span className="fnb-qty-value">{getQuantity(item.id)}</span>
              <button 
                type="button" 
                className="fnb-qty-btn increase"
                onClick={() => handleIncrease(item)}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
