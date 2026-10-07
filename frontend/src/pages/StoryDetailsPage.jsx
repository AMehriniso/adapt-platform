import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = "http://localhost:4000";

export default function StoryDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Жалоба (модалка)
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null); // { type, id }
  const [reportReason, setReportReason] = useState("");
  const [reportSending, setReportSending] = useState(false);
  const [reportError, setReportError] = useState("");

  async function loadStory() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/stories/${id}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      setStory(data);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStory();
  }, [id]);

  function openReport(type, targetId) {
    setReportError("");
    setReportReason("");
    setReportTarget({ type, id: targetId });
    setReportOpen(true);
  }

  async function submitReport(e) {
    e.preventDefault();
    setReportError("");

    if (!reportReason.trim() || reportReason.trim().length < 3) {
      setReportError("Опишите причину (минимум 3 символа).");
      return;
    }

    setReportSending(true);

    try {
      const res = await fetch(`${API_BASE}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          targetType: reportTarget.type,
          targetId: reportTarget.id,
          reason: reportReason.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      setReportOpen(false);
      alert("Жалоба отправлена. Спасибо!");
    } catch (e2) {
      setReportError(String(e2.message || e2));
    } finally {
      setReportSending(false);
    }
  }

  return (
    <div className="page">
      <header className="header storyPageHero">
        <div className="heroBadge">📖 Чтение истории</div>
        <h1 className="title">История</h1>
        <p className="subtitle">Личный опыт адаптации, который может помочь в похожей ситуации.</p>
      </header>

      <div className="pageActions">
        <button className="button buttonSoft" onClick={() => navigate("/stories")}>
          ← К историям
        </button>
        <button className="button buttonSoft" onClick={() => navigate("/")}>
          На главную
        </button>
      </div>

      {loading && <div className="muted">Загрузка...</div>}
      {error && <div className="error">Ошибка: {error}</div>}

      {!loading && !error && story && (
        <section className="card storyDetailsCard">
          <div className="storyDetailsHero">
            <div className="storyDetailsMetaTop">
              <span className="storyType">История адаптации</span>
              <span className="date">{new Date(story.createdAt).toLocaleString()}</span>
            </div>

            <h2 className="storyDetailsTitle">{story.title}</h2>

            <div className="storyDetailsTags">
              <span className="storyTopic">Тема: {story.topic || "адаптация"}</span>
            </div>
          </div>

          <div className="storyDetailsBody">{story.body}</div>

          <div className="storyDetailsActions">
            <button
              className="button"
              type="button"
              onClick={() => openReport("STORY", story.id)}
            >
              Пожаловаться
            </button>
          </div>
        </section>
      )}

      {reportOpen && (
        <div className="modalOverlay" onClick={() => setReportOpen(false)}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()}>
            <h3 className="cardTitle" style={{ marginTop: 0 }}>
              Отправить жалобу
            </h3>

            <form className="form" onSubmit={submitReport}>
              <textarea
                className="textarea"
                rows={4}
                placeholder="Например: спам / оскорбления / личные данные / не по теме..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                required
              />

              {reportError && <div className="error">Ошибка: {reportError}</div>}

              <div className="row" style={{ justifyContent: "flex-end" }}>
                <button
                  className="button buttonSoft"
                  type="button"
                  onClick={() => setReportOpen(false)}
                >
                  Отмена
                </button>

                <button className="button" disabled={reportSending} type="submit">
                  {reportSending ? "Отправка..." : "Отправить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}