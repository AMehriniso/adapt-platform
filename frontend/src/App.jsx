import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import HomePage from "./pages/HomePage.jsx";
import QuestionsPage from "./pages/QuestionsPage.jsx";
import QuestionDetailsPage from "./pages/QuestionDetailsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import StoriesPage from "./pages/StoriesPage.jsx";
import StoryDetailsPage from "./pages/StoryDetailsPage.jsx";
import RulesPage from "./pages/RulesPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/questions" element={<QuestionsPage />} />
      <Route path="/questions/:id" element={<QuestionDetailsPage />} />

      <Route path="/stories" element={<StoriesPage />} />
      <Route path="/stories/:id" element={<StoryDetailsPage />} />
      <Route path="/rules" element={<RulesPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}