import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../auth.js";

const API_BASE = "http://localhost:4000";

export default function QuestionsPage() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  async function loadQuestions() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/questions`);
      const data = await res.json().catch(() => []);

      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      setQuestions(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuestions();
  }, []);

  async function submitQuestion(e) {
    e.preventDefault();
    setSendError("");

    if (title.trim().length < 3) {
      setSendError("Заголовок должен быть минимум 3 символа");
      return;
    }

    if (body.trim().length < 10) {
      setSendError("Текст вопроса должен быть минимум 10 символов");
      return;
    }

    setSending(true);

    try {
      const res = await fetch(`${API_BASE}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      setTitle("");
      setBody("");
      alert("Вопрос отправлен на модерацию. Он появится после одобрения.");
      await loadQuestions();
    } catch (e) {
      setSendError(String(e.message || e));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="page">
      <header className="header questionsHero">
        <div className="heroBadge">💬 Раздел вопросов</div>
        <h1 className="title">Вопросы и обсуждения</h1>
        <p className="subtitle">
          Здесь можно прочитать одобренные вопросы первокурсников и ответы адаптеров,
          а ниже — анонимно задать свой вопрос.
        </p>

        <div className="chips">
          <span className="chip">🫥 анонимно</span>
          <span className="chip">🛡️ модерация</span>
          <span className="chip">🤝 ответы адаптеров</span>
        </div>
      </header>

      <div className="pageActions">
        <button className="button buttonSoft" type="button" onClick={() => navigate("/")}>
          ← На главную
        </button>
      </div>

      {!isLoggedIn() ? (
        <section className="card questionComposer" id="ask">
          <div className="questionComposerHead">
            <div className="miniLabel">Анонимный вопрос</div>
            <h2 className="cardTitle" style={{ marginBottom: 6 }}>
              Задать вопрос
            </h2>
            <p className="muted" style={{ margin: 0 }}>
              Опиши ситуацию спокойно и по сути — вопрос пройдёт модерацию и появится в списке после одобрения.
            </p>
          </div>

          <form className="form" onSubmit={submitQuestion}>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Заголовок (например: "Мне страшно не найти друзей")'
              maxLength={120}
              required
            />

            <textarea
              className="textarea questionTextarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Опишите ваш вопрос."
              rows={6}
              required
            />

            <div className="questionHint">
              Вопрос отправляется анонимно и будет опубликован после модерации.
            </div>

            {sendError && <div className="error">Ошибка: {sendError}</div>}

            <div className="row" style={{ justifyContent: "flex-end" }}>
              <button className="button" disabled={sending} type="submit">
                {sending ? "Отправка..." : "Отправить вопрос"}
              </button>
            </div>
          </form>
        </section>
      ) : (
        <section className="card questionComposer">
          <div className="questionComposerHead">
            <div className="miniLabel">Для адаптера</div>
            <h2 className="cardTitle" style={{ marginBottom: 6 }}>
              Задать вопрос
            </h2>
            <p className="muted" style={{ margin: 0 }}>
              Вопросы создаются только первокурсниками без входа. Адаптеры читают вопросы и отвечают на них.
            </p>
          </div>
        </section>
      )}

      <section className="listSection">
        <div className="questionsSectionHead">
          <div>
            <h2 className="sectionTitle" style={{ marginBottom: 6 }}>
              Список вопросов
            </h2>
            <p className="muted" style={{ margin: 0 }}>
              Открой вопрос, чтобы прочитать ответы и обсуждение.
            </p>
          </div>

          {!loading && !error && (
            <div className="storiesCount">
              Вопросов: <strong>{questions.length}</strong>
            </div>
          )}
        </div>

        {loading && <div className="muted">Загрузка...</div>}
        {error && <div className="error">Ошибка: {error}</div>}

        {!loading && !error && questions.length === 0 && (
          <section className="card emptyStories">
            <h3 className="cardTitle">Пока нет опубликованных вопросов</h3>
            <p className="muted" style={{ marginBottom: 0 }}>
              Вы можете задать первый вопрос.
            </p>
          </section>
        )}

        <div className="questionsGrid">
          {!loading &&
            !error &&
            questions.map((q, index) => {
              const answersCount = Array.isArray(q.answers) ? q.answers.length : 0;

              return (
                <article
                  key={q.id}
                  className={`card questionCard questionTone${(index % 3) + 1}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/questions/${q.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigate(`/questions/${q.id}`);
                    }
                  }}
                  title="Открыть вопрос"
                >
                  <div className="questionDecor">
                    <div className="questionDecorGlow" />
                    <div className="questionDecorLine" />
                  </div>

                  <div className="questionCardContent">
                    <div className="questionCardTop">
                      <span className="questionType">Вопрос</span>
                      <span className="date">{new Date(q.createdAt).toLocaleString()}</span>
                    </div>

                    <h3 className="questionCardTitle">{q.title}</h3>

                    <div className="questionCardBody">{q.body}</div>

                    <div className="questionCardFooter">
                      <span className="questionAnswersBadge">Ответов: {answersCount}</span>
                      <span className="questionLink">Открыть обсуждение →</span>
                    </div>
                  </div>
                </article>
              );
            })}
        </div>
      </section>
    </div>
  );
}