import React from "react";
import { Video } from "lucide-react";

export default function WatchHistory({ watchHistory }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Watch History</h2>
        <p className="text-sm text-slate-400 mt-1">Review content you have previously viewed on the platform.</p>
      </div>

      {watchHistory.length === 0 ? (
        <p className="text-slate-400 text-sm bg-[#0d121f] border border-slate-800/80 p-6 rounded-2xl">No watch history recorded yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
          {watchHistory.map((video) => (
            <div key={video._id} className="bg-[#0d121f] border border-slate-800/80 p-4 rounded-2xl flex gap-4 items-center">
              <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
                <Video size={24} />
              </div>
              <div className="overflow-hidden">
                <h4 className="font-semibold text-sm text-slate-200 truncate">{video.title || "Untitled Video"}</h4>
                <p className="text-xs text-slate-400 truncate mt-0.5">{video.description || "No description provided"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}