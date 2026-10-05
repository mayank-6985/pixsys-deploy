import React, { useState, useRef, useEffect } from "react";
import { useHomes } from "../hooks/useHomes";
import { apiService } from "../Services/uploadService";
import { FiTrash2, FiLink } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { companySettingsApi } from "../Services/companySettingsService";

const MessageBanner = ({ type, text, onClose }) => {
  if (!text) return null;
  const isError = type === "error";
  return (
    <div
      className={`mb-4 p-4 text-sm font-medium flex justify-between items-center ${
        isError
          ? "bg-red-50 border-l-4 border-[#da0e19] text-[#da0e19]"
          : "bg-green-50 border-l-4 border-green-600 text-green-700"
      }`}
    >
      <span>{text}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="opacity-70 hover:opacity-100 text-lg leading-none"
        >
          &times;
        </button>
      )}
    </div>
  );
};

const Home = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [sliderImages, setSliderImages] = useState([]);
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState(null);
  const [sliderMessage, setSliderMessage] = useState({ type: "", text: "" });
  const [settingsMessage, setSettingsMessage] = useState({
    type: "",
    text: "",
  });

  // Settings State
  const [companySettings, setCompanySettings] = useState({
    contact_email: "",
    instagram_link: "",
    facebook_link: "",
    linkedin_link: "",
    youtube_link: "",
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // SMTP Settings State
  const [smtpSettings, setSmtpSettings] = useState({
    email_host_user: "",
    email_host_password: "",
  });
  const [isEditingSmtp, setIsEditingSmtp] = useState(false);
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [smtpMessage, setSmtpMessage] = useState({ type: "", text: "" });

  const fileInputRef = useRef(null);
  const { executeUpload, isUploading, progress, error, resetState } =
    useHomes();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const data = await apiService.getSliderImages();
        setSliderImages(data || []);
      } catch (err) {
        console.error("Error loading slider images:", err);
        setSliderMessage({
          type: "error",
          text: "Something went wrong while loading slider images. Please try again.",
        });
      } finally {
        setIsLoadingImages(false);
      }

      try {
        if (typeof companySettingsApi.getCompanySettings !== "function") {
          console.warn(
            "Warning: apiService.getCompanySettings is not defined in your service file.",
          );
          return;
        }

        const settingsData = await companySettingsApi.getCompanySettings();
        if (settingsData) {
          setCompanySettings({
            contact_email: settingsData.contact_email || "",
            instagram_link: settingsData.instagram_link || "",
            facebook_link: settingsData.facebook_link || "",
            linkedin_link: settingsData.linkedin_link || "",
            youtube_link: settingsData.youtube_link || "",
          });
        }
      } catch (err) {
        console.error("Error loading company settings:", err);
        setSettingsMessage({
          type: "error",
          text: "Failed to load company settings.",
        });
      }
      try {
        if (typeof companySettingsApi.getSmtpSettings === "function") {
          const smtpData = await companySettingsApi.getSmtpSettings();
          if (smtpData) {
            setSmtpSettings({
              email_host_user: smtpData.email_host_user || "",
              email_host_password: smtpData.email_host_password || "",
            });
          }
        }
      } catch (err) {
        console.error("Error loading SMTP settings:", err);
        setSmtpMessage({
          type: "error",
          text: "Failed to load SMTP settings.",
        });
      }
    };

    fetchInitialData();
  }, []);

  // --- SLIDER METHODS ---
  const handleFileSelect = (file) => {
    setSliderMessage({ type: "", text: "" });
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setSliderMessage({
        type: "error",
        text: "Please select a valid image file (JPEG, PNG, WebP).",
      });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    resetState();
  };

  const onUploadClick = async () => {
    try {
      await executeUpload(selectedFile, sliderImages, (newUpdatedArray) => {
        setSliderImages(newUpdatedArray);
        setSliderMessage({
          type: "success",
          text: "Image uploaded and added to slider successfully!",
        });
        cancelSelection();
      });
    } catch (err) {}
  };

  const cancelSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    resetState();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const initiateDelete = (index) => {
    setSliderMessage({ type: "", text: "" });
    if (sliderImages.length <= 1) {
      setSliderMessage({
        type: "error",
        text: "Warning: The slider must contain at least one image.",
      });
      return;
    }
    setDeleteConfirmIndex(index);
  };

  const confirmDelete = async () => {
    if (deleteConfirmIndex === null) return;
    setIsDeleting(true);
    try {
      const updatedImages = sliderImages.filter(
        (_, i) => i !== deleteConfirmIndex,
      );
      await apiService.updateSliderInDB(updatedImages);
      setSliderImages(updatedImages);
      setSliderMessage({
        type: "success",
        text: "Image removed from slider successfully.",
      });
    } catch (err) {
      setSliderMessage({
        type: "error",
        text: "Something went wrong while trying to delete this item. Please try again.",
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmIndex(null);
    }
  };

  // --- SETTINGS METHODS ---
  const handleSettingChange = (e) => {
    const { name, value } = e.target;
    setCompanySettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    setSettingsMessage({ type: "", text: "" });
    try {
      await companySettingsApi.updateCompanySettings(companySettings);
      setSettingsMessage({
        type: "success",
        text: "Settings updated successfully!",
      });
    } catch (err) {
      setSettingsMessage({
        type: "error",
        text: "Failed to update settings. Please try again.",
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSmtpChange = (e) => {
    const { name, value } = e.target;
    setSmtpSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSmtp = async () => {
    setIsSavingSmtp(true);
    setSmtpMessage({ type: "", text: "" });
    try {
      await companySettingsApi.updateSmtpSettings(smtpSettings);
      setSmtpMessage({
        type: "success",
        text: "SMTP settings updated successfully!",
      });
      setIsEditingSmtp(false);
    } catch (err) {
      setSmtpMessage({
        type: "error",
        text: "Failed to update SMTP settings. Please try again.",
      });
    } finally {
      setIsSavingSmtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 sm:p-6 lg:p-8 w-full font-sans flex flex-col gap-6 relative">
      {deleteConfirmIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity">
          <div className="bg-white w-full max-w-md shadow-xl flex flex-col">
            <div className="bg-[#1a1a1a] px-6 py-4 flex justify-between items-center">
              <h3 className="text-white font-bold tracking-widest uppercase text-sm">
                Confirm Delete
              </h3>
              <button
                onClick={() => setDeleteConfirmIndex(null)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <div className="p-8 text-center bg-white">
              <p className="text-zinc-700 text-sm font-medium">
                Are you sure you want to remove this image from the slider?
              </p>
            </div>

            <div className="px-6 py-4 flex justify-center gap-4 bg-white border-t border-zinc-100">
              <button
                onClick={() => setDeleteConfirmIndex(null)}
                className="px-6 py-2.5 border border-zinc-300 text-zinc-700 font-bold uppercase tracking-widest text-xs hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#da0e19] hover:bg-red-700 text-white font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-70"
              >
                {isDeleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <FiTrash2 size={14} />
                )}
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SLIDER CONTROLS SECTION --- */}
      <div className="bg-white border border-zinc-200 shadow-sm p-6 flex flex-col gap-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
          <svg
            className="w-6 h-6 text-[#da0e19]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            ></path>
          </svg>
          <h2 className="text-lg font-black text-zinc-900 uppercase tracking-tight">
            Home Page Slider Controls
          </h2>
        </div>

        <MessageBanner
          type={sliderMessage.type}
          text={sliderMessage.text}
          onClose={() => setSliderMessage({ type: "", text: "" })}
        />
        {error && (
          <MessageBanner
            type="error"
            text="Something went wrong while processing your upload request. Please try again."
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest mb-4">
              Add New Picture
            </h3>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (!isUploading) handleFileSelect(e.dataTransfer.files[0]);
              }}
              onClick={() =>
                !selectedFile && !isUploading && fileInputRef.current?.click()
              }
              className={`border-2 border-dashed p-8 text-center transition-all ${
                selectedFile
                  ? "border-red-200 bg-red-50/50"
                  : "border-zinc-300 hover:border-[#da0e19] cursor-pointer bg-zinc-50"
              } ${isUploading ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileSelect(e.target.files[0])}
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
                disabled={isUploading}
              />
              {!selectedFile ? (
                <div className="flex flex-col items-center">
                  <svg
                    className="w-10 h-10 text-[#da0e19] mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm font-bold text-zinc-700 uppercase tracking-widest">
                    Click or drag image here
                  </p>
                  <p className="text-xs text-zinc-400 mt-1 uppercase tracking-widest">
                    JPG, PNG, WEBP
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-48 mx-auto border border-zinc-200 shadow-sm object-contain"
                  />
                </div>
              )}
            </div>

            {isUploading && (
              <div className="mt-4 p-4 border border-zinc-200 bg-zinc-50">
                <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                  <span>Uploading...</span>
                  <span className="text-[#da0e19]">{progress}%</span>
                </div>
                <div className="w-full bg-zinc-200 h-1.5">
                  <div
                    className="bg-[#da0e19] h-1.5 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {selectedFile && (
              <div className="mt-6 flex gap-3 border-t border-zinc-100 pt-6">
                <button
                  onClick={cancelSelection}
                  disabled={isUploading}
                  className="flex-1 px-4 py-3 border border-zinc-300 text-zinc-700 font-bold uppercase tracking-widest text-xs hover:bg-zinc-50 transition-colors disabled:opacity-50"
                >
                  Clear
                </button>
                <button
                  onClick={onUploadClick}
                  disabled={isUploading}
                  className="flex flex-1 items-center justify-center gap-2 px-4 py-3 bg-[#da0e19] hover:bg-red-700 text-white font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : null}
                  {isUploading ? "Uploading..." : "Upload & Save"}
                </button>
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">
                Active Slider
              </h3>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Total: {sliderImages.length}
              </span>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 p-4 min-h-[300px]">
              {isLoadingImages ? (
                <div className="flex items-center justify-center h-full text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Loading Images...
                </div>
              ) : sliderImages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  No images deployed yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {sliderImages.map((imgUrl, index) => (
                    <div
                      key={index}
                      className="relative group border border-zinc-300 bg-white aspect-video overflow-hidden"
                    >
                      <img
                        src={imgUrl}
                        alt={`Slider ${index}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => initiateDelete(index)} // Triggers custom modal
                          className={`p-3 rounded-full flex items-center justify-center transition-colors bg-white text-[#da0e19] hover:bg-[#da0e19] hover:text-white`}
                          title="Delete Image"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- COMPANY SETTINGS SECTION --- */}
      <div className="bg-white border border-zinc-200 shadow-sm p-6 flex flex-col gap-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
          <FiLink className="w-6 h-6 text-[#da0e19]" />
          <h2 className="text-lg font-black text-zinc-900 uppercase tracking-tight">
            Company Settings & Links
          </h2>
        </div>

        <MessageBanner
          type={settingsMessage.type}
          text={settingsMessage.text}
          onClose={() => setSettingsMessage({ type: "", text: "" })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-700 uppercase tracking-widest">
              Contact Email
            </label>
            <input
              type="email"
              name="contact_email"
              value={companySettings.contact_email}
              onChange={handleSettingChange}
              placeholder="admin@yourcompany.com"
              className="w-full border border-zinc-300 px-4 py-3 text-sm focus:outline-none focus:border-[#da0e19] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-700 uppercase tracking-widest">
              Instagram Link
            </label>
            <input
              type="text"
              name="instagram_link"
              value={companySettings.instagram_link}
              onChange={handleSettingChange}
              placeholder="https://instagram.com/..."
              className="w-full border border-zinc-300 px-4 py-3 text-sm focus:outline-none focus:border-[#da0e19] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-700 uppercase tracking-widest">
              Facebook Link
            </label>
            <input
              type="text"
              name="facebook_link"
              value={companySettings.facebook_link}
              onChange={handleSettingChange}
              placeholder="https://facebook.com/..."
              className="w-full border border-zinc-300 px-4 py-3 text-sm focus:outline-none focus:border-[#da0e19] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-700 uppercase tracking-widest">
              LinkedIn Link
            </label>
            <input
              type="text"
              name="linkedin_link"
              value={companySettings.linkedin_link}
              onChange={handleSettingChange}
              placeholder="https://linkedin.com/..."
              className="w-full border border-zinc-300 px-4 py-3 text-sm focus:outline-none focus:border-[#da0e19] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-700 uppercase tracking-widest">
              YouTube Link
            </label>
            <input
              type="text"
              name="youtube_link"
              value={companySettings.youtube_link}
              onChange={handleSettingChange}
              placeholder="https://youtube.com/..."
              className="w-full border border-zinc-300 px-4 py-3 text-sm focus:outline-none focus:border-[#da0e19] transition-colors"
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-zinc-100 pt-6 mt-2">
          <button
            onClick={handleSaveSettings}
            disabled={isSavingSettings}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#da0e19] hover:bg-red-700 text-white font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSavingSettings ? (
              <Loader2 size={16} className="animate-spin" />
            ) : null}
            {isSavingSettings ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
      {/* --- SMTP SETTINGS SECTION --- */}
      <div className="bg-white border border-zinc-200 shadow-sm p-6 flex flex-col gap-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-[#da0e19]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              ></path>
            </svg>
            <h2 className="text-lg font-black text-zinc-900 uppercase tracking-tight">
              System Email (SMTP) Settings
            </h2>
          </div>

          {!isEditingSmtp && (
            <button
              onClick={() => setIsEditingSmtp(true)}
              className="px-4 py-2 border border-zinc-300 text-zinc-700 font-bold uppercase tracking-widest text-xs hover:bg-zinc-50 transition-colors"
            >
              Edit Settings
            </button>
          )}
        </div>

        <MessageBanner
          type={smtpMessage.type}
          text={smtpMessage.text}
          onClose={() => setSmtpMessage({ type: "", text: "" })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-700 uppercase tracking-widest">
              Email Host User
            </label>
            <input
              type="text"
              name="email_host_user"
              value={smtpSettings.email_host_user}
              onChange={handleSmtpChange}
              disabled={!isEditingSmtp}
              placeholder="admin@yourcompany.com"
              className={`w-full border px-4 py-3 text-sm focus:outline-none transition-colors ${
                isEditingSmtp
                  ? "border-zinc-300 focus:border-[#da0e19] bg-white"
                  : "border-transparent bg-zinc-100 text-zinc-500 cursor-not-allowed"
              }`}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-700 uppercase tracking-widest">
              Email App Password
            </label>
            <input
              type="text"
              name="email_host_password"
              value={smtpSettings.email_host_password}
              onChange={handleSmtpChange}
              disabled={!isEditingSmtp}
              placeholder="Your App Password"
              className={`w-full border px-4 py-3 text-sm focus:outline-none transition-colors ${
                isEditingSmtp
                  ? "border-zinc-300 focus:border-[#da0e19] bg-white"
                  : "border-transparent bg-zinc-100 text-zinc-500 cursor-not-allowed"
              }`}
            />
          </div>
        </div>

        {isEditingSmtp && (
          <div className="flex justify-end gap-3 border-t border-zinc-100 pt-6 mt-2">
            <button
              onClick={() => setIsEditingSmtp(false)}
              disabled={isSavingSmtp}
              className="px-6 py-3 border border-zinc-300 text-zinc-700 font-bold uppercase tracking-widest text-xs hover:bg-zinc-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSmtp}
              disabled={isSavingSmtp}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#da0e19] hover:bg-red-700 text-white font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSavingSmtp ? (
                <Loader2 size={16} className="animate-spin" />
              ) : null}
              {isSavingSmtp ? "Saving..." : "Save SMTP"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
