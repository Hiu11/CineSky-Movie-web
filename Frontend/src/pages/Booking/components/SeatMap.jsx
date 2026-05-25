import { useMemo } from "react";

const createSeatPatternRows = (rowBlocks = []) =>
  rowBlocks.map((blocks, i) => ({
    rowKey: String.fromCharCode(65 + i),
    left: blocks[0] || 0,
    center: blocks[1] || 0,
    right: blocks[2] || 0,
  }));

const SMALL_HALL = createSeatPatternRows([[2,10,2],[2,10,2],[2,14,2],[2,14,2],[2,16,2],[2,16,2],[2,18,2],[2,18,2],[3,18,3],[3,18,3]]);
const MEDIUM_HALL = createSeatPatternRows([[2,12,2],[2,12,2],[2,16,2],[2,16,2],[2,18,2],[2,18,2],[3,18,3],[3,18,3],[3,20,3],[3,20,3]]);
const LARGE_HALL = createSeatPatternRows([[2,14,2],[2,14,2],[3,16,3],[3,16,3],[3,18,3],[3,18,3],[4,20,4],[4,20,4],[4,22,4],[4,22,4],[4,22,4],[4,22,4]]);

const ROOM_SEAT_PATTERNS = {
  "Sky Hall 1": SMALL_HALL, "Sky Hall 2": SMALL_HALL,
  "Moon Hall": MEDIUM_HALL, "Galaxy Hall": MEDIUM_HALL,
  "Nova Hall": LARGE_HALL, "Aurora Hall": LARGE_HALL,
};

const groupSeatsByRow = (seatLabels = []) => {
  const map = new Map();
  seatLabels.forEach((s) => {
    const rowKey = String(s).replace(/\d+/g, "") || "ROW";
    const cur = map.get(rowKey) || [];
    cur.push(s);
    map.set(rowKey, cur);
  });
  return Array.from(map.entries()).map(([rowKey, seats]) => ({
    rowKey,
    seats: seats.sort((a, b) => Number(String(a).replace(/\D+/g, "")) - Number(String(b).replace(/\D+/g, ""))),
  }));
};

const getFallbackSeatPattern = (count = 0) => {
  if (count <= 6) return { left: 0, center: count, right: 0 };
  const side = count >= 26 ? 3 : 2;
  return { left: side, center: Math.max(count - side * 2, 0), right: side };
};

const getSeatPatternForRow = (roomName = "", rowKey = "", rowIndex = 0, count = 0) => {
  const patterns = ROOM_SEAT_PATTERNS[roomName] || [];
  const matched = patterns.find((p) => p.rowKey === rowKey) || patterns[rowIndex];
  if (matched && matched.left + matched.center + matched.right === count) return matched;
  return getFallbackSeatPattern(count);
};

const splitSeatRowByPattern = (seats = [], pattern = {}) => {
  const l = Math.max(pattern.left || 0, 0);
  const c = Math.max(pattern.center || 0, 0);
  return { leftSeats: seats.slice(0, l), centerSeats: seats.slice(l, l + c), rightSeats: seats.slice(l + c) };
};

const buildSeatSlots = (seats = [], slotCount = 0, align = "center") => {
  if (slotCount <= seats.length) return seats;
  const totalPad = slotCount - seats.length;
  const leading = align === "start" ? 0 : align === "end" ? totalPad : Math.floor(totalPad / 2);
  const trailing = totalPad - leading;
  return [...Array.from({ length: leading }, () => null), ...seats, ...Array.from({ length: trailing }, () => null)];
};

const getSeatToneForRow = (rowKey = "", totalRows = 0) => {
  const idx = Math.max(String(rowKey).charCodeAt(0) - 65, 0);
  if (totalRows >= 10 && idx >= totalRows - 2) return "couple";
  if (idx >= Math.max(3, Math.floor(totalRows / 3)) && idx <= totalRows - 3) return "vip";
  return "standard";
};

function SeatBtn({ seat, seatTone, isBooked, isSelected, onToggle }) {
  return (
    <button
      onClick={() => onToggle(seat)}
      className={`booking-page__seat booking-page__seat--${seatTone}${isSelected ? " is-selected" : ""}${isBooked ? " is-booked" : ""}`}
      disabled={isBooked}
    >
      {seat}
    </button>
  );
}

export default function SeatMap({ selectedShowtime, selectedSeats, bookedSeats, seatScale, setSeatScale, seatBaseSize, selectedScreeningDateLabel, onToggleSeat }) {
  const groupedSeats = useMemo(() => groupSeatsByRow(selectedShowtime?.seats || []), [selectedShowtime]);

  const preparedSeatRows = useMemo(() =>
    groupedSeats.map((group, i) => {
      const pattern = getSeatPatternForRow(selectedShowtime?.roomName || "", group.rowKey, i, group.seats.length);
      const blocks = splitSeatRowByPattern(group.seats, pattern);
      return { ...group, ...pattern, ...blocks };
    }),
    [groupedSeats, selectedShowtime]
  );

  const metrics = useMemo(() =>
    preparedSeatRows.reduce((acc, g) => ({
      maxLeft: Math.max(acc.maxLeft, g.left || 0),
      maxCenter: Math.max(acc.maxCenter, g.center || 0),
      maxRight: Math.max(acc.maxRight, g.right || 0),
    }), { maxLeft: 0, maxCenter: 0, maxRight: 0 }),
    [preparedSeatRows]
  );

  return (
    <section className="booking-page__panel booking-page__panel--screening">
      <div className="booking-page__panel-header booking-page__panel-header--split">
        <div>
          <span className="booking-page__eyebrow">Bước 3</span>
          <h2>Chọn ghế</h2>
        </div>
        <div className="booking-page__screening-meta">
          <span>{selectedScreeningDateLabel || selectedShowtime?.displayDate || "Chưa có lịch"}</span>
          <span>{selectedShowtime?.displayTime || "Chưa có suất"}</span>
          <span>{selectedShowtime?.roomName || "Chưa có phòng"}</span>
        </div>
      </div>

      <div className="booking-page__screening-toolbar">
        <div className="booking-page__legend">
          {[
            { label: "Còn trống", mod: "" },
            { label: "Ghế VIP", mod: "--vip" },
            { label: "Ghế couple", mod: "--couple" },
            { label: "Đang chọn", mod: "--selected" },
            { label: "Đã có người đặt", mod: "--booked" },
          ].map(({ label, mod }) => (
            <span key={label} className="booking-page__legend-item">
              <i className={`booking-page__legend-swatch${mod ? " booking-page__legend-swatch" + mod : ""}`}></i>
              {label}
            </span>
          ))}
        </div>
        <div className="booking-page__zoom-controls">
          <span>Thu phóng ghế</span>
          <button type="button" onClick={() => setSeatScale((s) => Math.max(0.65, s - 0.05))}>-</button>
          <strong>{Math.round(seatScale * 100)}%</strong>
          <button type="button" onClick={() => setSeatScale((s) => Math.min(1.5, s + 0.05))}>+</button>
        </div>
      </div>

      <div className="booking-page__screening" style={{ "--booking-seat-size": `${Math.round(seatBaseSize * seatScale)}px` }}>
        <div className="booking-page__screen-shell">
          <span className="booking-page__screen-caption">screen</span>
          <div className="booking-page__screen"></div>
        </div>

        {preparedSeatRows.length > 0 ? (
          preparedSeatRows.map((group) => {
            const tone = getSeatToneForRow(group.rowKey, preparedSeatRows.length);
            const leftSlots = buildSeatSlots(group.leftSeats, metrics.maxLeft, "start");
            const centerSlots = buildSeatSlots(group.centerSeats, metrics.maxCenter, "center");
            const rightSlots = buildSeatSlots(group.rightSeats, metrics.maxRight, "end");

            const renderSeatSlots = (slots, blockClass) => (
              <div
                className={`booking-page__seat-block ${blockClass}`}
                style={{ gridTemplateColumns: `repeat(${Math.max(slots.length, 1)}, var(--booking-seat-size))` }}
              >
                {slots.map((seat, i) =>
                  seat ? (
                    <SeatBtn
                      key={seat}
                      seat={seat}
                      seatTone={tone}
                      isBooked={bookedSeats.includes(seat)}
                      isSelected={selectedSeats.includes(seat)}
                      onToggle={onToggleSeat}
                    />
                  ) : (
                    <span key={`${group.rowKey}-empty-${blockClass}-${i}`} className="booking-page__seat-placeholder" aria-hidden="true" />
                  )
                )}
              </div>
            );

            return (
              <div key={group.rowKey} className="booking-page__seat-row">
                <span className="booking-page__seat-label">{group.rowKey}</span>
                <div className="booking-page__seat-cluster">
                  {renderSeatSlots(leftSlots, "booking-page__seat-block--left")}
                  {renderSeatSlots(centerSlots, "booking-page__seat-block--center")}
                  {renderSeatSlots(rightSlots, "booking-page__seat-block--right")}
                </div>
                <span className="booking-page__seat-label booking-page__seat-label--right">{group.rowKey}</span>
              </div>
            );
          })
        ) : (
          <p className="booking-page__hint booking-page__hint--center">Suất chiếu này chưa có sơ đồ ghế.</p>
        )}
      </div>
    </section>
  );
}
