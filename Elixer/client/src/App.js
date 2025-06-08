import { Route, Routes, Navigate } from "react-router-dom";
import Chat from "./components/Main";
import Chatbot from "./components/Main/chatbot";
import Main from "./components/Main";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Reports from "./components/Reports/reports";
import LabReports from "./components/Reports/labreports";
import Results from "./components/Reports/results";
import Profile from "./components/Main/profile";
import BiomarkerExpanded from "./components/Reports/BiomarkerExpanded";
import AddReport from "./components/Reports/AddReports";

function App() {
    const user = localStorage.getItem("token");

    return (
        <Routes>
            {/* Authenticated Routes */}
            {user && <Route path="/" element={<Main />} />}
            {user && <Route path="/chat" element={<Chatbot />} />}
            {user && <Route path="/reports" element={<Reports />} />}
            {user && <Route path="/reports/labreports" element={<LabReports />} />}
            {user && <Route path="/reports/results" element={<Results />} />}
            {user && <Route path="/reports/biomarker/:name" element={<BiomarkerExpanded />} />}
			{user && <Route path="/reports/add" element={<AddReport />} />}
            {user && <Route path="/profile" element={<Profile />} />}

            {/* Public Routes */}
            {!user && <Route path="/signup" element={<Signup />} />}
            {!user && <Route path="/login" element={<Login />} />}

            {/* Redirects */}
            {user ? (
                <Route path="*" element={<Navigate to="/" />} />
            ) : (
                <Route path="*" element={<Navigate to="/login" />} />
            )}
        </Routes>
    );
}

export default App;
