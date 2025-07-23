"use client";
import React, { useState, useRef } from "react";

const initialProfile = {
  name: "John Doe",
  phone: "9876543210",
  sms_phone: "9876543210",
  profileImage: "https://ui-avatars.com/api/?name=John+Doe",
  hide_ranking: false,
};

export default function StudentProfile() {
  const [profile, setProfile] = useState(initialProfile);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [imgPreview, setImgPreview] = useState(profile.profileImage);
  const fileInputRef = useRef();

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setProfile(initialProfile);
    setImgPreview(initialProfile.profileImage);
    setEditMode(false);
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
      const reader = new FileReader();
      reader.onload = (ev) => setImgPreview(ev.target.result);
      reader.readAsDataURL(file);
      setProfile((prev) => ({ ...prev, profileImage: file }));
    }
  };
  const handleSave = (e) => {
    e.preventDefault();
    // Here you would send updated profile to backend
    setEditMode(false);
  };
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // Here you would handle password change logic
    setShowPasswordModal(false);
    setPasswords({ current: "", new: "", confirm: "" });
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow mt-8">
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
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.25 2.25 0 1 1 3.182 3.182L7.5 20.213l-4.182.545.545-4.182L16.862 4.487z" />
                </svg>
              </button>
            </>
          )}
        </div>
        <div>
          <div className="text-2xl font-bold text-black mb-1">{profile.name}</div>
          <div className="text-gray-500">{profile.phone}</div>
        </div>
      </div>
      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-black mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            disabled={!editMode}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            value={profile.phone}
            disabled
            className="w-full px-3 py-2 border rounded-md text-black bg-gray-100 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1">SMS Phone</label>
          <input
            type="text"
            name="sms_phone"
            value={profile.sms_phone}
            onChange={handleChange}
            disabled={!editMode}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black disabled:bg-gray-100"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="block text-sm font-medium text-black mb-1">Hide Ranking</label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="hide_ranking"
              checked={profile.hide_ranking}
              onChange={handleChange}
              disabled={!editMode}
              className="sr-only peer"
            />
            <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full transition-colors duration-200 ${profile.hide_ranking ? 'bg-blue-600' : ''}`}></div>
            <div className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white border border-gray-300 rounded-full shadow-md transition-transform duration-200 ${profile.hide_ranking ? 'translate-x-5' : ''}`}></div>
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
                className="px-6 py-2 rounded-md bg-gray-200 text-black font-medium shadow hover:bg-gray-300 transition"
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
              >
                Save
              </button>
              <button
                type="button"
                className="px-6 py-2 rounded-md bg-gray-200 text-black font-medium shadow hover:bg-gray-300 transition"
                onClick={handleCancel}
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
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-2 right-2 text-black text-xl font-bold hover:text-red-500"
              title="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4 text-black text-center">Change Password</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">Current Password</label>
                <input
                  type="password"
                  name="current"
                  value={passwords.current}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">New Password</label>
                <input
                  type="password"
                  name="new"
                  value={passwords.new}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Confirm New Password</label>
                <input
                  type="password"
                  name="confirm"
                  value={passwords.confirm}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
                  className="px-6 py-2 rounded-md bg-gray-200 text-black font-medium shadow hover:bg-gray-300 transition"
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
