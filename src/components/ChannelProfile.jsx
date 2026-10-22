import React, { useState } from "react";

export default function ChannelProfile({ api, showMessage }) {
  const [searchUsername, setSearchUsername] = useState("");
  const [channelData, setChannelData] = useState(null);

  const fetchChannelProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.get(`/users/c/${searchUsername}`);
      setChannelData(res.data.data);
      showMessage("Channel profile fetched!");
    } catch (err) {
      showMessage(err.response?.data?.message || "Channel not found", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Channel Profile Lookup</h2>
        <p className="text-sm text-slate-400 mt-1">Search for any creator channel profile by their username.</p>
      </div>

      <form onSubmit={fetchChannelProfile} className="flex gap-3 max-w-md">
        <input type="text" placeholder="Enter username (e.g. johndoe)" value={searchUsername} onChange={e => setSearchUsername(e.target.value)} className="flex-1 bg-[#0d121f] border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-slate-200 placeholder-slate-600" required />
        <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-black px-5 py-2.5 rounded-xl text-sm font-semibold transition-all">Search</button>
      </form>

      {channelData && (
        <div className="bg-[#0d121f] border border-slate-800/80 rounded-2xl p-6 max-w-xl space-y-4 shadow-xl">
          <div className="flex items-center gap-4">
            <img src={channelData.avatar} alt="Channel Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500" />
            <div>
              <h3 className="text-xl font-bold text-white">{channelData.fullName}</h3>
              <p className="text-sm text-cyan-400 font-mono">@{channelData.username}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-sm">
            <div>
              <span className="text-slate-400">Subscribers:</span> <span className="font-semibold text-slate-200">{channelData.subscribersCount}</span>
            </div>
            <div>
              <span className="text-slate-400">Subscribed To:</span> <span className="font-semibold text-slate-200">{channelData.channelsSubscribedToCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}