import React, { useState, useEffect } from "react";
import { api } from "./api/axios";
import { User, LogOut, History, RefreshCw, Settings as SettingsIcon, CheckCircle, AlertCircle, Eye } from "lucide-react";

import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import Settings from "./components/Settings";
import ChannelProfile from "./components/channelProfile"
import WatchHistory from "./components/WatchHistory";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [watchHistory, setWatchHistory] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/users/current-user");
      setUser(res.data.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
      setUser(null);
      showMessage("Logged out successfully");
    } catch (err) {
      showMessage("Logout failed", "error");
    }
  };

  const handleRefreshToken = async () => {
    try {
      await api.post("/users/refresh-token");
      showMessage("Access token refreshed successfully!");
    } catch (err) {
      showMessage("Token refresh failed", "error");
    }
  };

  const fetchWatchHistoryData = async () => {
    try {
      const res = await api.get("/users/history");
      setWatchHistory(res.data.data);
      setActiveTab("history");
    } catch (err) {
      showMessage("Failed to load watch history", "error");
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#07090e] text-cyan-400 font-mono flex items-center justify-center">Loading Portal...</div>;
  }

  if (!user) {
    return <Auth onLoginSuccess={fetchCurrentUser} api={api} />;
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex selection:bg-cyan-500 selection:text-black">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800/80 bg-[#07090e]/80 backdrop-blur-xl p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-800/80">
            <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-cyan-500" />
            <div className="overflow-hidden">
              <h4 className="font-semibold text-sm truncate text-slate-200">{user.fullName}</h4>
              <p className="text-xs text-cyan-400 truncate font-mono">@{user.username}</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button onClick={() => setActiveTab("dashboard")} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}>
              <User size={16} /> Dashboard
            </button>
            <button onClick={() => setActiveTab("settings")} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'settings' ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}>
              <SettingsIcon size={16} /> Settings & Profile
            </button>
            <button onClick={() => setActiveTab("channel")} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'channel' ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}>
              <Eye size={16} /> Channel Profile
            </button>
            <button onClick={fetchWatchHistoryData} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'history' ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}>
              <History size={16} /> Watch History
            </button>
          </nav>
        </div>

        <div className="space-y-2 pt-4 border-t border-slate-800/80">
          <button onClick={handleRefreshToken} className="w-full flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 py-2.5 px-3 rounded-xl bg-[#0d121f] border border-slate-800 transition-all">
            <RefreshCw size={14} /> Refresh Token
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-xs text-red-400 hover:bg-red-500/10 py-2.5 px-3 rounded-xl transition-all">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto bg-[#07090e]">
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl text-xs flex items-center gap-3 ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'}`}>
            {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            {message.text}
          </div>
        )}

        {activeTab === "dashboard" && <Dashboard user={user} />}
        {activeTab === "settings" && <Settings user={user} setUser={setUser} api={api} showMessage={showMessage} />}
        {activeTab === "channel" && <ChannelProfile api={api} showMessage={showMessage} />}
        {activeTab === "history" && <WatchHistory watchHistory={watchHistory} />}
      </main>
    </div>
  );
}