import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setToken } from "../auth.js";

const API_BASE = "http://localhost:4000";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("mentor@example.com");
  const [password, setPassword] = useState("mentor123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setToken(data.token);
      navigate("/", { replace: true });
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="header loginHero">
        <div className="heroBadge">🔐 Авторизация адаптера</div>
        <h1 className="title">Вход адаптера</h1>
        <p className="subtitle">
          Авторизация нужна, чтобы отвечать на вопросы, публиковать истории и участвовать
          в поддержке первокурсников.
        </p>

        <div className="chips">
          <span className="chip">💬 ответы на вопросы</span>
          <span className="chip">📚 публикация историй</span>
          <span className="chip">🤝 роль адаптера</span>
        </div>
      </header>

      <div className="pageActions">
        <button className="button buttonSoft" type="button" onClick={() => navigate("/")}>
          ← На главную
        </button>
      </div>

      <section className="card loginCard">
        <div className="loginCardHead">
          <div className="miniLabel">Только для адаптеров</div>
          <h2 className="cardTitle" style={{ marginBottom: 6 }}>
            Войти
          </h2>
          <p className="muted" style={{ margin: 0 }}>
            Используйте учётные данные адаптера, чтобы получить доступ к ответам и публикациям.
          </p>
        </div>

        <form className="form" onSubmit={onSubmit}>
          <div className="loginFields">
            <label className="loginField">
              <span className="loginLabel">Email</span>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mentor@example.com"
                autoComplete="username"
                required
              />
            </label>

            <label className="loginField">
              <span className="loginLabel">Пароль</span>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                autoComplete="current-password"
                required
              />
            </label>
          </div>

          <div className="loginHint">
            После входа вы сможете отвечать на вопросы первокурсников и делиться историями адаптации.
          </div>

          {error && <div className="error">Ошибка: {error}</div>}

          <div className="loginActions">
            <button className="button" disabled={loading} type="submit">
              {loading ? "Входим..." : "Войти"}
            </button>

            <button
              className="button buttonSoft"
              type="button"
              onClick={() => navigate(-1)}
            >
              ← Назад
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}