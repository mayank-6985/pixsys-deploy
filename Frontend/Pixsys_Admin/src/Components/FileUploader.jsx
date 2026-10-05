import React, { useRef, useState } from "react";
import { useFileUpload } from "../hooks/useFileUpload";
import {
  FiUploadCloud,
  FiFile,
  FiX,
  FiCheckCircle,
  FiFileText,
  FiCommand,
} from "react-icons/fi";

const FileUploader = ({
  label = "Upload File",
  accept = "*",
  onUploadSuccess,
  currentFileUrl = null,
  folder = "general",
}) => {
  const fileInputRef = useRef(null);
  const { uploadFile, isUploading, progress, error } = useFileUpload(folder);
  const [localPreview, setLocalPreview] = useState(currentFileUrl);

  const handleFileChange = async (e) => {
    let file = e.target.files[0];
    if (!file) return;

    if (!file.type) {
      const ext = file.name.split(".").pop().toLowerCase();
      const fallbackMimeTypes = {
        stp: "application/step",
        dxf: "image/vnd.dxf",
        dwg: "image/vnd.dwg",
        rar: "application/vnd.rar",
        zip: "application/zip",
        xml: "application/xml",
        eds: "application/octet-stream",
      };

      const determinedType =
        fallbackMimeTypes[ext] || "application/octet-stream";

      file = new File([file], file.name, { type: determinedType });
    }

    try {
      const finalUrl = await uploadFile(file);
      setLocalPreview(finalUrl);
      if (onUploadSuccess) onUploadSuccess(finalUrl);
    } catch (err) {
      console.error(err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isImage =
    localPreview && localPreview.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i);
  const isPdf = localPreview && localPreview.match(/\.pdf(\?.*)?$/i);
  const isExe = localPreview && localPreview.match(/\.(exe|msi|bat)(\?.*)?$/i);
  const isZip = localPreview && localPreview.match(/\.(zip|rar|7z)(\?.*)?$/i);

  return (
    <div className="w-full">
      <label className="block text-xs font-bold text-zinc-900 uppercase tracking-widest mb-2">
        {label}
      </label>

      {!localPreview && !isUploading && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-zinc-300 hover:border-[#da0e19] bg-zinc-50 hover:bg-red-50/30 transition-all cursor-pointer rounded-lg p-6 flex flex-col items-center justify-center text-center group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
            className="hidden"
          />
          <FiUploadCloud className="w-8 h-8 text-zinc-400 group-hover:text-[#da0e19] mb-2 transition-colors" />
          <p className="text-sm font-bold text-zinc-700">
            Click to browse files
          </p>
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">
            Accepts: {accept === "*" ? "All Files" : accept}
          </p>
        </div>
      )}

      {isUploading && (
        <div className="p-4 border border-zinc-200 bg-zinc-50 rounded-lg">
          <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
            <span>Uploading ...</span>
            <span className="text-[#da0e19]">{progress}%</span>
          </div>
          <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#da0e19] h-1.5 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {localPreview && !isUploading && (
        <div className="relative border border-zinc-200 rounded-lg p-2 bg-white flex items-center gap-4 group">
          {isImage ? (
            <img
              src={localPreview}
              alt="Preview"
              className="w-16 h-16 object-cover rounded shadow-sm border border-zinc-100"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "";
                e.target.alt = "Image unavailable";
                e.target.className = "w-16 h-16 bg-zinc-100 rounded border border-zinc-200 flex items-center justify-center";
              }}
            />
          ) : isPdf ? (
            <div className="w-16 h-16 bg-red-50 text-[#da0e19] flex items-center justify-center rounded border border-red-100">
              <FiFileText className="w-8 h-8" />
            </div>
          ) : isExe || isZip ? (
            <div className="w-16 h-16 bg-zinc-800 text-white flex items-center justify-center rounded border border-zinc-900">
              <FiCommand className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-zinc-100 flex items-center justify-center rounded border border-zinc-200">
              <FiFile className="w-8 h-8 text-zinc-500" />
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold uppercase tracking-widest mb-1">
              <FiCheckCircle /> Uploaded Successfully
            </div>
            <a
              href={localPreview}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-zinc-700 hover:text-[#da0e19] truncate block transition-colors font-mono"
            >
              {localPreview.split("/").pop().split("?")[0]}
            </a>
          </div>

          <button
            type="button"
            onClick={() => {
              setLocalPreview(null);
              if (onUploadSuccess) onUploadSuccess("");
            }}
            className="p-2 text-zinc-400 hover:text-[#da0e19] hover:bg-red-50 rounded transition-colors mr-2"
            title="Remove File"
          >
            <FiX size={18} />
          </button>
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs font-bold text-[#da0e19] uppercase tracking-widest">
          {error}
        </p>
      )}
    </div>
  );
};

export default FileUploader;
