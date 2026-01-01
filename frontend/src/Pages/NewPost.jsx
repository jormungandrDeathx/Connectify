import React, { useEffect, useRef, useState } from "react";
import Footer from "../Components/Footer";
import axios from "axios";
import AlertBox from "../Components/AlertBox";

function NewPost() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [alert, setAlert] = useState(null);

  const inputRef = useRef();

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ["image/png", "image/jpg", "image/jpeg"];
  const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg"];

  function validateFile(file) {
    if (!file) {
      setError("No file selected");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(
        `File size must be less than 5MB. Your file is ${(
          file.size /
          (1024 * 1024)
        ).toFixed(2)}MB`
      );
      return false;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only PNG and JPG/JPEG images are allowed");
      return false;
    }

    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExtension) {
      setError("File must have .png, .jpg, or .jpeg extension");
      return false;
    }

    return true;
  }

  function handleFileSelection(selectedFile) {
    setError(null);

    if (!selectedFile) return;

    if (validateFile(selectedFile)) {
      setFile(selectedFile);

      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  }

  function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    handleFileSelection(droppedFile);
  }

  function handleFileInput(e) {
    const selectedFile = e.target.files?.[0];
    handleFileSelection(selectedFile);
  }

  function handleRemoveFile() {
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    // const token = localStorage.getItem("connectify_token");

    if (!content.trim()) {
      setError("Please enter some content");
      return;
    }

    if (content.length > 250) {
      setError("Maximum 250 characters!");
      return;
    }

    if (!file) {
      setError("Please select an image");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();

    try {
      formData.append("message", content);

      formData.append("postImage", file);
      formData.append("createdAt", new Date().toISOString());
      const response = await axios.post("createPost/", formData);

      if (response.data) setAlert("Post created successfully!");

      setContent("");
      setFile(null);
      setPreviewUrl(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (err) {
      console.error("Error creating post:", err);
      setError(
        err.response?.data?.message ||
          "Failed to create post. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel(e) {
    e.preventDefault();
    setContent("");
    handleRemoveFile();
  }

  function alertFalse() {
    setAlert(null);
  }

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-b from-pink-700 via-blue-700 to-blue-900">
      {alert && <AlertBox message={alert} onClose={alertFalse} />}
      <div className="flex justify-center mt-24 pb-15">
        <div className="flex flex-col min-h-screen rounded-2xl bg-[#F5F5F5] w-full max-w-4xl mx-5 p-7">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl text-gray-800 font-semibold">
              Create New Post
            </h1>
            <p className="text-sm text-gray-500 pl-0.5">
              Share Your thoughts and moments with the World
            </p>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="my-4">
              <div className="space-y-8 pt-4">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm">
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}

                <div className="relative flex flex-col gap-2 w-full">
                  <label className="font-semibold text-gray-800">
                    Post Content
                  </label>
                  <textarea
                    value={content}
                    maxLength={251}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="text-gray-500 border-2 border-gray-300 rounded-lg py-2 px-2 focus:border-[#21808D] focus:ring-2 focus:ring-[#E8F2F3] transition-all duration-300 outline-0 h-[250px] resize-none focus:text-gray-800"
                    disabled={isSubmitting}
                  />
                  <span className="absolute top-full right-1 text-xs sm:text-sm text-gray-600">
                    {content && `${content.length}/250`}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-800">
                    Upload Photo
                  </label>

                  <div
                    className={`flex flex-col justify-center items-center gap-2  border-2 border-dashed rounded-lg ${
                      isDragging
                        ? "border-[#21808D] bg-blue-50"
                        : "border-gray-400 hover:bg-gray-200"
                    } transition duration-300 cursor-pointer p-8`}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDrop={handleDrop}
                    onDragLeave={handleDragLeave}
                    onClick={() => !file && inputRef.current.click()}
                  >
                    {!file ? (
                      <>
                        <div className="text-6xl">📸</div>
                        <div className="text-center">
                          <p className="text-[#21808D] font-semibold">
                            Drag and drop{" "}
                            <span className="text-gray-400">
                              or click to choose
                            </span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG or JPG up to{" "}
                            <span className="font-medium">5MB max</span>
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-4 w-full">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-64 max-w-full rounded-lg object-contain"
                        />

                        <div className="text-center">
                          <p className="font-semibold text-gray-700">
                            {file.name}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile();
                          }}
                          className="text-white font-medium rounded bg-red-600 hover:bg-red-700 p-2"
                        >
                          Remove Image
                        </button>
                      </div>
                    )}

                    <input
                      type="file"
                      ref={inputRef}
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                      onChange={handleFileInput}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="text-xl flex justify-between gap-10 mt-10">
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                      className="border p-2 w-full rounded-md border-gray-400 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="border p-2 w-full rounded-md bg-[#21808D] text-white hover:bg-[#1a6570] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Posting..." : "Post"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default NewPost;
