"use client";
import React, { useState, useRef, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { getStudentData } from "../../../lib/auth";

const CLOUDINARY_UPLOAD_URL = process.env.NEXT_PUBLIC_CLOUDINARY_URL || "https://api.cloudinary.com/v1_1/dxyneuwlb/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "mess_management_student"; // You may want to create this preset in Cloudinary

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

  // Fetch student profile on mount
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
    // Reload profile from server
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
        // Cloudinary URL from env or fallback
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
      // Update localStorage studentData
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
      // Optionally, verify current password on backend
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
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-[#232329] rounded-lg shadow mt-8">
      <Toaster position="top-right" />
      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-24 h-24">
          <img
            src={imgPreview}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border"
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
                className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 shadow hover:bg-blue-700"
                onClick={() => fileInputRef.current.click()}
                title="Change Profile Image"
                disabled={uploading}
              >
                {uploading ? (
                  <span className="w-5 h-5 animate-spin border-b-2 border-white inline-block rounded-full"></span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.25 2.25 0 1 1 3.182 3.182L7.5 20.213l-4.182.545.545-4.182L16.862 4.487z" />
                  </svg>
                )}
              </button>
            </>
          )}
        </div>
        <div>
          <div className="text-2xl font-bold text-black dark:text-white mb-1">{profile.name}</div>
          <div className="text-gray-500 dark:text-gray-300">{profile.phone}</div>
        </div>
      </div>
      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-black dark:text-white mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            disabled={!editMode}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white dark:bg-[#18181b] disabled:bg-gray-100 dark:disabled:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black dark:text-white mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            value={profile.phone}
            disabled
            className="w-full px-3 py-2 border rounded-md text-black dark:text-white bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black dark:text-white mb-1">SMS Phone</label>
          <input
            type="text"
            name="smsPhone"
            value={profile.smsPhone || profile.sms_phone}
            onChange={handleChange}
            disabled={!editMode}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white dark:bg-[#18181b] disabled:bg-gray-100 dark:disabled:bg-gray-800"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="block text-sm font-medium text-black dark:text-white mb-1">Hide Ranking</label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="hideRanking"
              checked={profile.hideRanking ?? profile.hide_ranking}
              onChange={handleChange}
              disabled={!editMode}
              className="sr-only peer"
            />
            <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full transition-colors duration-200 ${profile.hideRanking ?? profile.hide_ranking ? 'bg-blue-600' : ''}`}></div>
            <div className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white border border-gray-300 rounded-full shadow-md transition-transform duration-200 ${profile.hideRanking ?? profile.hide_ranking ? 'translate-x-5' : ''}`}></div>
          </label>
        </div>
        <div className="flex gap-3 mt-6">
          {!editMode && (
            <>
              <button
                type="button"
                className="px-6 py-2 rounded-md bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition"
                onClick={handleEdit}
              >
                Edit
              </button>
              <button
                type="button"
                className="px-6 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-medium shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                onClick={() => setShowPasswordModal(true)}
              >
                Change Password
              </button>
            </>
          )}
          {editMode && (
            <>
              <button
                type="submit"
                className="px-6 py-2 rounded-md bg-green-600 text-white font-medium shadow hover:bg-green-700 transition"
                disabled={uploading}
              >
                {uploading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className="px-6 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-medium shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                onClick={handleCancel}
                disabled={uploading}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </form>
      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-[#232329] rounded-lg shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-2 right-2 text-black dark:text-white text-xl font-bold hover:text-red-500"
              title="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-white text-center">Change Password</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-1">New Password</label>
                <input
                  type="password"
                  name="new"
                  value={passwords.new}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white dark:bg-[#18181b]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-1">Confirm New Password</label>
                <input
                  type="password"
                  name="confirm"
                  value={passwords.confirm}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white dark:bg-[#18181b]"
                  required
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-md bg-green-600 text-white font-medium shadow hover:bg-green-700 transition"
                >
                  Change Password
                </button>
                <button
                  type="button"
                  className="px-6 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-medium shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
