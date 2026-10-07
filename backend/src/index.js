
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server works!" });
});

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "missing bearer token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; 
    next();
  } catch {
    return res.status(401).json({ error: "invalid token" });
  }
}

function authOptional(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    req.user = null;
    return next();
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    req.user = null;
  }

  next();
}

/* ============================
   AUTH
============================ */

// POST /auth/login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
});

/* ============================
   QUESTIONS (PUBLIC)
============================ */

// POST /questions — создать вопрос (только гость/первокурсник)
app.post("/questions", authOptional, async (req, res) => {
  try {
    if (req.user) {
      return res.status(403).json({ error: "Адаптеры не могут задавать вопросы" });
    }

    const { title, body } = req.body;

    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return res.status(400).json({ error: "Заголовок должен быть не менее 3 символов" });
    }
    if (!body || typeof body !== "string" || body.trim().length < 10) {
      return res.status(400).json({ error: "Описание должно быть не менее 10 символов" });
    }

    const question = await prisma.question.create({
      data: {
        title: title.trim(),
        body: body.trim(),
        isAnonymous: true,
        status: "PENDING",
      },
    });

    res.status(201).json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
});

// GET /questions — публичный список (только APPROVED)
app.get("/questions", async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      include: {
        answers: { where: { status: "APPROVED" } },
      },
    });

    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
});

// GET /questions/:id — публичная страница вопроса (только APPROVED + ответы только APPROVED)
app.get("/questions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        answers: {
          where: { status: "APPROVED" },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!question) return res.status(404).json({ error: "not found" });
    if (question.status !== "APPROVED") {
      return res.status(404).json({ error: "not found" });
    }

    res.json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
});

/* ============================
   ANSWERS (MENTOR)
============================ */

// POST /questions/:id/answers — ответ адаптера
app.post("/questions/:id/answers", authRequired, async (req, res) => {
  try {
    if (req.user.role !== "MENTOR") {
      return res.status(403).json({ error: "only mentors can answer" });
    }

    const { id } = req.params;
    const { body } = req.body;

    if (!body || typeof body !== "string" || body.trim().length < 3) {
      return res.status(400).json({ error: "body must be at least 3 characters" });
    }

    const question = await prisma.question.findUnique({ where: { id } });
    if (!question) return res.status(404).json({ error: "question not found" });

    // отвечаем только на APPROVED (иначе странно)
    if (question.status !== "APPROVED") {
      return res.status(400).json({ error: "question is not approved yet" });
    }

    const answer = await prisma.answer.create({
      data: {
        body: body.trim(),
        status: "APPROVED",
        questionId: id,
        authorId: req.user.userId,
      },
    });

    res.status(201).json(answer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
});

/* ============================
   STORIES (PUBLIC + MENTOR CREATE)
============================ */

// GET /stories — публичный список историй (только APPROVED)
app.get("/stories", async (req, res) => {
  try {
    const stories = await prisma.story.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
    });
    res.json(stories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
});

// GET /stories/:id — публичное чтение истории (только APPROVED)
app.get("/stories/:id", async (req, res) => {
  try {
    const story = await prisma.story.findUnique({
      where: { id: req.params.id },
    });

    if (!story || story.status !== "APPROVED") {
      return res.status(404).json({ error: "story not found" });
    }

    res.json(story);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
});

// POST /stories — создать историю (только MENTOR)
app.post("/stories", authRequired, async (req, res) => {
  try {
    if (req.user.role !== "MENTOR") {
      return res.status(403).json({ error: "only mentors can create stories" });
    }

    const { title, body, topic } = req.body;

    if (!title || title.trim().length < 5) {
      return res.status(400).json({ error: "title must be at least 5 characters" });
    }
    if (!body || body.trim().length < 50) {
      return res.status(400).json({ error: "body must be at least 50 characters" });
    }

    const story = await prisma.story.create({
      data: {
        title: title.trim(),
        body: body.trim(),
        topic: topic?.trim() || null,
        status: "APPROVED", // у вас истории сразу публикуются
      },
    });

    res.status(201).json(story);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
});

/* ============================
   REPORTS (PUBLIC CREATE)
============================ */

// POST /reports — отправить жалобу (публично)
app.post("/reports", async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;

    if (!targetType || !targetId || !reason || reason.trim().length < 3) {
      return res.status(400).json({ error: "invalid report data" });
    }

    const report = await prisma.report.create({
      data: {
        targetType,
        targetId,
        reason: reason.trim(),
        status: "PENDING",
      },
    });

    res.status(201).json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
});

/* ============================
   ADMIN
============================ */

// GET /admin/questions/pending — очередь вопросов на модерацию
app.get("/admin/questions/pending", authRequired, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") return res.status(403).json({ error: "forbidden" });

    const items = await prisma.question.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
    });

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
});

// PATCH /admin/questions/:id — approve/reject вопрос
app.patch("/admin/questions/:id", authRequired, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") return res.status(403).json({ error: "forbidden" });

    const { id } = req.params;
    const { status } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "status must be APPROVED or REJECTED" });
    }

    const updated = await prisma.question.update({
      where: { id },
      data: { status },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
});

// GET /admin/reports — список открытых жалоб (PENDING) + preview
app.get("/admin/reports", authRequired, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "forbidden" });
    }

    const reports = await prisma.report.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });

    const enriched = [];
    for (const r of reports) {
      let targetTitle = null;
      let targetPreview = null;
      let questionId = null;

      if (r.targetType === "QUESTION") {
        const q = await prisma.question.findUnique({ where: { id: r.targetId } });
        if (q) {
          targetTitle = q.title;
          targetPreview = (q.body || "").slice(0, 120);
        }
      } else if (r.targetType === "ANSWER") {
        const a = await prisma.answer.findUnique({ where: { id: r.targetId } });
        if (a) {
          targetTitle = "Ответ";
          targetPreview = (a.body || "").slice(0, 120);
          questionId = a.questionId;
        }
      } else if (r.targetType === "STORY") {
        const s = await prisma.story.findUnique({ where: { id: r.targetId } });
        if (s) {
          targetTitle = s.title;
          targetPreview = (s.body || "").slice(0, 120);
        }
      }

      enriched.push({ ...r, targetTitle, targetPreview, questionId });
    }

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
});

// PATCH /admin/reports/:id — HIDE/DISMISS
app.patch("/admin/reports/:id", authRequired, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "forbidden" });
    }

    const { id } = req.params;
    const { action } = req.body; // "HIDE" | "DISMISS"

    if (!["HIDE", "DISMISS"].includes(action)) {
      return res.status(400).json({ error: "action must be HIDE or DISMISS" });
    }

    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) return res.status(404).json({ error: "report not found" });

    if (action === "HIDE") {
      if (report.targetType === "QUESTION") {
        await prisma.question.update({
          where: { id: report.targetId },
          data: { status: "REJECTED" },
        });
      } else if (report.targetType === "ANSWER") {
        await prisma.answer.update({
          where: { id: report.targetId },
          data: { status: "REJECTED" },
        });
      } else if (report.targetType === "STORY") {
        await prisma.story.update({
          where: { id: report.targetId },
          data: { status: "REJECTED" },
        });
      }
    }

    const updated = await prisma.report.update({
      where: { id },
      data: { status: "RESOLVED", action },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
});

/* ============================
   START
============================ */

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});