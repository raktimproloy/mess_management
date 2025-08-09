"use client";
import React, { useState, useRef, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { getStudentData } from "../../../lib/auth";
import { usePreventScroll } from '../../../hooks/usePreventScroll';

const CLOUDINARY_UPLOAD_URL = process.env.NEXT_PUBLIC_CLOUDINARY_URL || "https://api.cloudinary.com/v1_1/dxyneuwlb/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "mess_management_student";

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [imgPreview, setImgPreview] = useState("");
  const [imgFile, setImgFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef();
  
  const bookingAmountRef = usePreventScroll();

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const student = getStudentData();
        if (!student) throw new Error("Not authenticated");
        const token = localStorage.getItem("studentToken");
        const res = await fetch(`/api/student/${student.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
        setImgPreview(data.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}`);
      } catch (err) {
        toast.error(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setImgFile(null);
    setPasswords({ current: "", new: "", confirm: "" });
    setLoading(true);
    const student = getStudentData();
    fetch(`/api/student/${student.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("studentToken")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setImgPreview(data.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}`);
      })
      .finally(() => setLoading(false));
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImgFile(file);
      setImgPreview(URL.createObjectURL(file));
    }
  };
  
  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile) return;
    let imageUrl = profile.profileImage;
    if (imgFile) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", imgFile);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        const uploadUrl = CLOUDINARY_UPLOAD_URL.includes("cloudinary://")
          ? `https://api.cloudinary.com/v1_1/${CLOUDINARY_UPLOAD_URL.split("@")[1]}/image/upload`
          : CLOUDINARY_UPLOAD_URL;
        const res = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!data.secure_url) throw new Error("Image upload failed");
        imageUrl = data.secure_url;
        setImgPreview(imageUrl);
        toast.success("Profile image uploaded");
      } catch (err) {
        toast.error("Image upload failed");
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    try {
      const student = getStudentData();
      const token = localStorage.getItem("studentToken");
      const updateData = {
        name: profile.name,
        smsPhone: profile.smsPhone || profile.sms_phone,
        profileImage: imageUrl,
        hideRanking: (profile.hideRanking ?? profile.hide_ranking) ? 1 : 0,
      };
      const res = await fetch(`/api/student/${student.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const updated = await res.json();
      setProfile(updated);
      setEditMode(false);
      localStorage.setItem("studentData", JSON.stringify(updated));
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    }
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwords.new || passwords.new !== passwords.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const student = getStudentData();
      const token = localStorage.getItem("studentToken");
      const res = await fetch(`/api/student/${student.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: passwords.new }),
      });
      if (!res.ok) throw new Error("Failed to change password");
      setShowPasswordModal(false);
      setPasswords({ current: "", new: "", confirm: "" });
      toast.success("Password changed successfully");
    } catch (err) {
      toast.error(err.message || "Failed to change password");
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">👤 My Profile</h1>
        <p className="text-gray-300 text-sm">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
        {/* Profile Header */}
        <div className="p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={imgPreview}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-white/20 shadow-lg"
              />
              {editMode && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                  <button
                    type="button"
                    className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full p-2 shadow-lg hover:scale-110 transition-all duration-300"
                    onClick={() => fileInputRef.current.click()}
                    title="Change Profile Image"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.25 2.25 0 1 1 3.182 3.182L7.5 20.213l-4.182.545.545-4.182L16.862 4.487z" />
                      </svg>
                    )}
                  </button>
                </>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">{profile.name}</h2>
              <p className="text-gray-300 text-sm">📱 {profile.phone}</p>
            </div>
            {!editMode && (
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-white/10 text-white rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                ✏️ Edit
              </button>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className="p-6">
          <form onSubmit={handleSave} className="space-y-4">
            {/* Name Field */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <label className="block text-sm font-medium text-gray-300 mb-2">👤 Full Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-white/5 disabled:cursor-not-allowed transition-all duration-300"
              />
            </div>

            {/* Phone Field */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <label className="block text-sm font-medium text-gray-300 mb-2">📱 Phone Number</label>
              <input
                type="text"
                name="phone"
                value={profile.phone}
                disabled
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* SMS Phone Field */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <label className="block text-sm font-medium text-gray-300 mb-2">📨 SMS Phone</label>
              <input
                type="text"
                name="smsPhone"
                value={profile.smsPhone || profile.sms_phone}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-white/5 disabled:cursor-not-allowed transition-all duration-300"
                placeholder="Enter SMS phone number"
              />
            </div>

            {/* Booking Amount Field */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <label className="block text-sm font-medium text-gray-300 mb-2">💰 Booking Amount</label>
              <input
                type="number"
                name="bookingAmount"
                value={profile.bookingAmount || 0}
                disabled
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed"
                ref={bookingAmountRef}
              />
            </div>

            {/* Hide Ranking Toggle */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">🏆 Hide Ranking</label>
                  <p className="text-gray-400 text-xs">Hide your ranking from other students</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="hideRanking"
                    checked={profile.hideRanking ?? profile.hide_ranking}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="sr-only peer"
                  />
                  <div className={`w-12 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full transition-all duration-300 ${profile.hideRanking ?? profile.hide_ranking ? 'bg-blue-500' : ''}`}></div>
                  <div className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white border border-white/20 rounded-full shadow-md transition-transform duration-300 ${profile.hideRanking ?? profile.hide_ranking ? 'translate-x-6' : ''}`}></div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {!editMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(true)}
                    className="flex-1 py-3 px-4 bg-white/10 text-white rounded-xl border border-white/20 font-medium hover:bg-white/20 transition-all duration-300"
                  >
                    🔐 Change Password
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform "
                    disabled={uploading}
                  >
                    {uploading ? "💾 Saving..." : "💾 Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="py-3 px-4 bg-white/10 text-white rounded-xl border border-white/20 font-medium hover:bg-white/20 transition-all duration-300"
                    disabled={uploading}
                  >
                    ❌ Cancel
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-md border border-white/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">🔐 Change Password</h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-white text-2xl font-bold transition-colors"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">🔑 New Password</label>
                  <input
                    type="password"
                    name="new"
                    value={passwords.new}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">✅ Confirm Password</label>
                  <input
                    type="password"
                    name="confirm"
                    value={passwords.confirm}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform "
                  >
                    🔐 Change Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="py-3 px-4 bg-white/10 text-white rounded-xl border border-white/20 font-medium hover:bg-white/20 transition-all duration-300"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
