import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, isLoggedIn, isMentor } from "../auth.js";

const API_BASE = "http://localhost:4000";

export default function StoriesPage() {
  const navigate = useNavigate();

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // форма (только для MENTOR)
  const [newTitle, setNewTitle] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [newBody, setNewBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");

  async function loadStories() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/stories`);
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      setStories(data);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function createStory(e) {
    e.preventDefault();
    setPostError("");

    if (newTitle.trim().length < 5) {
      setPostError("Заголовок должен быть минимум 5 символов");
      return;
    }
    if (newBody.trim().length < 50) {
      setPostError("Текст истории должен быть минимум 50 символов");
      return;
    }

    setPosting(true);

    try {
      const res = await fetch(`${API_BASE}/stories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          topic: newTopic.trim() ? newTopic.trim() : null,
          body: newBody.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      setNewTitle("");
      setNewTopic("");
      setNewBody("");

      alert("История опубликована!");
      await loadStories();
    } catch (e) {
      setPostError(String(e.message || e));
    } finally {
      setPosting(false);
    }
  }

  useEffect(() => {
    loadStories();
  }, []);

  return (
    <div className="page">
      <header className="header storiesHero">
        <div className="heroBadge">📚 Раздел историй</div>
        <h1 className="title">Истории адаптации</h1>
        <p className="subtitle">
          Подборка готовых историй о первых неделях в университете: знакомства, тревожность,
          учёба, общение и маленькие шаги, которые реально помогают.
        </p>

        <div className="chips">
          <span className="chip">🫶 живой опыт</span>
          <span className="chip">🌿 поддержка</span>
          <span className="chip">✨ полезные советы</span>
        </div>
      </header>

      <div className="pageActions">
        <button className="button buttonSoft" onClick={() => navigate("/")}>
          ← На главную
        </button>
      </div>

      {isLoggedIn() && isMentor() && (
        <section className="card storyComposer" style={{ marginBottom: 18 }}>
          <div className="storyComposerHead">
            <div className="miniLabel">Для адаптера</div>
            <h2 className="cardTitle" style={{ marginBottom: 6 }}>
              Опубликовать историю
            </h2>
            <p className="muted" style={{ margin: 0 }}>
              Поделись личным опытом, который может поддержать первокурсника.
            </p>
          </div>

          <form className="form" onSubmit={createStory}>
            <input
              className="input"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Заголовок истории"
              required
            />

            <input
              className="input"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Тема (необязательно)"
            />

            <textarea
              className="textarea"
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Текст истории (минимум 50 символов)"
              rows={6}
              required
            />

            {postError && <div className="error">Ошибка: {postError}</div>}

            <div className="row" style={{ justifyContent: "flex-end" }}>
              <button className="button" disabled={posting} type="submit">
                {posting ? "Публикация..." : "Опубликовать"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="listSection">
        <div className="storiesSectionHead">
          <div>
            <h2 className="sectionTitle" style={{ marginBottom: 6 }}>
              Подборка историй
            </h2>
            <p className="muted" style={{ margin: 0 }}>
              Открой историю, которая ближе всего к твоей ситуации.
            </p>
          </div>

          {!loading && !error && (
            <div className="storiesCount">
              Историй: <strong>{stories.length}</strong>
            </div>
          )}
        </div>

        {loading && <div className="muted">Загрузка...</div>}
        {error && <div className="error">Ошибка: {error}</div>}

        {!loading && !error && stories.length === 0 && (
          <section className="card emptyStories">
            <h3 className="cardTitle">Пока историй нет</h3>
            <p className="muted" style={{ marginBottom: 0 }}>
              Когда адаптеры опубликуют первые истории, они появятся здесь.
            </p>
          </section>
        )}

        <div className="storiesGrid">
          {!loading &&
            !error &&
            stories.map((s, index) => (
              <article
  key={s.id}
  className={`card storyCard storyTone${(index % 3) + 1}`}
  style={{ cursor: "pointer" }}
  onClick={() => navigate(`/stories/${s.id}`)}
  title="Открыть историю"
>
  <div className="storyDecor">
    <div className="storyDecorGlow" />
    <div className="storyDecorLine" />
  </div>

  <div className="storyContent">
    <div className="storyCardTop">
      <div className="storyMetaLeft">
        <span className="storyType">История</span>
        <span className="storyTopicInline">{s.topic || "адаптация"}</span>
      </div>

      <span className="date">{new Date(s.createdAt).toLocaleDateString()}</span>
    </div>

    <h3 className="storyCardTitle">{s.title}</h3>

    <div className="storyPreview">
      {s.preview || (s.body ? s.body.slice(0, 180) + "..." : "")}
    </div>

    <div className="storyCardFooter">
      <span className="storyReadTime">
        {Math.max(1, Math.ceil((s.body || "").split(/\s+/).filter(Boolean).length / 180))} мин чтения
      </span>
      <span className="storyLink">Читать историю →</span>
    </div>
  </div>
</article>
            ))}
        </div>
      </section>
    </div>
  );
}