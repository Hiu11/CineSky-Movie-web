import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBookingHistory, getMyFavorites } from "../../services/movieService";
import {
  getMyProfile,
  normalizeAuthUser,
  updateMyProfile,
  updateStoredUser,
  uploadMyAvatar,
} from "../../services/authService";
import MembershipCard3D from "../../components/MembershipCard3D/MembershipCard3D";
import CinematicBackdrop from "../../components/CinematicBackdrop/CinematicBackdrop";
import "./Profile.css";

const getSessionUser = () => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const rawUser = sessionStorage.getItem("user");
    return rawUser ? normalizeAuthUser(JSON.parse(rawUser)) : null;
  } catch {
    return null;
  }
};


const TIERS = [
  { name: "Member", min: 0, max: 500, label: "Thành viên" },
  { name: "Silver", min: 500, max: 1500, label: "Bạc" },
  { name: "Gold", min: 1500, max: 3000, label: "Vàng" },
  { name: "Diamond", min: 3000, max: Infinity, label: "Kim cương" }
];

const getTierProgress = (points, actualTierStr) => {
  const normalizedStr = actualTierStr ? actualTierStr.toLowerCase() : "";
  let currentTierIndex = TIERS.findIndex(t => 
    normalizedStr.includes(t.name.toLowerCase()) || 
    normalizedStr.includes(t.label.toLowerCase()) ||
    (normalizedStr && t.label.toLowerCase().includes(normalizedStr))
  );

  if (currentTierIndex === -1) {
    currentTierIndex = TIERS.findIndex(t => points >= t.min && points < t.max);
    if (currentTierIndex === -1) currentTierIndex = TIERS.length - 1;
  }

  const currentTier = TIERS[currentTierIndex];
  if (currentTierIndex === TIERS.length - 1) {
    return { percent: 100, current: currentTier.label, next: "MAX", needed: 0 };
  }

  const nextTier = TIERS[currentTierIndex + 1];
  const progress = Math.max(0, points - currentTier.min);
  const range = nextTier.min - currentTier.min;
  const percent = Math.min(100, (progress / range) * 100);

  return {
    percent,
    current: currentTier.label,
    next: nextTier.label,
    needed: Math.max(0, nextTier.min - points)
  };
};

export default function Profile() {
  const [user, setUser] = useState(() => getSessionUser());
  const [recentBookings, setRecentBookings] = useState([]);
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [savedPromotions, setSavedPromotions] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, settings, history
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    gender: "",
    birthday: "",
    avatar: "",
    password: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    setFormData({
      fullName: user?.fullName || user?.name || "",
      phone: user?.phone || "",
      gender: user?.gender || "",
      birthday: user?.birthday || "",
      avatar: user?.avatar || "",
      password: "",
    });
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      if (!user?.id) return;
      try {
        const profile = await getMyProfile();
        if (isMounted) {
          const normalizedUser = updateStoredUser(profile);
          setUser(normalizedUser);
          setSavedPromotions(profile.savedPromotions || []);
        }
      } catch {}
    };
    loadProfile();
    return () => { isMounted = false; };
  }, [user?.id]);

  useEffect(() => {
    let isMounted = true;
    const loadRecentBookings = async () => {
      if (!user?.id && !user?.email) return;
      try {
        const history = await getBookingHistory({ limit: 50 });
        if (isMounted) {
          setRecentBookings(Array.isArray(history?.bookings) ? history.bookings : []);
          if (history?.membership) {
            const normalizedUser = updateStoredUser({ ...user, membership: history.membership });
            setUser(normalizedUser);
          }
        }
      } catch {
        if (isMounted) setRecentBookings([]);
      }
    };
    loadRecentBookings();
    return () => { isMounted = false; };
  }, [user?.id, user?.email]);

  useEffect(() => {
    let isMounted = true;
    const loadFavorites = async () => {
      if (!user?.id && !user?.email) return;
      try {
        const favorites = await getMyFavorites({ limit: 8 });
        if (isMounted) {
          setFavoriteMovies(Array.isArray(favorites) ? favorites : []);
        }
      } catch {
        if (isMounted) setFavoriteMovies([]);
      }
    };
    loadFavorites();
    return () => { isMounted = false; };
  }, [user?.id, user?.email]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setSaveMessage("");
    setSaveError("");
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setSaveError("Vui lĂ²ng chá»n file áº£nh.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      setIsSaving(true);
      setSaveMessage("");
      setSaveError("");
      try {
        const updatedUser = await uploadMyAvatar({
          fileName: file.name,
          fileData: reader.result,
        });
        const normalizedUser = updateStoredUser(updatedUser);
        setUser(normalizedUser);
        setFormData((current) => ({ ...current, avatar: normalizedUser.avatar }));
        setSaveMessage("Táº£i áº£nh Ä‘áº¡i diá»‡n thĂ nh cĂ´ng.");
      } catch (error) {
        setSaveError(error.message || "KhĂ´ng thá»ƒ táº£i áº£nh Ä‘áº¡i diá»‡n.");
      } finally {
        setIsSaving(false);
        event.target.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveMessage("");
    setSaveError("");
    try {
      const updatedUser = await updateMyProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        gender: formData.gender,
        birthday: formData.birthday,
        avatar: formData.avatar,
        ...(formData.password ? { password: formData.password } : {}),
      });
      const normalizedUser = updateStoredUser(updatedUser);
      setUser(normalizedUser);
      setFormData((current) => ({ ...current, password: "" }));
      setSaveMessage("Cáº­p nháº­t há»“ sÆ¡ thĂ nh cĂ´ng.");
    } catch (error) {
      setSaveError(error.message || "KhĂ´ng thá»ƒ cáº­p nháº­t há»“ sÆ¡.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <main className="profile-page-empty">
        <section className="profile-empty-card">
          <span className="profile-kicker">Há»“ sÆ¡</span>
          <h1>ÄÄƒng nháº­p Ä‘á»ƒ má»Ÿ khĂ´ng gian cĂ¡ nhĂ¢n.</h1>
          <p>Báº£ng Ä‘iá»u khiá»ƒn 3D, tiáº¿n trĂ¬nh háº¡ng tháº» vĂ  lá»‹ch sá»­ giao dá»‹ch sáº½ hiá»ƒn thá»‹ táº¡i Ä‘Ă¢y.</p>
          <div className="profile-actions">
            <Link to="/login" className="glass-submit-btn">
              Äáº¿n trang Ä‘Äƒng nháº­p
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const points = Number(user?.membership?.points || 0);
  const totalSpent = recentBookings.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);
  
  // Giáº£ láº­p thá»i lÆ°á»£ng xem phim (2h / phim) náº¿u API chÆ°a tráº£ vá» duration
  const totalWatchHours = recentBookings.reduce((sum, booking) => {
    return sum + (booking.movie?.duration ? Math.round(booking.movie.duration / 60) : 2);
  }, 0);

  const tierInfo = getTierProgress(points, user?.membership?.tier);

  const pointHistory = recentBookings.map(booking => ({
    id: booking.id,
    date: booking.displayDate || booking.createdAt,
    movie: booking.movieTitle || "VĂ© xem phim",
    pointsEarned: Math.floor(Number(booking.totalPrice || 0) / 1000), // 1 point per 1000 VND
    type: "earn"
  }));

  return (
    <>
      {/* GALAXY BACKGROUND */}
      <CinematicBackdrop />

      <main className="profile-dashboard-layout">
        {/* SIDEBAR NAVIGATION */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-identity">
          <div className="sidebar-avatar-wrap">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.fullName || user.name} 
                className="sidebar-avatar" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.name || "U")}&background=f7b400&color=0f172a`;
                }}
              />
            ) : (
              <div className="sidebar-avatar-fallback">
                {(user.fullName || user.name || "U").trim().charAt(0).toUpperCase()}
              </div>
            )}
            <div className="sidebar-status-dot"></div>
          </div>
          <h2>{user.fullName || user.name || "CineSky Member"}</h2>
          <p>{user.email}</p>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Tá»•ng quan (Dashboard)
          </button>
          <button 
            className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Lá»‹ch sá»­ & Äiá»ƒm thÆ°á»Ÿng
          </button>
          <button 
            className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            CĂ i Ä‘áº·t tĂ i khoáº£n
          </button>
        </nav>

        <div className="sidebar-logout">
           <Link to="/login" className="logout-btn">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
             ÄÄƒng xuáº¥t
           </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <section className="dashboard-main-content">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="tab-fade-in">
            <header className="dashboard-header">
               <div>
                 <h1>KhĂ´ng gian cĂ¡ nhĂ¢n</h1>
                 <p>Theo dĂµi tiáº¿n trĂ¬nh thĂ nh viĂªn vĂ  khĂ¡m phĂ¡ cĂ¡c Ä‘áº·c quyá»n riĂªng.</p>
               </div>
            </header>

            <div className="dashboard-hero-glass">
              <div className="hero-card-3d-wrap">
                 <MembershipCard3D user={user} recentBookings={recentBookings} />
              </div>
              
              <div className="hero-tier-progress">
                 <div className="tier-header">
                    <h3>Háº¡ng {tierInfo.current}</h3>
                    <span className="tier-badge">{tierInfo.next !== "MAX" ? `HÆ°á»›ng tá»›i ${tierInfo.next}` : "Háº¡ng Cao Nháº¥t"}</span>
                 </div>
                 <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${tierInfo.percent}%` }}>
                       <div className="progress-glow"></div>
                    </div>
                 </div>
                 <div className="tier-footer">
                    <span>{points.toLocaleString("vi-VN")} Ä‘iá»ƒm</span>
                    <span>{tierInfo.next !== "MAX" ? `Cáº§n ${tierInfo.needed.toLocaleString("vi-VN")} Ä‘iá»ƒm ná»¯a` : "ÄĂ£ Ä‘áº¡t tá»‘i Ä‘a"}</span>
                 </div>
              </div>
            </div>

            <div className="dashboard-stats-grid">
               <div className="stat-glass-panel">
                  <div className="stat-icon pink">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                  </div>
                  <div className="stat-info">
                     <span>Tá»•ng phim Ä‘Ă£ xem</span>
                     <strong>{recentBookings.length}</strong>
                  </div>
               </div>
               <div className="stat-glass-panel">
                  <div className="stat-icon gold">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8M8 12h8"></path></svg>
                  </div>
                  <div className="stat-info">
                     <span>Tá»•ng chi tiĂªu</span>
                     <strong>{totalSpent.toLocaleString("vi-VN")} Ä‘</strong>
                  </div>
               </div>
               <div className="stat-glass-panel">
                  <div className="stat-icon purple">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  </div>
                  <div className="stat-info">
                     <span>Phim yĂªu thĂ­ch</span>
                     <strong>{favoriteMovies.length}</strong>
                  </div>
               </div>
               <div className="stat-glass-panel">
                  <div className="stat-icon blue">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </div>
                  <div className="stat-info">
                     <span>Sá»‘ giá» xem phim</span>
                     <strong>{totalWatchHours} giá»</strong>
                  </div>
               </div>
            </div>
            
            <div className="dashboard-favorites-section">
               <div className="section-header">
                 <h2>Phim yĂªu thĂ­ch</h2>
                 <Link to="/filter" className="link-more">KhĂ¡m phĂ¡ thĂªm</Link>
               </div>
               {favoriteMovies.length > 0 ? (
                 <div className="favorites-glass-grid">
                    {favoriteMovies.map(fav => {
                       const title = fav.movieTitle || fav.movie?.title;
                       const poster = fav.moviePoster || fav.movie?.poster;
                       return (
                         <Link key={fav.id} to={`/movie/${fav.movieId}`} className="fav-glass-card">
                            {poster ? (
                               <img src={poster} alt={title} className="fav-poster" />
                            ) : (
                               <div className="fav-poster-fallback"></div>
                            )}
                            <div className="fav-info">
                               <h4>{title}</h4>
                               <span>Xem chi tiáº¿t</span>
                            </div>
                         </Link>
                       )
                    })}
                 </div>
               ) : (
                 <div className="empty-glass-state">Báº¡n chÆ°a lÆ°u phim yĂªu thĂ­ch nĂ o.</div>
               )}
            </div>

            <div className="dashboard-favorites-section">
               <div className="section-header">
                 <h2>MĂ£ Æ°u Ä‘Ă£i Ä‘Ă£ lÆ°u</h2>
                 <Link to="/promotions" className="link-more">Xem Æ°u Ä‘Ă£i</Link>
               </div>
               {savedPromotions.length > 0 ? (
                 <div className="profile-voucher-grid">
                    {savedPromotions.map((promotion) => {
                      const requiredPoints = Number(promotion.requiredPoints || 0);
                      const progress = requiredPoints ? Math.min(100, Math.round((points / requiredPoints) * 100)) : 100;
                      return (
                        <article key={promotion.id} className="profile-voucher-card">
                          <span>{promotion.tier || promotion.kind}</span>
                          <h4>{promotion.title}</h4>
                          {promotion.code ? <code>{promotion.code}</code> : null}
                          <p>{promotion.description}</p>
                          {requiredPoints ? (
                            <div className="profile-voucher-progress">
                              <div><strong>{progress}%</strong><small>{points.toLocaleString("vi-VN")} / {requiredPoints.toLocaleString("vi-VN")} Ä‘iá»ƒm</small></div>
                              <i><b style={{ width: `${progress}%` }}></b></i>
                            </div>
                          ) : null}
                        </article>
                      );
                    })}
                 </div>
               ) : (
                 <div className="empty-glass-state">Báº¡n chÆ°a lÆ°u mĂ£ Æ°u Ä‘Ă£i nĂ o.</div>
               )}
            </div>
          </div>
        )}

        {/* HISTORY & POINTS TAB */}
        {activeTab === 'history' && (
          <div className="tab-fade-in">
             <header className="dashboard-header">
               <div>
                 <h1>Lá»‹ch sá»­ & Äiá»ƒm thÆ°á»Ÿng</h1>
                 <p>Theo dĂµi má»i giao dá»‹ch vĂ  Ä‘iá»ƒm tĂ­ch lÅ©y cá»§a báº¡n.</p>
               </div>
            </header>
            
            <div className="history-split-grid">
               {/* PAYMENT HISTORY */}
               <div className="glass-panel-section">
                  <h2>Lá»‹ch sá»­ thanh toĂ¡n</h2>
                  <div className="glass-table-wrapper">
                     {recentBookings.length > 0 ? (
                        <table className="glass-table">
                           <thead>
                              <tr>
                                 <th>MĂ£ vĂ©</th>
                                 <th>Phim & Thá»i gian</th>
                                 <th>Tá»•ng tiá»n</th>
                                 <th>Tráº¡ng thĂ¡i</th>
                              </tr>
                           </thead>
                            <tbody>
                              {recentBookings.map(booking => (
                                 <tr key={booking.id}>
                                    <td data-label="MĂ£ vĂ©"><span className="mono-badge">#{booking.id?.slice(0,6).toUpperCase() || "TKT"}</span></td>
                                    <td data-label="Phim & Thá»i gian">
                                       <strong>{booking.movieTitle}</strong>
                                       <br/>
                                       <small>{[booking.displayDate, booking.displayTime].filter(Boolean).join(" â€¢ ")}</small>
                                       <div className="booking-details-mini">
                                         Gháº¿: {booking.seats?.join(", ") || "N/A"}
                                         {booking.fnbItems?.length > 0 && (
                                           <> | Báº¯p nÆ°á»›c: {booking.fnbItems.map(i => `${i.quantity}x ${i.name}`).join(", ")}</>
                                         )}
                                       </div>
                                    </td>
                                    <td data-label="Tá»•ng tiá»n"><strong>{Number(booking.totalPrice || 0).toLocaleString("vi-VN")} Ä‘</strong></td>
                                    <td data-label="Tráº¡ng thĂ¡i"><span className="status-badge success">ThĂ nh cĂ´ng</span></td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     ) : (
                        <div className="empty-glass-state">ChÆ°a cĂ³ giao dá»‹ch nĂ o.</div>
                     )}
                  </div>
               </div>

               {/* POINTS HISTORY */}
               <div className="glass-panel-section">
                  <h2>Lá»‹ch sá»­ Ä‘iá»ƒm thÆ°á»Ÿng</h2>
                  <div className="points-timeline">
                     {pointHistory.length > 0 ? (
                        pointHistory.map((pt, idx) => (
                           <div className="timeline-item" key={idx}>
                              <div className="timeline-dot plus"></div>
                              <div className="timeline-content">
                                 <div className="timeline-head">
                                    <h4>TĂ­ch Ä‘iá»ƒm vĂ©: {pt.movie}</h4>
                                    <span className="points-plus">+{pt.pointsEarned} pt</span>
                                 </div>
                                 <p>Giao dá»‹ch thĂ nh cĂ´ng, Ä‘iá»ƒm Ä‘Æ°á»£c tá»± Ä‘á»™ng cá»™ng vĂ o vĂ­.</p>
                                 <small>{pt.date}</small>
                              </div>
                           </div>
                        ))
                     ) : (
                        <div className="empty-glass-state">ChÆ°a cĂ³ lá»‹ch sá»­ Ä‘iá»ƒm thÆ°á»Ÿng.</div>
                     )}
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="tab-fade-in">
             <header className="dashboard-header">
               <div>
                 <h1>CĂ i Ä‘áº·t tĂ i khoáº£n</h1>
                 <p>Quáº£n lĂ½ thĂ´ng tin cĂ¡ nhĂ¢n vĂ  báº£o máº­t.</p>
               </div>
            </header>

            <form className="glass-form-panel" onSubmit={handleProfileSubmit}>
               <div className="form-grid">
                  <div className="form-group">
                     <label>Há» vĂ  tĂªn</label>
                     <input className="glass-input" name="fullName" value={formData.fullName} onChange={handleFieldChange} placeholder="Nháº­p há» vĂ  tĂªn" />
                  </div>
                  <div className="form-group">
                     <label>Email (KhĂ´ng thá»ƒ Ä‘á»•i)</label>
                     <input className="glass-input disabled" value={user.email || ""} disabled />
                  </div>
                  <div className="form-group">
                     <label>Sá»‘ Ä‘iá»‡n thoáº¡i</label>
                     <input className="glass-input" name="phone" value={formData.phone} onChange={handleFieldChange} placeholder="Nháº­p sá»‘ Ä‘iá»‡n thoáº¡i" />
                  </div>
                  <div className="form-group">
                     <label>Giá»›i tĂ­nh</label>
                     <select className="glass-input select" name="gender" value={formData.gender} onChange={handleFieldChange}>
                        <option value="">Chá»n giá»›i tĂ­nh</option>
                        <option value="Nam">Nam</option>
                        <option value="Ná»¯">Ná»¯</option>
                        <option value="KhĂ¡c">KhĂ¡c</option>
                     </select>
                  </div>
                  <div className="form-group">
                     <label>NgĂ y sinh</label>
                     <input className="glass-input" type="date" name="birthday" value={formData.birthday} onChange={handleFieldChange} />
                  </div>
                  <div className="form-group">
                     <label>Link áº£nh Ä‘áº¡i diá»‡n</label>
                     <input className="glass-input" name="avatar" value={formData.avatar} onChange={handleFieldChange} placeholder="https://..." />
                  </div>
                  <div className="form-group full-width">
                     <label>Táº£i áº£nh lĂªn (Max 2MB)</label>
                     <div className="glass-file-upload">
                        <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={isSaving} />
                        <span className="upload-btn">Chá»n áº£nh tá»« mĂ¡y</span>
                     </div>
                  </div>
                  <div className="form-group full-width">
                     <label>Äá»•i máº­t kháº©u</label>
                     <input className="glass-input" type="password" name="password" value={formData.password} onChange={handleFieldChange} placeholder="Nháº­p máº­t kháº©u má»›i (Ä‘á»ƒ trá»‘ng náº¿u khĂ´ng Ä‘á»•i)" />
                  </div>
               </div>

               <div className="form-footer">
                  <div className="form-messages">
                     {saveError && <span className="msg error">{saveError}</span>}
                     {saveMessage && <span className="msg success">{saveMessage}</span>}
                  </div>
                  <button type="submit" className="glass-submit-btn" disabled={isSaving}>
                     {isSaving ? "Äang lÆ°u..." : "LÆ°u thay Ä‘á»•i"}
                  </button>
               </div>
            </form>
          </div>
        )}

      </section>
    </main>
    </>
  );
}

