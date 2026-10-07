import { useNavigate } from "react-router-dom";
import { isLoggedIn, isAdmin, clearToken } from "../auth.js";

export default function HomePage() {
  const navigate = useNavigate();

  const logged = isLoggedIn();
  const admin = isAdmin();

  return (
    <div className="page">
      <div className="topbar">
        <div className="brand">
          <div className="logoDot" aria-hidden="true" />
          <div className="brandTitle">
            <strong>Платформа адаптации</strong>
            <span>вопросы • истории • поддержка</span>
          </div>
        </div>

        <div className="navPills">
          <button className="button pillButton" onClick={() => navigate("/stories")}>
            📚 <span>Истории</span>
          </button>

          <button className="button pillButton" onClick={() => navigate("/questions")}>
            💬 <span>Вопросы</span>
          </button>

          {!logged ? (
            <button className="button pillButton" onClick={() => navigate("/login")}>
              🔒 <span>Вход</span>
            </button>
          ) : (
            <>
              {admin && (
                <button className="button pillButton" onClick={() => navigate("/admin")}>
                  🛠 <span>Админ</span>
                </button>
              )}

              <button
                className="button pillButton"
                onClick={() => {
                  clearToken();
                  navigate("/", { replace: true });
                }}
              >
                🚪 <span>Выйти</span>
              </button>
            </>
          )}
        </div>
      </div>

      <header className="header">
        <h1 className="title">Точка адаптации</h1>

        <div className="chips">
          <span className="chip">✅ безопасное общение</span>
          <span className="chip">🫥 без регистрации</span>
          <span className="chip">🧩 ответы от адаптеров</span>
        </div>

        <div className="heroActions">
          <button className="button" onClick={() => navigate("/questions")}>
            Задать вопрос
          </button>

          <button className="button" onClick={() => navigate("/stories")}>
            Читать истории
          </button>

          <button className="button" onClick={() => navigate("/rules")}>
            Правила и безопасность
          </button>
        </div>

        <div className="heroFeatures">

  <div className="featureCard support">
    <div className="featureIcon">💬</div>
    <div>
      <h3>Поддержка</h3>
      <p>
        Можно спрашивать про учёбу, стресс, друзей, группу, общение и первые
        трудности в университете.
      </p>
    </div>
  </div>

  <div className="featureCard moderation">
    <div className="featureIcon">🛡️</div>
    <div>
      <h3>Модерация</h3>
      <p>
        Все публикации проходят проверку, а на контент можно отправить жалобу.
      </p>
    </div>
  </div>

  <div className="featureCard simple">
    <div className="featureIcon">⚡</div>
    <div>
      <h3>Просто</h3>
      <p>
        Не нужно проходить сложную регистрацию: открыл платформу,
        прочитал и задал вопрос.
      </p>
    </div>
  </div>

</div>
      </header>

      <section className="listSection">
        <div className="grid">
          <section className="card">
            <h2 className="sectionTitle">Истории адаптации</h2>
            <p className="muted">
              Реальный опыт старших курсов: как проходила адаптация, с какими проблемами они
              сталкивались и что действительно помогло в начале обучения.
            </p>

            <div className="heroActions" style={{ justifyContent: "flex-start", marginTop: 18 }}>
              <button className="button" onClick={() => navigate("/stories")}>
                Открыть истории
              </button>

              <button className="button" onClick={() => navigate("/stories?topic=друзья")}>
                Тема: друзья
              </button>
            </div>
          </section>

          <section className="card">
            <h2 className="sectionTitle">Вопросы и ответы</h2>
            <p className="muted">
              Читайте уже опубликованные вопросы первокурсников и ответы адаптеров. Можно задать свой
              вопрос и получить ответы от опытных адаптеров.
            </p>

            <div className="heroActions" style={{ justifyContent: "flex-start", marginTop: 18 }}>
              <button className="button" onClick={() => navigate("/questions")}>
                Перейти к вопросам
              </button>

              <button className="button" onClick={() => navigate("/questions#ask")}>
                Задать свой вопрос
              </button>
            </div>
          </section>
        </div>
      </section>

      <section className="listSection">
        <h2 className="sectionTitle">Полезные контакты</h2>

        <div className="grid">
          <section className="card">
            <h3 className="cardTitle">🧠 Психологическая помощь ИТМО</h3>
            <p className="muted">
              Каждый российский или иностранный студент Университета ИТМО может получить бесплатную психологическую поддержку.
            </p>

            <div className="meta">
              <span>📞 +7 (812) 480-03-40 </span>
              <span>🏫 пр-т Кронверкский, д.49, ауд. 2202 </span>
              <span>🌐 <a href src='https://itmo.ru/ru/viewunit/87203/mediko-psihologo-socialnyy_centr.htm'>Медико-психолого-социальный центр </a> </span>
            </div>
          </section>

          <section className="card">
            <h3 className="cardTitle">🤝 Клуб "Адаптер"</h3>
            <p className="muted">
              Опытные обученные старшекурсники готовы ответить на любой ваш вопрос и помочь с любой проблемой! 
            </p>

            <div className="meta">
              <span> ⭐ <a href src='https://t.me/adapterinfo'> Телеграм-канал "Адаптер" </a></span>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}