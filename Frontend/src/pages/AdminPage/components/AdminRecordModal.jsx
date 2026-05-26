import { useState } from "react";
import {
  feedbackCategoryOptions,
  feedbackPriorityOptions,
  feedbackStatusOptions,
  formatAdminDateTime,
  formatDetailValue,
  movieSuggestions,
  normalizeFeedbackRating,
} from "../utils/adminPageUtils";

export default function AdminRecordModal({
  activeModule,
  appendMultiValue,
  closeCrudMode,
  editingId,
  feedbackDraft,
  form,
  formError,
  handlePosterFileChange,
  handleSaveDraft,
  handleSaveFeedbackWork,
  handleSubmit,
  handleSyncTmdbMetadata,
  isCrudMode,
  isPosterUploading,
  isTmdbSyncing,
  selectedDetail,
  setFeedbackDraft,
  setForm,
  setSelectedDetail,
}) {
  const [castDraft, setCastDraft] = useState({ name: "", role: "" });
  const [galleryDraft, setGalleryDraft] = useState("");
  const [trailerFactDraft, setTrailerFactDraft] = useState({ label: "", value: "" });
  const [showtimeDraft, setShowtimeDraft] = useState("");
  const castItems = String(form.cast || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, ...roleParts] = line.split(":");
      return {
        name: name.trim(),
        role: roleParts.join(":").trim(),
        raw: line,
      };
    });
  const setCastItems = (items) => setForm({ ...form, cast: items.map((item) => item.role ? `${item.name}: ${item.role}` : item.name).join("\n") });
  const galleryItems = String(form.gallery || "")
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const trailerFactItems = String(form.trailerFacts || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...valueParts] = line.split(":");
      return { label: label.trim(), value: valueParts.join(":").trim(), raw: line };
    });
  const showtimeItems = String(form.showtimes || "")
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const setListField = (field, items, separator = ", ") => setForm({ ...form, [field]: items.join(separator) });
  const setKeyValueField = (field, items) => setForm({ ...form, [field]: items.map((item) => item.value ? `${item.label}: ${item.value}` : item.label).join("\n") });
  const handleAddCast = () => {
    const name = castDraft.name.trim();
    const role = castDraft.role.trim();

    if (!name && !role) {
      return;
    }

    setCastItems([...castItems, { name: name || role, role }]);
    setCastDraft({ name: "", role: "" });
  };
  const handleRemoveCast = (index) => setCastItems(castItems.filter((_, itemIndex) => itemIndex !== index));
  const handleAddGallery = (value = galleryDraft) => {
    const nextValue = String(value || "").trim();

    if (!nextValue) {
      return;
    }

    setListField("gallery", [...galleryItems, nextValue]);
    setGalleryDraft("");
  };
  const handleRemoveGallery = (index) => setListField("gallery", galleryItems.filter((_, itemIndex) => itemIndex !== index));
  const handleAddTrailerFact = () => {
    const label = trailerFactDraft.label.trim();
    const value = trailerFactDraft.value.trim();

    if (!label && !value) {
      return;
    }

    setKeyValueField("trailerFacts", [...trailerFactItems, { label: label || value, value }]);
    setTrailerFactDraft({ label: "", value: "" });
  };
  const handleRemoveTrailerFact = (index) => setKeyValueField("trailerFacts", trailerFactItems.filter((_, itemIndex) => itemIndex !== index));
  const handleAddShowtime = (value = showtimeDraft) => {
    const nextValue = String(value || "").trim();

    if (!nextValue) {
      return;
    }

    setListField("showtimes", [...showtimeItems, nextValue]);
    setShowtimeDraft("");
  };
  const handleRemoveShowtime = (index) => setListField("showtimes", showtimeItems.filter((_, itemIndex) => itemIndex !== index));

  if (!isCrudMode && !selectedDetail) {
    return null;
  }

  return (
            <div className="admin-side-panels-backdrop" onClick={() => { closeCrudMode(); setSelectedDetail(null); }}>
              <aside className="admin-side-panels admin-side-panels--popup" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="admin-popup-close" onClick={() => { closeCrudMode(); setSelectedDetail(null); }}>✕</button>
                {isCrudMode && activeModule !== "trash" && activeModule !== "activity" && activeModule !== "feedback" ? (
                <form className="admin-panel admin-form" onSubmit={handleSubmit}>
                <div className="admin-form-head">
                  <div>
                    <span>{editingId ? "Chỉnh sửa" : "Tạo mới"}</span>
                    <h2>{editingId ? "Sửa bản ghi" : "Thêm bản ghi"}</h2>
                  </div>
                  {isCrudMode ? (
                    <button type="button" className="admin-form-back" onClick={closeCrudMode}>
                      Back danh sách
                    </button>
                  ) : null}
                </div>
                {formError ? <p className="admin-form-error">{formError}</p> : null}
                <div className="admin-form-scroll">
                {activeModule === "movies" ? (
                  <>
                    <datalist id="genre-suggestions">{movieSuggestions.genres.map((item) => <option key={item} value={item} />)}</datalist>
                    <datalist id="country-suggestions">{movieSuggestions.country.map((item) => <option key={item} value={item} />)}</datalist>
                    <datalist id="showtime-suggestions">{movieSuggestions.showtimes.map((item) => <option key={item} value={item} />)}</datalist>
                    <input className="admin-field--tiny" value={form.id} onChange={(event) => setForm({ ...form, id: event.target.value })} placeholder="Movie ID tự tạo nếu trống" disabled={Boolean(editingId)} />
                    <input className="admin-field--medium" required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Tên phim" />
                    <button className="admin-field--small admin-tmdb-btn" type="button" onClick={handleSyncTmdbMetadata} disabled={isTmdbSyncing}>
                      {isTmdbSyncing ? "Đang đồng bộ..." : "Đồng bộ TMDB"}
                    </button>
                    <div className="admin-poster-picker admin-field--wide">
                      <label>
                        <span>Chọn ảnh poster từ máy</span>
                        <span className="admin-file-control">
                          <span>{isPosterUploading ? "Đang lưu..." : "Chọn file"}</span>
                          <input type="file" accept="image/*" onChange={handlePosterFileChange} disabled={isPosterUploading} />
                        </span>
                      </label>
                      {form.poster ? (
                        <div className="admin-poster-preview">
                          <img src={form.poster} alt="Poster preview" />
                          <button type="button" onClick={() => setForm({ ...form, poster: "" })}>
                            Xóa ảnh
                          </button>
                          <small>{form.poster}</small>
                        </div>
                      ) : (
                        <small>{isPosterUploading ? "Đang lưu ảnh vào database..." : "Chưa chọn poster. Ảnh sẽ được lưu vào MongoDB."}</small>
                      )}
                    </div>
                    <input className="admin-field--medium" required value={form.trailer} onChange={(event) => setForm({ ...form, trailer: event.target.value })} placeholder="Link trailer YouTube" />
                    <textarea className="admin-field--large" required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Mô tả phim" rows="4" />
                    <div className="admin-multi-field admin-field--wide">
                      <input required list="genre-suggestions" value={form.genres} onChange={(event) => setForm({ ...form, genres: event.target.value })} placeholder="Thể loại, cách nhau bằng dấu phẩy hoặc xuống dòng" />
                      <div>
                        {movieSuggestions.genres.slice(0, 5).map((item) => (
                          <button key={item} type="button" onClick={() => appendMultiValue("genres", item)}>{item}</button>
                        ))}
                      </div>
                    </div>
                    <div className="admin-form-grid">
                      <input required list="country-suggestions" value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} placeholder="Quốc gia" />
                      <input required value={form.director} onChange={(event) => setForm({ ...form, director: event.target.value })} placeholder="Đạo diễn" />
                    </div>
                    <div className="admin-form-grid">
                      <input required min="1" type="number" value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} placeholder="Thời lượng phút" />
                      <input required value={form.releaseDate} onChange={(event) => setForm({ ...form, releaseDate: event.target.value })} placeholder="Ngày khởi chiếu" />
                    </div>
                    <div className="admin-form-grid">
                      <select value={form.rating} onChange={(event) => setForm({ ...form, rating: event.target.value })}>
                        <option value="P">P</option>
                        <option value="K">K</option>
                        <option value="T13">T13</option>
                        <option value="T16">T16</option>
                        <option value="T18">T18</option>
                        <option value="C18">C18</option>
                      </select>
                      <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                        <option value="now-showing">Đang chiếu</option>
                        <option value="coming-soon">Sắp chiếu</option>
                      </select>
                    </div>
                    <section className="admin-cast-editor admin-field--wide">
                      <div className="admin-cast-editor__head">
                        <span>Cast</span>
                        <small>{castItems.length} people</small>
                      </div>
                      <div className="admin-cast-editor__inputs">
                        <input value={castDraft.name} onChange={(event) => setCastDraft({ ...castDraft, name: event.target.value })} placeholder="Actor name" />
                        <input value={castDraft.role} onChange={(event) => setCastDraft({ ...castDraft, role: event.target.value })} placeholder="Role" />
                        <button type="button" onClick={handleAddCast}>Add cast</button>
                      </div>
                      <div className="admin-cast-editor__list">
                        {castItems.length > 0 ? castItems.map((item, index) => (
                          <span key={`${item.raw}-${index}`} className="admin-cast-card">
                            <strong>{item.name}</strong>
                            {item.role ? <em>{item.role}</em> : null}
                            <button type="button" onClick={() => handleRemoveCast(index)} aria-label={`Remove ${item.name}`}>Remove</button>
                          </span>
                        )) : <small>No cast yet. Add an actor and role.</small>}
                      </div>
                      <textarea value={form.cast} onChange={(event) => setForm({ ...form, cast: event.target.value })} aria-label="Cast data" rows="3" />
                    </section>
                    <section className="admin-list-editor admin-gallery-editor admin-field--wide">
                      <div className="admin-list-editor__head">
                        <span>Gallery</span>
                        <small>{galleryItems.length} images</small>
                      </div>
                      <div className="admin-list-editor__inputs">
                        <input value={galleryDraft} onChange={(event) => setGalleryDraft(event.target.value)} placeholder="Gallery image URL" />
                        <button type="button" onClick={() => handleAddGallery()}>Add image</button>
                        <button type="button" onClick={() => handleAddGallery(form.poster)} disabled={!form.poster}>Add poster</button>
                      </div>
                      <div className="admin-list-editor__grid">
                        {galleryItems.length > 0 ? galleryItems.map((item, index) => (
                          <span key={`${item}-${index}`} className="admin-list-card admin-gallery-card">
                            <strong>{item.split('/').pop() || item}</strong>
                            <small>{item}</small>
                            <button type="button" onClick={() => handleRemoveGallery(index)} aria-label={`Remove image ${index + 1}`}>Remove</button>
                          </span>
                        )) : <small>No gallery images yet.</small>}
                      </div>
                    </section>
                    <section className="admin-list-editor admin-facts-editor admin-field--wide">
                      <div className="admin-list-editor__head">
                        <span>Trailer facts</span>
                        <small>{trailerFactItems.length} rows</small>
                      </div>
                      <div className="admin-list-editor__inputs admin-list-editor__inputs--facts">
                        <input value={trailerFactDraft.label} onChange={(event) => setTrailerFactDraft({ ...trailerFactDraft, label: event.target.value })} placeholder="Label" />
                        <input value={trailerFactDraft.value} onChange={(event) => setTrailerFactDraft({ ...trailerFactDraft, value: event.target.value })} placeholder="Value" />
                        <button type="button" onClick={handleAddTrailerFact}>Add fact</button>
                      </div>
                      <div className="admin-list-editor__grid">
                        {trailerFactItems.length > 0 ? trailerFactItems.map((item, index) => (
                          <span key={`${item.raw}-${index}`} className="admin-list-card admin-fact-card">
                            <strong>{item.label}</strong>
                            {item.value ? <small>{item.value}</small> : null}
                            <button type="button" onClick={() => handleRemoveTrailerFact(index)} aria-label={`Remove ${item.label}`}>Remove</button>
                          </span>
                        )) : <small>No trailer facts yet.</small>}
                      </div>
                    </section>
                    <input className="admin-field--small" value={form.trailerPanelLabel} onChange={(event) => setForm({ ...form, trailerPanelLabel: event.target.value })} placeholder="Nhãn panel trailer" />
                    <input className="admin-field--medium" value={form.trailerPanelTitle} onChange={(event) => setForm({ ...form, trailerPanelTitle: event.target.value })} placeholder="Tiêu đề panel trailer" />
                    <textarea className="admin-field--large" value={form.trailerPanelDescription} onChange={(event) => setForm({ ...form, trailerPanelDescription: event.target.value })} placeholder="Mô tả panel trailer" rows="3" />
                    <section className="admin-list-editor admin-showtime-editor admin-field--wide">
                      <div className="admin-list-editor__head">
                        <span>Quick showtimes</span>
                        <small>{showtimeItems.length} times</small>
                      </div>
                      <div className="admin-list-editor__inputs">
                        <input list="showtime-suggestions" value={showtimeDraft} onChange={(event) => setShowtimeDraft(event.target.value)} placeholder="Showtime, e.g. 20:45" />
                        <button type="button" onClick={() => handleAddShowtime()}>Add time</button>
                      </div>
                      <div className="admin-list-editor__quick">
                        {movieSuggestions.showtimes.slice(0, 4).map((item) => (
                          <button key={item} type="button" onClick={() => handleAddShowtime(item)}>{item}</button>
                        ))}
                      </div>
                      <div className="admin-list-editor__chips">
                        {showtimeItems.length > 0 ? showtimeItems.map((item, index) => (
                          <span key={`${item}-${index}`} className="admin-time-chip">
                            {item}
                            <button type="button" onClick={() => handleRemoveShowtime(index)} aria-label={`Remove showtime ${item}`}>x</button>
                          </span>
                        )) : <small>No quick showtimes yet.</small>}
                      </div>
                    </section>
                    <div className="admin-form-grid">
                      <input type="number" value={form.catalogOrder} onChange={(event) => setForm({ ...form, catalogOrder: event.target.value })} placeholder="Thứ tự catalog" />
                      <input type="number" value={form.heroOrder} onChange={(event) => setForm({ ...form, heroOrder: event.target.value })} placeholder="Thứ tự hero" />
                    </div>
                  </>
                ) : (
                  <>
                    <input value={form.id} onChange={(event) => setForm({ ...form, id: event.target.value })} placeholder="Tự tạo ID nếu để trống" />
                    <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Tên" />
                    <input value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} placeholder="Trạng thái" />
                    <input value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} placeholder="Thời gian" />
                    <input value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} placeholder="Giá trị / ghi chú" />
                  </>
                )}
                </div>
                <div className="admin-form-actions">
                  <button type="button" className="admin-draft-btn" onClick={handleSaveDraft}>
                    Lưu nháp
                  </button>
                  <button type="submit">{editingId ? "Xác nhận lưu" : "Xác nhận thêm"}</button>
                </div>
              </form>
              ) : !isCrudMode && selectedDetail ? (
                  <article className="admin-panel admin-detail-panel">
                    {activeModule === "feedback" ? (
                      <div className="admin-feedback-detail">
                        <div className="admin-feedback-head">
                          <div>
                            <span>{selectedDetail.id}</span>
                            <h2>{selectedDetail.headline || "Góp ý khách hàng"}</h2>
                          </div>
                          <strong className={`admin-status admin-status--${selectedDetail.statusTone}`}>{selectedDetail.status}</strong>
                        </div>
                        <div className="admin-feedback-meta">
                          <strong>{selectedDetail.fullName}</strong>
                          <span>{selectedDetail.email}</span>
                          <span>{normalizeFeedbackRating(selectedDetail.rating)}/5 sao • {selectedDetail.time}</span>
                        </div>
                        <p className="admin-feedback-message">{selectedDetail.message}</p>
                        <div className="admin-form-grid">
                          <select value={feedbackDraft.status} onChange={(event) => setFeedbackDraft({ ...feedbackDraft, status: event.target.value })}>
                            {feedbackStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                          <select value={feedbackDraft.category} onChange={(event) => setFeedbackDraft({ ...feedbackDraft, category: event.target.value })}>
                            {feedbackCategoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                          <select value={feedbackDraft.priority} onChange={(event) => setFeedbackDraft({ ...feedbackDraft, priority: event.target.value })}>
                            {feedbackPriorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                        </div>
                        <textarea
                          value={feedbackDraft.adminNote}
                          onChange={(event) => setFeedbackDraft({ ...feedbackDraft, adminNote: event.target.value })}
                          placeholder="Admin note nội bộ"
                          aria-label="Admin note nội bộ"
                          rows="3"
                          className="admin-feedback-note"
                        />
                        <textarea
                          value={feedbackDraft.response}
                          onChange={(event) => setFeedbackDraft({ ...feedbackDraft, response: event.target.value })}
                          placeholder="Phản hồi cho khách"
                          aria-label="Phản hồi cho khách"
                          rows="4"
                          className="admin-feedback-response"
                          disabled={Boolean(selectedDetail.response)}
                        />
                        <div className="admin-form-actions">
                          <button type="button" onClick={() => handleSaveFeedbackWork("save")}>Lưu note/trạng thái</button>
                          <button type="button" onClick={() => handleSaveFeedbackWork("respond")} disabled={Boolean(selectedDetail.response)}>
                            {selectedDetail.response ? "Đã gửi phản hồi" : "Gửi phản hồi"}
                          </button>
                        </div>
                        <dl>
                          <div><dt>Category</dt><dd>{selectedDetail.categoryLabel}</dd></div>
                          <div><dt>Priority</dt><dd>{selectedDetail.priorityLabel}</dd></div>
                          <div className="admin-feedback-response-box"><dt>Phản hồi cho khách</dt><dd>{selectedDetail.response || "Chưa phản hồi"}</dd></div>
                          <div className="admin-feedback-note-box"><dt>Admin note</dt><dd>{(selectedDetail.adminNotes || []).map((item) => `${item.adminName || "Admin"}: ${item.note}`).join(" | ") || "Chưa có"}</dd></div>
                          <div><dt>Lịch sử</dt><dd>{(selectedDetail.history || []).map((item) => `${formatAdminDateTime(item.createdAt)}: ${item.action} ${item.to || ""}`).join(" | ") || "Chưa có"}</dd></div>
                        </dl>
                      </div>
                    ) : (
                      <>
                        <h2>Chi tiết bản ghi</h2>
                        <dl>
                          {Object.entries(selectedDetail).map(([key, value]) => (
                            <div key={key}>
                              <dt>{key}</dt>
                              <dd>{formatDetailValue(value)}</dd>
                            </div>
                          ))}
                        </dl>
                      </>
                    )}
                  </article>
                ) : null}
              </aside>
            </div>
  );
}
