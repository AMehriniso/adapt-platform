import { useState } from "react";

const API_BASE = "http://localhost:4000";

export default function ReportModal({ open, onClose, targetType, targetId }) {
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!reason.trim() || reason.trim().length < 3) {
      setError("Опишите причину (минимум 3 символа).");
      return;
    }

    setSending(true);

    try {
      const res = await fetch(`${API_BASE}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          targetType,
          targetId,
          reason: reason.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      alert("Жалоба отправлена. Спасибо!");
      setReason("");
      onClose();
    } catch (e2) {
      setError(String(e2.message || e2));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalCard" onClick={(e) => e.stopPropagation()}>
        <h3 className="cardTitle" style={{ marginTop: 0 }}>
          Отправить жалобу
        </h3>

        <form className="form" onSubmit={submit}>
          <textarea
            className="textarea"
            rows={4}
            placeholder="Например: спам / оскорбления / личные данные / не по теме..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />

          {error && <div className="error">Ошибка: {error}</div>}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button className="button" type="button" onClick={onClose}>
              Отмена
            </button>
            <button className="button" disabled={sending} type="submit">
              {sending ? "Отправка..." : "Отправить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}