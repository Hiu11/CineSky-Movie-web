export default function AdminConfirmDialog({ dialog, onClose }) {
  if (!dialog) {
    return null;
  }

  return (
    <div className="admin-confirm-backdrop" role="presentation" onClick={() => onClose(false)}>
      <section className="admin-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title" onClick={(event) => event.stopPropagation()}>
        <h2 id="admin-confirm-title">{dialog.title}</h2>
        <p>{dialog.message}</p>
        <div className="admin-confirm-actions">
          <button type="button" onClick={() => onClose(false)}>Há»§y</button>
          <button type="button" onClick={() => onClose(true)}>{dialog.confirmText}</button>
        </div>
      </section>
    </div>
  );
}
