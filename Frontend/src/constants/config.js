// File cấu hình các hằng số tập trung cho toàn dự án
export const API_CONFIG = {
    // Tự động chuyển đổi URL dựa theo môi trường chạy (Development vs Production)
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    TIMEOUT: 10000,
};

export const MOVIE_GENRES = {
    ACTION: 'Hành động',
    COMEDY: 'Hài kịch',
    DRAMA: 'Tâm lý',
    HORROR: 'Kinh dị',
    SCI_FI: 'Viễn tưởng',
    ROMANCE: 'Tình cảm',
    ANIMATION: 'Hoạt hình',
    THRILLER: 'Giật gân',
    FANTASY: 'Kỳ ảo',
    DOCUMENTARY: 'Tài liệu'
};

export const BOOKING_STATUS = {
    BOOKED: 'booked',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
    USED: 'used'
};
