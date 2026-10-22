import React, { useState } from "react";
import { CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function Auth({ onLoginSuccess, api }) {
  const [authMode, setAuthMode] = useState("login");
  const [formData, setFormData] = useState({ email: "", userName: "", password: "", fullName: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (authMode === "register") {
        const data = new FormData();
        data.append("email", formData.email);
        data.append("userName", formData.userName);
        data.append("password", formData.password);
        data.append("fullName", formData.fullName);
        if (avatarFile) data.append("avatar", avatarFile);
        if (coverFile) data.append("coverImage", coverFile);

        await api.post("/users/register", data);
        showMessage("Registration successful! Please sign in.");
        setAuthMode("login");
      } else {
        await api.post("/users/login", {
          email: formData.email,
          userName: formData.userName,
          password: formData.password
        });
        showMessage("Logged in successfully!");
        onLoginSuccess();
      }
    } catch (err) {
      showMessage(err.response?.data?.message || "Authentication failed", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.05)_0,transparent_100%)] pointer-events-none" />
      <div className="relative bg-[#0d121f] border border-slate-800/80 p-8 rounded-3xl w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-4 font-mono font-bold text-xl">
            VT
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {authMode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            {authMode === "login" ? "Enter your credentials to access your portal" : "Fill in details to set up your creator profile"}
          </p>
        </div>

        {message.text && (
          <div className={`mb-6 p-3 rounded-xl text-xs flex items-center gap-2.5 ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'}`}>
            {message.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {authMode === "register" && (
            <>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                <input type="text" placeholder="John Doe" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full mt-1.5 bg-[#04060a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all" required />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Avatar Image</label>
                <input type="file" onChange={e => setAvatarFile(e.target.files[0])} className="w-full mt-1.5 text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-cyan-500 file:text-black hover:file:bg-cyan-400 cursor-pointer" required />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cover Image (Optional)</label>
                <input type="file" onChange={e => setCoverFile(e.target.files[0])} className="w-full mt-1.5 text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer" />
              </div>
            </>
          )}

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Email</label>
            <input type="email" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full mt-1.5 bg-[#04060a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all" required />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">UserName</label>
            <input type="text" placeholder="johndoe" value={formData.userName} onChange={e => setFormData({...formData, userName: e.target.value})} className="w-full mt-1.5 bg-[#04060a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all" required />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative mt-1.5">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                className="w-full bg-[#04060a] border border-slate-800 rounded-xl px-4 py-3 pr-11 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all" 
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] mt-2">
            {authMode === "login" ? "Sign In" : "Register Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          {authMode === "login" ? (
            <p>Don't have an account? <button onClick={() => setAuthMode("register")} className="text-cyan-400 font-semibold hover:underline">Register</button></p>
          ) : (
            <p>Already have an account? <button onClick={() => setAuthMode("login")} className="text-cyan-400 font-semibold hover:underline">Sign In</button></p>
          )}
        </div>
      </div>
    </div>
  );
}