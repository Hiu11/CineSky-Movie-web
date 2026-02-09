import React from 'react';

const FeedbackPage = () => {
  const formStyle = {
    background: '#181c31',
    padding: '30px',
    borderRadius: '8px',
    maxWidth: '600px',
    margin: '0 auto',
    color: 'white'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '4px',
    border: 'none'
  };

  return (
    <main className="main-content" style={{padding: '50px 0'}}>
      <div style={formStyle}>
        <h2 style={{color: '#f7b400', textAlign: 'center'}}>GÓP Ý VỚI CHÚNG TÔI</h2>
        <form>
            <label>Họ và tên</label>
            <input type="text" style={inputStyle} placeholder="Nhập tên của bạn" />
            
            <label>Email</label>
            <input type="email" style={inputStyle} placeholder="Nhập email" />
            
            <label>Nội dung góp ý</label>
            <textarea style={{...inputStyle, height: '100px'}} placeholder="Bạn muốn nhắn nhủ gì..."></textarea>
            
            <button type="button" className="btn btn-yellow" style={{width: '100%', marginTop: '20px'}}>
                GỬI GÓP Ý
            </button>
        </form>
      </div>
    </main>
  );
};

export default FeedbackPage;