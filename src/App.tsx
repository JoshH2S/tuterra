
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import JobInterviewSimulator from "@/pages/JobInterviewSimulator";
import InternshipPhaseTwo from "@/pages/InternshipPhaseTwo";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<JobInterviewSimulator />} />
        <Route path="/interview" element={<JobInterviewSimulator />} />
        <Route path="/interview/:id" element={<JobInterviewSimulator />} />
        <Route path="/internship/phase-2/:sessionId" element={<InternshipPhaseTwo />} />
      </Routes>
    </Router>
  );
}

export default App;
