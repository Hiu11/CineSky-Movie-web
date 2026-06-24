import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getRentalMovieById, RENTAL_MOVIES } from "../../data/rentalMovies";
import { getMovies } from "../../services/movieService";
import { GALAXY_PAYMENT_METHODS, formatVnd } from "../../utils/paymentUi";
import "./RentPayment.css";

const LOGO = "/assets/images/logo.svg";
const RENT_PRICE = 50000;
const PLAN_NAMES = {
  vip: "Gói CineSky VIP",
  bundle: "Gói Siêu Việt",
};
const VALID_PLANS = new Set(["movie", "vip", "bundle"]);

const today = new Date();
const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
const formatDate = (date) => date.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

const normalizeMovieId = (id = "") => {
  const value = String(id || "").trim();
  const numericValue = Number(value);

  return Number.isFinite(numericValue) && value !== "" ? String(numericValue) : value;
};

const toRentalCatalog = (movies = []) =>
  movies.map((movie, index) => ({
    ...movie,
    id: `r${String(index + 1).padStart(3, "0")}`,
    sourceMovieId: movie.id,
    leftTheatersLabel: "Đã rời rạp",
  }));

const getInitialPlan = (searchParams) => {
  const plan = searchParams.get("plan");
  return VALID_PLANS.has(plan) ? plan : "bundle";
};

const buildRental = (movie, selectedPlan) => {
  const isVip = selectedPlan === "vip";
  const isSingleMovie = selectedPlan === "movie";

  return {
    title: movie?.title || RENTAL_MOVIES[0].title,
    poster: movie?.poster || RENTAL_MOVIES[0].poster,
    plan: isSingleMovie ? "Thuê phim lẻ" : isVip ? PLAN_NAMES.vip : PLAN_NAMES.bundle,
    displayPlan: isSingleMovie ? "Thuê phim" : isVip ? "CineSky VIP" : "Siêu Việt",
    duration: isSingleMovie ? "48 giờ" : "01 tháng",
    effectiveDate: formatDate(today),
    renewalDate: formatDate(nextMonth),
    originalPrice: isSingleMovie ? RENT_PRICE : isVip ? 199000 : 129000,
    discount: isSingleMovie ? 0 : isVip ? 20000 : 30000,
    total: isSingleMovie ? RENT_PRICE : isVip ? 179000 : 99000,
  };
};

const getUserDisplayName = (user) =>
  user?.phone || user?.phoneNumber || user?.email || user?.fullName || user?.name || "tài khoản CineSky";

export default function RentPayment({ isLoggedIn = false, user = null }) {
  const { movieId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const movieQueryId = searchParams.get("movieId");
  const isPay = location.pathname.includes("/rent/pay");
  const [rentalCatalog, setRentalCatalog] = useState(RENTAL_MOVIES);
  const [isRentalLoading, setIsRentalLoading] = useState(true);
  const requestedMovieId = movieId || movieQueryId || rentalCatalog[0]?.id || RENTAL_MOVIES[0].id;
  const movie = useMemo(
    () =>
      rentalCatalog.find(
        (item) =>
          String(item.id) === String(requestedMovieId) ||
          normalizeMovieId(item.sourceMovieId) === normalizeMovieId(requestedMovieId)
      ) ||
      getRentalMovieById(requestedMovieId),
    [rentalCatalog, requestedMovieId]
  );
  const isUnavailableRental = Boolean(requestedMovieId && !movie);

  const [selectedPlan, setSelectedPlan] = useState(() => getInitialPlan(searchParams));
  const [selectedMethod, setSelectedMethod] = useState("card");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(599);

  const rental = useMemo(() => buildRental(movie, selectedPlan), [movie, selectedPlan]);
  const activeMethod = GALAXY_PAYMENT_METHODS.find((method) => method.id === selectedMethod) || GALAXY_PAYMENT_METHODS[0];
  const accountLabel = getUserDisplayName(user);
  const loginRedirectState = {
    from: `${location.pathname}${location.search}`,
    message: "Vui lòng đăng nhập để tiếp tục thanh toán thuê phim.",
  };

  useEffect(() => {
    const nextPlan = getInitialPlan(searchParams);
    setSelectedPlan(nextPlan);
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    getMovies({ status: "rental", includeRental: "1", limit: 100 })
      .then((movies) => {
        if (!isMounted) return;
        const nextCatalog = Array.isArray(movies) && movies.length > 0
          ? toRentalCatalog(movies)
          : RENTAL_MOVIES;
        setRentalCatalog(nextCatalog);
      })
      .catch(() => {
        if (isMounted) {
          setRentalCatalog(RENTAL_MOVIES);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsRentalLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!walletOpen) {
      return undefined;
    }

    setSecondsLeft(599);
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(value - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [walletOpen]);

  useEffect(() => {
    if (!walletOpen) {
      setQrDataUrl("");
      return;
    }

    const payload = `CINESKY|${activeMethod.title}|${rental.title}|${rental.total}|${Date.now()}`;
    QRCode.toDataURL(payload, {
      width: 220,
      margin: 1,
      color: { dark: "#111827", light: "#ffffff" },
    }).then(setQrDataUrl).catch(() => setQrDataUrl(""));
  }, [activeMethod.title, rental.title, rental.total, walletOpen]);

  const choosePlan = (plan) => {
    setSelectedPlan(plan);
    if (isPay && movie) {
      navigate(`/rent/pay?movieId=${movie.id}&plan=${plan}`, { replace: true });
    }
  };

  const continueToPay = () => {
    if (!movie) return;
    navigate(`/rent/pay?movieId=${movie.id}&plan=${selectedPlan}`);
  };

  const handlePayment = () => {
    if (!isLoggedIn) {
      navigate("/login", { state: loginRedirectState });
      return;
    }

    if (selectedMethod === "card") {
      setConfirmOpen(true);
    } else {
      setWalletOpen(true);
    }
  };

  const handleCompletePayment = () => {
    if (!isLoggedIn) {
      navigate("/login", { state: loginRedirectState });
      return;
    }

    setConfirmOpen(false);
    setWalletOpen(false);
    setSuccessOpen(true);
  };

  const countdown = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}s`;

  if (isRentalLoading && !movie) {
    return (
      <main className="rent-page">
        <div className="rent-topbar">
          <Link to="/" className="rent-brand"><img src={LOGO} alt="CineSky" /></Link>
          <div><span>Đang tải kho phim thuê</span></div>
        </div>
        <section className="rent-loading">Đang tải kho phim thuê...</section>
      </main>
    );
  }

  if (isUnavailableRental) {
    return (
      <main className="rent-page">
        <div className="rent-topbar">
          <Link to="/" className="rent-brand"><img src={LOGO} alt="CineSky" /></Link>
          <div><span>Phim thuê chỉ áp dụng cho phim đã rời rạp</span></div>
        </div>
        <section className="rent-unavailable">
          <span>Không thể thuê phim này</span>
          <h1>Phim đang chiếu hoặc sắp chiếu chưa mở thuê online.</h1>
          <p>Vui lòng đặt vé tại rạp, hoặc chọn phim đã rời rạp trong kho thuê.</p>
          <div className="rent-unavailable__actions">
            <Link to="/?tab=now">Xem phim đang chiếu</Link>
            <Link to={`/rent/${rentalCatalog[0]?.id || RENTAL_MOVIES[0].id}`}>Xem kho phim thuê</Link>
          </div>
        </section>
      </main>
    );
  }

  if (!isPay) {
    return (
      <main className="rent-page">
        <div className="rent-topbar">
          <Link to="/" className="rent-brand"><img src={LOGO} alt="CineSky" /></Link>
          <div>
            {isLoggedIn ? (
              <span>Xin chào, {accountLabel}</span>
            ) : (
              <>
                <span>Nếu đã có gói, vui lòng</span>
                <Link to="/login" state={loginRedirectState}>Đăng nhập</Link>
              </>
            )}
          </div>
        </div>

        <section className="rent-select">
          <h1>Bạn đang chọn thuê</h1>
          <div className="rent-library-strip" aria-label="Kho phim thuê">
            {rentalCatalog.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === movie.id ? "is-active" : ""}
                onClick={() => navigate(`/rent/${item.id}?plan=${selectedPlan}`)}
              >
                <img src={item.poster} alt={item.title} />
                <span>{item.title}</span>
              </button>
            ))}
          </div>

          <button className={"rent-select__movie" + (selectedPlan === "movie" ? " is-active" : "")} onClick={() => choosePlan("movie")}>
            <span>{rental.title}</span>
            <strong>{formatVnd(RENT_PRICE)}</strong>
          </button>

          <div className="rent-select__divider"><span>Tiết kiệm hơn với Combo</span></div>

          <button className={"rent-select__combo" + (selectedPlan === "vip" ? " is-active" : "")} onClick={() => choosePlan("vip")}>
            <span className="rent-select__tag">Chỉ 179K!</span>
            <strong>{PLAN_NAMES.vip}</strong>
            <b>{formatVnd(199000)}</b>
            <ul>
              <li>Thời hạn 1 tháng, gia hạn tự động.</li>
              <li>Đã bao gồm phim bạn đang chọn thuê.</li>
              <li>Xem phim không giới hạn với kho nội dung đặc sắc.</li>
            </ul>
          </button>

          <button className={"rent-select__combo" + (selectedPlan === "bundle" ? " is-active" : "")} onClick={() => choosePlan("bundle")}>
            <span className="rent-select__tag">+ 1 Vé CINESKY</span>
            <strong>{PLAN_NAMES.bundle}</strong>
            <b>{formatVnd(99000)}</b>
            <small>Giá gốc {formatVnd(129000)}</small>
            <ul>
              <li>Thời hạn 1 tháng, gia hạn tự động.</li>
              <li>Đã bao gồm phim bạn đang chọn thuê.</li>
              <li>Kho phim Việt và Châu Á chọn lọc.</li>
            </ul>
          </button>

          <button className="rent-primary" type="button" onClick={continueToPay}>Tiếp tục</button>
          <p className="rent-select__note">Chất lượng hình ảnh phụ thuộc vào dịch vụ internet và thiết bị của bạn.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="rent-page rent-page--pay">
      <div className="rent-topbar rent-topbar--pay">
        <Link to="/" className="rent-brand"><img src={LOGO} alt="CineSky" /></Link>
        <strong>Phương thức thanh toán</strong>
        <div>
          {isLoggedIn ? (
            <span>Xin chào, {accountLabel}</span>
          ) : (
            <>
              <span>Nếu đã có gói, vui lòng</span>
              <Link to="/login" state={loginRedirectState}>Đăng nhập</Link>
            </>
          )}
        </div>
      </div>

      <section className="rent-checkout">
        <div className="rent-checkout__left">
          <article className="rent-plan-card">
            <h1>{rental.displayPlan}</h1>
            <div className="rent-plan-card__body">
              <div className="rent-plan-card__poster">
                <img src={rental.poster} alt={rental.title} />
                <strong>{rental.displayPlan}</strong>
              </div>
              <div>
                <h2>Quyền lợi gói</h2>
                {selectedPlan === "movie" ? (
                  <>
                    <p>✓ Thuê phim trong 48 giờ kể từ khi thanh toán.</p>
                    <p>✓ Xem lại nhiều lần trong thời hạn thuê.</p>
                    <p>✓ Chỉ áp dụng với phim đã rời rạp.</p>
                  </>
                ) : (
                  <>
                    <p>✓ Thời hạn 1 tháng, gia hạn tự động.</p>
                    <p>✓ Đã bao gồm phim bạn đang chọn thuê.</p>
                    <p>✓ Kho phim có sẵn với hơn 10.000 giờ nội dung đặc sắc cùng kho phim thuê Việt và Châu Á.</p>
                  </>
                )}
              </div>
            </div>
          </article>

          <article className="rent-method-card">
            <h2>Phương thức thanh toán</h2>
            <div className="rent-method-card__list">
              {GALAXY_PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id)}
                  className={"rent-method" + (selectedMethod === method.id ? " is-active" : "")}
                >
                  <span className="rent-method__radio"></span>
                  <span className="rent-method__logos">
                    {method.logos.map((logo) => <img key={logo} src={logo} alt="" />)}
                  </span>
                  <span><strong>{method.title}</strong><small>{method.helper}</small></span>
                </button>
              ))}
            </div>
          </article>
        </div>

        <aside className="rent-summary">
          <h2>Thông tin thanh toán</h2>
          <p>{isLoggedIn ? "Tài khoản" : "Trạng thái"}: <strong>{isLoggedIn ? accountLabel : "Chưa đăng nhập"}</strong></p>
          <div className="rent-summary__rows">
            <span>Tên gói</span><strong>{rental.plan}</strong>
            <span>Thời hạn</span><strong>{rental.duration}</strong>
            <span>Ngày hiệu lực</span><strong>{rental.effectiveDate}</strong>
            <span>Ngày gia hạn *</span><strong>{rental.renewalDate}</strong>
            <span>Đơn giá</span><strong>{formatVnd(rental.originalPrice)}</strong>
          </div>
          <button className="rent-summary__voucher" type="button" onClick={() => setPromoOpen(true)}>
            Áp dụng ưu đãi <span>Chọn hoặc nhập mã ›</span>
          </button>
          <div className="rent-summary__total">
            <span>Khuyến mãi</span><strong>{formatVnd(rental.discount)}</strong>
            <span>Tổng tiền</span><b>{formatVnd(rental.total)}</b>
          </div>
          {selectedPlan === "movie" ? null : <p className="rent-summary__gift">Tặng 1 vé xem phim rạp CINESKY</p>}
          <p className="rent-summary__warn">Đây là ưu đãi tạm tính, thông tin thanh toán có thể thay đổi theo tài khoản của Quý khách.</p>
          <button className="rent-primary" type="button" onClick={handlePayment}>
            {isLoggedIn ? "Thanh toán" : "Đăng nhập để thanh toán"}
          </button>
          {!isLoggedIn ? <p className="rent-summary__auth">Vui lòng đăng nhập để hoàn tất thuê phim.</p> : null}
          <p className="rent-summary__terms">Bằng việc thanh toán, Quý khách đã đồng ý với Quy chế sử dụng Dịch vụ của CineSky.</p>
        </aside>
      </section>

      {confirmOpen ? (
        <div className="rent-modal" role="dialog" aria-modal="true">
          <div className="rent-confirm">
            <button type="button" className="rent-modal__close" onClick={() => setConfirmOpen(false)} aria-label="Đóng">×</button>
            <img src={LOGO} alt="CineSky" />
            <p>Bạn đang thanh toán với tài khoản</p>
            <h2>{accountLabel}</h2>
            <dl>
              <div><dt>Tên gói</dt><dd>{rental.plan}</dd></div>
              <div><dt>Thời hạn</dt><dd>{rental.duration}</dd></div>
              <div><dt>Ngày hiệu lực</dt><dd>{rental.effectiveDate}</dd></div>
              <div><dt>Ngày gia hạn *</dt><dd>{rental.renewalDate}</dd></div>
              <div><dt>Đơn giá</dt><dd>{formatVnd(rental.originalPrice)}</dd></div>
              <div><dt>Khuyến mãi</dt><dd>{formatVnd(rental.discount)}</dd></div>
              <div><dt>Tổng tiền</dt><dd>{formatVnd(rental.total)}</dd></div>
            </dl>
            {selectedPlan === "movie" ? null : <p className="rent-summary__gift">Tặng 1 vé xem phim rạp CINESKY</p>}
            <div className="rent-confirm__actions">
              <button type="button" onClick={() => setConfirmOpen(false)}>Để sau</button>
              <button type="button" onClick={handleCompletePayment}>Thanh toán</button>
            </div>
          </div>
        </div>
      ) : null}

      {walletOpen ? (
        <div className="rent-modal" role="dialog" aria-modal="true">
          <div className="rent-wallet">
            <header>
              <span className="rent-method__logos">{activeMethod.logos.map((logo) => <img key={logo} src={logo} alt="" />)}</span>
              <strong>Thanh toán bằng {activeMethod.title}</strong>
              <button type="button" onClick={() => setWalletOpen(false)}>Đổi phương thức khác</button>
              <button type="button" className="rent-modal__x" onClick={() => setWalletOpen(false)} aria-label="Đóng">×</button>
            </header>
            <div className="rent-wallet__body">
              <div className="rent-wallet__qr">
                {qrDataUrl ? <img src={qrDataUrl} alt="QR thanh toán" /> : <span>Đang tạo QR...</span>}
                <p><span>Số tiền</span><strong>{formatVnd(rental.total)}</strong></p>
              </div>
              <div className="rent-wallet__steps">
                <p>Bước 1: Mở ứng dụng và đăng nhập {activeMethod.title}</p>
                <p>Bước 2: Bấm chọn biểu tượng quét QR ở góc phải phía trên màn hình.</p>
                <p>Bước 3: Bấm chọn "Xác nhận" để thanh toán.</p>
                <div>Thời hạn thanh toán sẽ hết hạn sau <strong>{countdown}</strong></div>
                <button type="button" className="rent-wallet__complete" onClick={handleCompletePayment}>
                  Tôi đã thanh toán
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {promoOpen ? (
        <div className="rent-modal" role="dialog" aria-modal="true">
          <div className="rent-promo">
            <button type="button" className="rent-modal__close" onClick={() => setPromoOpen(false)} aria-label="Đóng">×</button>
            <h2>Ưu đãi khả dụng</h2>
            <button type="button" onClick={() => setPromoOpen(false)}>
              CINESKY30 <span>Giảm 30.000đ cho Gói Siêu Việt</span>
            </button>
            <button type="button" onClick={() => setPromoOpen(false)}>
              CINESKYVIP <span>Giá ưu đãi 179.000đ cho Gói CineSky VIP</span>
            </button>
          </div>
        </div>
      ) : null}

      {successOpen ? (
        <div className="rent-modal" role="dialog" aria-modal="true">
          <div className="rent-success">
            <img src={LOGO} alt="CineSky" />
            <h2>Thanh toán thành công</h2>
            <p>{rental.title} đã được thêm vào thư viện thuê phim của tài khoản {accountLabel}.</p>
            <button type="button" className="rent-primary" onClick={() => setSuccessOpen(false)}>Hoàn tất</button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
