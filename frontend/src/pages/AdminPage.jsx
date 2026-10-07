import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, isAdmin, clearToken } from "../auth.js";

const API_BASE = "http://localhost:4000";

export default function AdminPage() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("queue"); // "queue" | "reports"
  const [queue, setQueue] = useState([]);
  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const qRes = await fetch(`${API_BASE}/admin/questions/pending`, { headers });
      const qData = await qRes.json().catch(() => []);
      if (!qRes.ok) throw new Error(qData.error || `HTTP ${qRes.status}`);

      const rRes = await fetch(`${API_BASE}/admin/reports`, { headers });
      const rData = await rRes.json().catch(() => []);
      if (!rRes.ok) throw new Error(rData.error || `HTTP ${rRes.status}`);

      setQueue(Array.isArray(qData) ? qData : []);
      setReports(Array.isArray(rData) ? rData : []);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function setQuestionStatus(id, status) {
    try {
      const token = getToken();

      const res = await fetch(`${API_BASE}/admin/questions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      await loadData();
    } catch (e) {
      alert("Ошибка: " + String(e.message || e));
    }
  }

  function openReportTarget(r) {
    if (r.targetType === "QUESTION") {
      navigate(`/questions/${r.targetId}`);
      return;
    }

    if (r.targetType === "STORY") {
      navigate(`/stories/${r.targetId}`);
      return;
    }

    if (r.targetType === "ANSWER") {
      if (r.questionId) {
        navigate(`/questions/${r.questionId}`);
      } else {
        alert("Не удалось открыть: backend не вернул questionId для ответа.");
      }
      return;
    }

    alert("Неизвестный тип жалобы: " + r.targetType);
  }

  async function resolveReport(reportId, action) {
    try {
      const token = getToken();

      const res = await fetch(`${API_BASE}/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      await loadData();
    } catch (e) {
      alert("Ошибка: " + String(e.message || e));
    }
  }

  function reportTargetLabel(t) {
    if (t === "QUESTION") return "вопрос";
    if (t === "ANSWER") return "ответ";
    if (t === "STORY") return "историю";
    return t;
  }

  useEffect(() => {
    if (!isAdmin()) {
      setError("Доступ запрещён. Войдите как администратор.");
      setLoading(false);
      return;
    }

    loadData();
  }, []);

  return (
    <div className="page">
      <header className="header adminHero">
        <div className="heroBadge">🛠️ Администрирование</div>
        <h1 className="title">Панель администратора</h1>


        <div className="chips">
          <span className="chip">📋 очередь вопросов</span>
          <span className="chip">🚩 жалобы</span>
          <span className="chip">🛡️ модерация</span>
        </div>
      </header>

      <div className="pageActions">
        <button className="button buttonSoft" onClick={() => navigate("/")}>
          ← На главную
        </button>

        <button
          className="button buttonSoft"
          onClick={() => {
            clearToken();
            navigate("/", { replace: true });
          }}
        >
          Выйти
        </button>
      </div>

      <section className="card adminToolbar">
        <div className="adminToolbarInner">
          <button
            className={`button ${tab === "queue" ? "adminTabActive" : "buttonSoft"}`}
            onClick={() => setTab("queue")}
            type="button"
          >
            Очередь вопросов
          </button>

          <button
            className={`button ${tab === "reports" ? "adminTabActive" : "buttonSoft"}`}
            onClick={() => setTab("reports")}
            type="button"
          >
            Жалобы
          </button>

          <button className="button buttonSoft" onClick={loadData} type="button">
            Обновить
          </button>
        </div>
      </section>

      {loading && <div className="muted">Загрузка...</div>}
      {error && !loading && <div className="error">{error}</div>}

      {!loading && !error && tab === "queue" && (
        <section className="listSection">
          <div className="adminSectionHead">
            <div>
              <h2 className="sectionTitle" style={{ marginBottom: 6 }}>
                Очередь вопросов
              </h2>
              <p className="muted" style={{ margin: 0 }}>
                Вопросы со статусом PENDING, ожидающие решения администратора.
              </p>
            </div>

            <div className="storiesCount">
              В очереди: <strong>{queue.length}</strong>
            </div>
          </div>

          {queue.length === 0 ? (
            <section className="card emptyStories">
              <h3 className="cardTitle">Очередь пустая</h3>
              <p className="muted" style={{ marginBottom: 0 }}>
                Сейчас нет вопросов, ожидающих проверки.
              </p>
            </section>
          ) : (
            <div className="adminGrid">
              {queue.map((q, index) => (
                <article
                  key={q.id}
                  className={`card adminCard adminTone${(index % 3) + 1}`}
                >
                  <div className="adminCardDecor">
                    <div className="adminCardGlow" />
                    <div className="adminCardLine" />
                  </div>

                  <div className="adminCardContent">
                    <div className="adminCardTop">
                      <div className="adminMetaLeft">
                        <span className="adminType">Вопрос</span>
                        <span className="adminMetaBadge">
                          Анонимно: {q.isAnonymous ? "да" : "нет"}
                        </span>
                        <span className="adminMetaBadge">Статус: {q.status}</span>
                      </div>

                      <span className="date">
                        {new Date(q.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="adminCardTitle">{q.title}</h3>

                    <div className="adminCardBody">{q.body}</div>

                    <div className="adminActions">
                      <button
                        className="button adminApproveButton"
                        onClick={() => setQuestionStatus(q.id, "APPROVED")}
                        type="button"
                      >
                        Одобрить
                      </button>

                      <button
                        className="button adminRejectButton"
                        onClick={() => setQuestionStatus(q.id, "REJECTED")}
                        type="button"
                      >
                        Отклонить
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {!loading && !error && tab === "reports" && (
        <section className="listSection">
          <div className="adminSectionHead">
            <div>
              <h2 className="sectionTitle" style={{ marginBottom: 6 }}>
                Жалобы
              </h2>
              <p className="muted" style={{ margin: 0 }}>
                Жалобы со статусом PENDING, ожидающие обработки.
              </p>
            </div>

            <div className="storiesCount">
              Жалоб: <strong>{reports.length}</strong>
            </div>
          </div>

          {reports.length === 0 ? (
            <section className="card emptyStories">
              <h3 className="cardTitle">Жалоб нет</h3>
              <p className="muted" style={{ marginBottom: 0 }}>
                На данный момент нет жалоб, требующих проверки.
              </p>
            </section>
          ) : (
            <div className="adminGrid">
              {reports.map((r, index) => (
                <article
                  key={r.id}
                  className={`card adminCard adminTone${(index % 3) + 1}`}
                >
                  <div className="adminCardDecor">
                    <div className="adminCardGlow" />
                    <div className="adminCardLine" />
                  </div>

                  <div className="adminCardContent">
                    <div className="adminCardTop">
                      <div className="adminMetaLeft">
                        <span className="adminType">
                          Жалоба на {reportTargetLabel(r.targetType)}
                        </span>
                        <span className="adminMetaBadge">PENDING</span>
                      </div>

                      <span className="date">
                        {new Date(r.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="adminCardTitle">Причина: {r.reason}</h3>

                    <div className="adminPreviewBlock">
                      <div className="adminPreviewLabel">Контент</div>
                      <div className="adminPreviewTitle">
                        {r.targetTitle || "(не найдено)"}
                      </div>
                      {r.targetPreview ? (
                        <div className="adminCardBody">{r.targetPreview}</div>
                      ) : null}
                    </div>

                    <div className="adminMetaRow">
                      <span className="adminMetaBadge">targetId: {r.targetId}</span>
                    </div>

                    <div className="adminActions">
                      <button
                        className="button buttonSoft"
                        type="button"
                        onClick={() => openReportTarget(r)}
                      >
                        Открыть
                      </button>

                      <button
                        className="button adminHideButton"
                        type="button"
                        onClick={() => resolveReport(r.id, "HIDE")}
                      >
                        Скрыть контент
                      </button>

                      <button
                        className="button adminDismissButton"
                        type="button"
                        onClick={() => resolveReport(r.id, "DISMISS")}
                      >
                        Отклонить жалобу
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}