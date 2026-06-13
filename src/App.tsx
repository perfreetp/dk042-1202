import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Tasks from "@/pages/Tasks";
import Matching from "@/pages/Matching";
import Issues from "@/pages/Issues";
import Rectification from "@/pages/Rectification";
import Analytics from "@/pages/Analytics";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/tasks" replace />} />
        <Route element={<AppLayout />}>
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/:id/matching" element={<Matching />} />
          <Route path="/tasks/:id/issues" element={<Issues />} />
          <Route path="/rectification" element={<Rectification />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </Router>
  );
}
