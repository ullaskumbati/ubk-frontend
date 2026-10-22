import React from "react";

export default function Dashboard({ user }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome back, {user.fullName}!</h2>
        <p className="text-sm text-slate-400 mt-1">Here is a quick overview of your channel state and credentials.</p>
      </div>

      {user.coverImage && (
        <div className="w-full h-52 rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl relative">
          <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090e]/60 to-transparent" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#0d121f] border border-slate-800/80 p-6 rounded-2xl">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">UserName</p>
          <p className="text-base font-semibold mt-2 text-cyan-400 font-mono">@{user.userName}</p>
        </div>
        <div className="bg-[#0d121f] border border-slate-800/80 p-6 rounded-2xl">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Email Address</p>
          <p className="text-base font-semibold mt-2 text-slate-200">{user.email}</p>
        </div>
        <div className="bg-[#0d121f] border border-slate-800/80 p-6 rounded-2xl">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Account ID</p>
          <p className="text-xs font-mono mt-2 text-slate-400 truncate bg-[#04060a] p-2 rounded-lg border border-slate-800">{user._id}</p>
        </div>
      </div>
    </div>
  );
}