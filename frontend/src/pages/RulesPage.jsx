import { useNavigate } from "react-router-dom";

export default function RulesPage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <header className="header rulesHero">
        <div className="heroBadge">🛡️ Правила платформы</div>
        <h1 className="title">Правила и безопасность</h1>
        <p className="subtitle">
          Коротко о том, как мы поддерживаем уважительное общение, приватность и
          безопасную атмосферу на платформе.
        </p>

        <div className="chips">
          <span className="chip">🤝 уважение</span>
          <span className="chip">🔒 приватность</span>
          <span className="chip">🛡️ модерация</span>
        </div>
      </header>

      <div className="pageActions rulesActions">
        <button className="button buttonSoft" onClick={() => navigate("/")}>
          ← На главную
        </button>
        <button className="button buttonSoft" onClick={() => navigate("/questions")}>
          💬 Вопросы
        </button>
        <button className="button buttonSoft" onClick={() => navigate("/stories")}>
          📚 Истории
        </button>
      </div>

      <section className="rulesGrid">
        <article className="card rulesCard rulesTone1">
          <div className="rulesCardTop">
            <span className="rulesIndex">1</span>
            <div>
              <h2 className="rulesTitle">Уважение и поддержка</h2>
              <p className="rulesLead">
                Платформа создана для помощи первокурсникам. Поэтому здесь запрещены
                оскорбления, травля, дискриминация, угрозы и провокации.
              </p>
            </div>
          </div>

          <div className="rulesList">
            <div className="rulesItem">
              <span className="rulesBadge ok">Можно</span>
              <p>делиться опытом, страхами, вопросами про учёбу и общение.</p>
            </div>

            <div className="rulesItem">
              <span className="rulesBadge no">Нельзя</span>
              <p>публиковать агрессию, унижения, “разборки” и личные нападки.</p>
            </div>

            <div className="rulesItem">
              <span className="rulesBadge tip">Совет</span>
              <p>если эмоций много — лучше сформулировать вопрос спокойно и по сути.</p>
            </div>
          </div>
        </article>

        <article className="card rulesCard rulesTone2">
          <div className="rulesCardTop">
            <span className="rulesIndex">2</span>
            <div>
              <h2 className="rulesTitle">Приватность</h2>
              <p className="rulesLead">
                Вопросы от первокурсников создаются без регистрации и публикуются анонимно.
                Не указывайте в тексте фамилии, номера телефонов, адреса, ссылки на личные
                аккаунты и другие персональные данные — ни свои, ни чужие.
              </p>
            </div>
          </div>

          <div className="rulesTags">
            <span className="rulesTag">🫥 анонимные вопросы</span>
            <span className="rulesTag">🔒 без персональных данных</span>
            <span className="rulesTag">🧩 безопасное общение</span>
          </div>
        </article>

        <article className="card rulesCard rulesTone3">
          <div className="rulesCardTop">
            <span className="rulesIndex">3</span>
            <div>
              <h2 className="rulesTitle">Модерация и жалобы</h2>
              <p className="rulesLead">
                Все вопросы проходят модерацию перед публикацией. Если вы увидели спам
                или оскорбления — нажмите «Пожаловаться». Администратор может скрыть
                контент или отклонить жалобу, если нарушение не подтверждается.
              </p>
            </div>
          </div>

          <div className="rulesList compact">
            <div className="rulesItem">
              <span className="rulesBadge neutral">Вопросы</span>
              <p>сначала PENDING, после проверки становятся APPROVED.</p>
            </div>

            <div className="rulesItem">
              <span className="rulesBadge neutral">Ответы адаптеров</span>
              <p>публикуются сразу, но тоже могут быть скрыты по жалобе.</p>
            </div>

            <div className="rulesItem">
              <span className="rulesBadge neutral">Истории</span>
              <p>публикуются адаптерами и тоже могут быть скрыты при нарушениях.</p>
            </div>
          </div>
        </article>

        <article className="card rulesCard rulesTone4">
          <div className="rulesCardTop">
            <span className="rulesIndex">4</span>
            <div>
              <h2 className="rulesTitle">Важно</h2>
              <p className="rulesLead">
                Платформа не заменяет профессиональную психологическую помощь. Если вам
                очень тяжело, лучше обратиться в психологическую службу вуза или к специалисту.
              </p>
            </div>
          </div>

          <div className="rulesTags">
            <span className="rulesTag">🧠 психологическая служба</span>
            <span className="rulesTag">📞 горячие линии</span>
            <span className="rulesTag">🤝 поддержка адаптеров</span>
          </div>

        </article>
      </section>
    </div>
  );
}