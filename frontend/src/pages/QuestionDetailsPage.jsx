import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getToken, isLoggedIn, isMentor } from "../auth.js";

const API_BASE = "http://localhost:4000";

export default function QuestionDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [answerText, setAnswerText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportSending, setReportSending] = useState(false);
  const [reportError, setReportError] = useState("");

  const canAnswer = isLoggedIn() && isMentor();

  async function loadQuestion() {
    try {
      setLoading(true);
      setError("");

      const headers = {};
      if (isLoggedIn()) headers.Authorization = `Bearer ${getToken()}`;

      const res = await fetch(`${API_BASE}/questions/${id}`, { headers });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      setQuestion(data);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuestion();
  }, [id]);

  async function sendAnswer(e) {
    e.preventDefault();
    setSendError("");

    if (!answerText.trim()) {
      setSendError("Ответ не может быть пустым");
      return;
    }

    setSending(true);

    try {
      const token = getToken();

      const res = await fetch(`${API_BASE}/questions/${id}/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body: answerText.trim() }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      setAnswerText("");
      await loadQuestion();
    } catch (e) {
      setSendError(String(e.message || e));
    } finally {
      setSending(false);
    }
  }

  function openReport(type, targetId) {
    setReportError("");
    setReportReason("");
    setReportTarget({ type, id: targetId });
    setReportOpen(true);
  }

  async function submitReport(e) {
    e.preventDefault();
    setReportError("");

    if (!reportTarget) {
      setReportError("Не выбран объект жалобы.");
      return;
    }

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
      setReportReason("");
      setReportTarget(null);
      alert("Жалоба отправлена. Спасибо!");
    } catch (e2) {
      setReportError(String(e2.message || e2));
    } finally {
      setReportSending(false);
    }
  }

  return (
    <div className="page">
      <header className="header questionPageHero">
        <div className="heroBadge">💬 Просмотр вопроса</div>
        <h1 className="title">Вопрос</h1>
        <p className="subtitle">Здесь можно прочитать вопрос и ответы адаптеров.</p>
      </header>

      <div className="pageActions">
        <button className="button buttonSoft" onClick={() => navigate("/questions")}>
          ← Назад к списку
        </button>
      </div>

      {loading && <div className="muted">Загрузка...</div>}

      {error && (
        <div className="error">
          Ошибка: {error}
          <div className="muted" style={{ marginTop: 8 }}>
            Проверь, что backend запущен и вопрос существует.
          </div>
        </div>
      )}

      {!loading && !error && question && (
        <>
          <section className="card questionDetailsCard">
            <div className="questionDetailsHero">
              <div className="questionDetailsMetaTop">
                <span className="questionType">Вопрос</span>
                <span className="date">{new Date(question.createdAt).toLocaleString()}</span>
              </div>

              <h2 className="questionDetailsTitle">{question.title}</h2>

              <div className="questionDetailsTags">
                <span className="questionMetaBadge">Статус: {question.status}</span>
                <span className="questionMetaBadge">
                  Ответов: {Array.isArray(question.answers) ? question.answers.length : 0}
                </span>
              </div>
            </div>

            <div className="questionDetailsBody">{question.body}</div>

            <div className="questionDetailsActions">
              <button
                className="button"
                type="button"
                onClick={() => openReport("QUESTION", question.id)}
              >
                Пожаловаться на вопрос
              </button>
            </div>
          </section>

          {!canAnswer && (
            <section className="answerNotice">
              <div className="muted">
                Ответы могут писать только адаптеры.
              </div>

              {!isLoggedIn() && (
                <button className="button" type="button" onClick={() => navigate("/login")}>
                  Войти как адаптер
                </button>
              )}
            </section>
          )}

          {canAnswer && (
            <section className="card answerComposer" style={{ marginTop: 14 }}>
              <div className="miniLabel">Для адаптера</div>
              <h2 className="cardTitle" style={{ marginBottom: 6 }}>
                Ответить
              </h2>
              <p className="muted" style={{ margin: 0 }}>
                Напишите спокойный и поддерживающий ответ по существу.
              </p>

              <form className="form" onSubmit={sendAnswer}>
                <textarea
                  className="textarea"
                  placeholder="Напишите поддерживающий ответ."
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  rows={5}
                  required
                />

                {sendError && <div className="error">Ошибка: {sendError}</div>}

                <div className="row" style={{ justifyContent: "flex-end" }}>
                  <button className="button" disabled={sending} type="submit">
                    {sending ? "Отправка..." : "Отправить ответ"}
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="listSection">
            <div className="questionsSectionHead">
              <div>
                <h2 className="sectionTitle" style={{ marginBottom: 6 }}>
                  Ответы адаптеров
                </h2>
                <p className="muted" style={{ margin: 0 }}>
                  Поддерживающие ответы на вопрос.
                </p>
              </div>
            </div>

            {(!question.answers || question.answers.length === 0) && (
              <div className="muted">Пока нет ответов.</div>
            )}

            <div className="answersGrid">
              {(question.answers || []).map((a, index) => (
                <article
                  key={a.id}
                  className={`card answerCard answerTone${(index % 3) + 1}`}
                >
                  <div className="answerDecor">
                    <div className="answerDecorGlow" />
                    <div className="answerDecorLine" />
                  </div>

                  <div className="answerContent">
                    <div className="questionCardTop">
                      <span className="questionType">Ответ</span>
                      <span className="date">{new Date(a.createdAt).toLocaleString()}</span>
                    </div>

                    <div className="questionCardBody">{a.body}</div>

                    <div className="answerFooter">
                      <span className="questionMetaBadge">Статус: {a.status}</span>

                      <button
                        className="button"
                        type="button"
                        onClick={() => openReport("ANSWER", a.id)}
                      >
                        Пожаловаться
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
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