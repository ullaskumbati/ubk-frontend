import React, { useState } from "react";

export default function Settings({ user, setUser, api, showMessage }) {
  const [updateDetails, setUpdateDetails] = useState({ fullName: user.fullName, email: user.email });
  const [passData, setPassData] = useState({ oldPassword: "", newPassword: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch("/users/update-account", updateDetails);
      setUser(res.data.data);
      showMessage("Account details updated successfully!");
    } catch (err) {
      showMessage("Update failed", "error");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users/change-password", passData);
      showMessage("Password changed successfully!");
      setPassData({ oldPassword: "", newPassword: "" });
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to change password", "error");
    }
  };

  const handleUpdateAvatar = async (e) => {
    e.preventDefault();
    if (!avatarFile) return;
    const data = new FormData();
    data.append("avatar", avatarFile);
    try {
      const res = await api.patch("/users/avatar", data);
      setUser(res.data.data);
      showMessage("Avatar updated successfully!");
    } catch (err) {
      showMessage("Avatar update failed", "error");
    }
  };

  const handleUpdateCover = async (e) => {
    e.preventDefault();
    if (!coverFile) return;
    const data = new FormData();
    data.append("coverImage", coverFile);
    try {
      const res = await api.patch("/users/cover-image", data);
      setUser(res.data.data);
      showMessage("Cover image updated successfully!");
    } catch (err) {
      showMessage("Cover update failed", "error");
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Account Settings</h2>
        <p className="text-sm text-slate-400 mt-1">Manage your credentials, profile branding, and security preferences.</p>
      </div>

      {/* Update Info */}
      <div className="bg-[#0d121f] border border-slate-800/80 p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Update Account Details</h3>
        <form onSubmit={handleUpdateAccount} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400">Full Name</label>
            <input type="text" value={updateDetails.fullName} onChange={e => setUpdateDetails({...updateDetails, fullName: e.target.value})} className="w-full mt-1.5 bg-[#04060a] border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500" required />
          </div>
          <div>
            <label className="text-xs text-slate-400">Email</label>
            <input type="email" value={updateDetails.email} onChange={e => setUpdateDetails({...updateDetails, email: e.target.value})} className="w-full mt-1.5 bg-[#04060a] border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500" required />
          </div>
          <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2.5 rounded-xl text-xs transition-all">Save Changes</button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-[#0d121f] border border-slate-800/80 p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Change Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400">Old Password</label>
            <input type="password" value={passData.oldPassword} onChange={e => setPassData({...passData, oldPassword: e.target.value})} className="w-full mt-1.5 bg-[#04060a] border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500" required />
          </div>
          <div>
            <label className="text-xs text-slate-400">New Password</label>
            <input type="password" value={passData.newPassword} onChange={e => setPassData({...passData, newPassword: e.target.value})} className="w-full mt-1.5 bg-[#04060a] border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500" required />
          </div>
          <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2.5 rounded-xl text-xs transition-all">Update Password</button>
        </form>
      </div>

      {/* Avatar Update */}
      <div className="bg-[#0d121f] border border-slate-800/80 p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Update Avatar</h3>
        <form onSubmit={handleUpdateAvatar} className="space-y-4">
          <input type="file" onChange={e => setAvatarFile(e.target.files[0])} className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-500 file:text-black cursor-pointer" required />
          <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2.5 rounded-xl text-xs transition-all">Upload Avatar</button>
        </form>
      </div>

      {/* Cover Image Update */}
      <div className="bg-[#0d121f] border border-slate-800/80 p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Update Cover Image</h3>
        <form onSubmit={handleUpdateCover} className="space-y-4">
          <input type="file" onChange={e => setCoverFile(e.target.files[0])} className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-500 file:text-black cursor-pointer" required />
          <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2.5 rounded-xl text-xs transition-all">Upload Cover</button>
        </form>
      </div>
    </div>
  );
}