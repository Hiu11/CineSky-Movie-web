import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";

const getScannerErrorMessage = (error) => {
  if (!window.isSecureContext) {
    return "Camera chỉ hoạt động trên HTTPS hoặc localhost. Nếu dùng điện thoại qua IP LAN, hãy bật HTTPS hoặc nhập mã tay.";
  }

  if (error?.name === "NotAllowedError") {
    return "Trình duyệt đang chặn quyền camera. Hãy cho phép camera rồi bật quét lại.";
  }

  if (error?.name === "NotFoundError") {
    return "Không tìm thấy camera trên thiết bị này.";
  }

  return error?.message || "Không thể mở camera. Bạn vẫn có thể nhập mã vé thủ công.";
};

const normalizeScannedTicketCode = (value = "") => {
  const rawValue = String(value || "").trim();

  if (!rawValue) {
    return "";
  }

  try {
    const payload = JSON.parse(rawValue);
    const payloadCode = payload?.ticketCode || payload?.code || payload?.ticket;

    if (payloadCode) {
      return String(payloadCode).trim().toUpperCase();
    }
  } catch {
    // QR can be a plain ticket code, a URL, or a small JSON payload.
  }

  try {
    const url = new URL(rawValue);
    const queryCode = url.searchParams.get("ticketCode") || url.searchParams.get("code");

    if (queryCode) {
      return queryCode.trim().toUpperCase();
    }

    const pathCode = url.pathname.split("/").filter(Boolean).at(-1);
    if (pathCode) {
      return pathCode.trim().toUpperCase();
    }
  } catch {
    // CineSky QR currently stores the raw ticket code.
  }

  const matchedCode = rawValue.match(/[A-Z0-9]{6,}/i)?.[0];
  return (matchedCode || rawValue).trim().toUpperCase();
};

export default function AdminCheckinView({
  handleCheckInTicket,
  handleLookupTicket,
  isTicketChecking,
  onScanTicket,
  setTicketSearch,
  ticketLookup,
  ticketMessage,
  ticketSearch,
}) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const readerRef = useRef(null);
  const lastScannedRef = useRef("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isScannerReady, setIsScannerReady] = useState(false);
  const [scannerMessage, setScannerMessage] = useState("");
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");

  const stopScanner = () => {
    controlsRef.current?.stop?.();
    controlsRef.current = null;
    setIsScannerReady(false);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const refreshCameraDevices = async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      return [];
    }

    const videoDevices = await BrowserQRCodeReader.listVideoInputDevices();
    setCameraDevices(videoDevices);

    if (!selectedDeviceId && videoDevices.length > 0) {
      const backCamera =
        videoDevices.find((device) => /back|rear|environment|sau/i.test(device.label)) ||
        videoDevices[0];
      setSelectedDeviceId(backCamera.deviceId);
    }

    return videoDevices;
  };

  const startScanner = async (deviceId = selectedDeviceId) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setScannerMessage("Thiết bị này không hỗ trợ truy cập camera từ trình duyệt.");
      return;
    }

    try {
      stopScanner();
      setIsScannerOpen(true);
      setScannerMessage("Đang mở camera...");
      lastScannedRef.current = "";

      const reader = readerRef.current || new BrowserQRCodeReader();
      readerRef.current = reader;
      const devices = await refreshCameraDevices();
      const preferredDeviceId =
        deviceId ||
        devices.find((device) => /back|rear|environment|sau/i.test(device.label))?.deviceId ||
        devices[0]?.deviceId;

      controlsRef.current = await reader.decodeFromVideoDevice(
        preferredDeviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            const ticketCode = normalizeScannedTicketCode(result.getText());

            if (ticketCode && ticketCode !== lastScannedRef.current) {
              lastScannedRef.current = ticketCode;
              setScannerMessage(`Đã quét mã ${ticketCode}. Đang tra vé...`);
              setTicketSearch(ticketCode);
              onScanTicket?.(ticketCode);
            }
            return;
          }

          if (error?.name && error.name !== "NotFoundException") {
            setScannerMessage("Camera đang quét, hãy giữ QR trong khung.");
          }
        }
      );

      if (preferredDeviceId) {
        setSelectedDeviceId(preferredDeviceId);
      }

      setIsScannerReady(true);
      setScannerMessage("Đưa QR check-in vào giữa khung để quét.");
    } catch (error) {
      stopScanner();
      setIsScannerOpen(false);
      setScannerMessage(getScannerErrorMessage(error));
    }
  };

  const handleToggleScanner = () => {
    if (isScannerOpen) {
      stopScanner();
      setIsScannerOpen(false);
      setScannerMessage("");
      return;
    }

    startScanner();
  };

  const handleCameraChange = (event) => {
    const nextDeviceId = event.target.value;
    setSelectedDeviceId(nextDeviceId);
    startScanner(nextDeviceId);
  };

  useEffect(() => () => stopScanner(), []);

  return (
    <div className="admin-checkin-grid">
      <section className="admin-panel admin-checkin-card">
        <span>Ticket gate</span>
        <h2>Scan / nhập mã vé</h2>
        <form onSubmit={handleLookupTicket} className="admin-checkin-form">
          <input
            value={ticketSearch}
            onChange={(event) => setTicketSearch(event.target.value.toUpperCase())}
            placeholder="VD: CSK01ABC234DE"
          />
          <button type="submit" disabled={isTicketChecking}>
            {isTicketChecking ? "Đang kiểm tra..." : "Tra vé"}
          </button>
        </form>

        <div className="admin-checkin-scanner">
          <div className="admin-checkin-scanner__actions">
            <button type="button" onClick={handleToggleScanner}>
              {isScannerOpen ? "Tắt camera" : "Quét QR bằng camera"}
            </button>
            {cameraDevices.length > 1 ? (
              <select value={selectedDeviceId} onChange={handleCameraChange} aria-label="Chọn camera">
                {cameraDevices.map((device, index) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${index + 1}`}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
          {isScannerOpen ? (
            <div className="admin-checkin-camera">
              <video ref={videoRef} muted playsInline autoPlay />
              <div className="admin-checkin-camera__frame" aria-hidden="true" />
              <span className={isScannerReady ? "is-ready" : ""}>
                {isScannerReady ? "Đang quét QR" : "Đang khởi động"}
              </span>
            </div>
          ) : null}
          {scannerMessage ? <p className="admin-checkin-scanner__message">{scannerMessage}</p> : null}
        </div>

        {ticketMessage ? <p className="admin-checkin-message">{ticketMessage}</p> : null}
      </section>

      <section className="admin-panel admin-checkin-result">
        {ticketLookup ? (
          <>
            <div className="admin-checkin-result__head">
              <div>
                <span>{ticketLookup.ticketCode}</span>
                <h2>{ticketLookup.movieTitle || "Vé xem phim"}</h2>
              </div>
              <strong className={`admin-checkin-status admin-checkin-status--${ticketLookup.status}`}>
                {ticketLookup.status === "used" ? "Đã check-in" : ticketLookup.status === "cancelled" ? "Đã hủy" : "Hợp lệ"}
              </strong>
            </div>
            <div className="admin-checkin-meta">
              <div>
                <small>Suất chiếu</small>
                <strong>{[ticketLookup.displayDate, ticketLookup.displayTime].filter(Boolean).join(" • ") || "Chưa có lịch"}</strong>
              </div>
              <div>
                <small>Phòng / ghế</small>
                <strong>{ticketLookup.roomName || "Phòng chiếu"} • {(ticketLookup.seatNumbers || []).join(", ")}</strong>
              </div>
              <div>
                <small>Khách hàng</small>
                <strong>{ticketLookup.customerName || ticketLookup.customerEmail || "Guest"}</strong>
              </div>
              <div>
                <small>Thanh toán</small>
                <strong>{Number(ticketLookup.totalPrice || 0).toLocaleString("vi-VN")} VND • {ticketLookup.paymentProvider || ticketLookup.paymentMethod || "Mock payment"}</strong>
              </div>
            </div>
            <button
              className="admin-checkin-confirm"
              type="button"
              onClick={handleCheckInTicket}
              disabled={isTicketChecking || ticketLookup.status === "cancelled" || ticketLookup.status === "used"}
            >
              {ticketLookup.status === "used" ? "Vé đã sử dụng" : "Xác nhận check-in"}
            </button>
          </>
        ) : (
          <p className="admin-checkin-empty">Thông tin vé sẽ hiện ở đây sau khi tra mã.</p>
        )}
      </section>
    </div>
  );
}
