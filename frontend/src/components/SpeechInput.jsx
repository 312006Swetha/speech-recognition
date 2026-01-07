import { useState, useRef } from "react";
import { FaPlay } from "react-icons/fa";

/* ✅ Indian Languages List */
const INDIAN_LANGUAGES = [
  { name: "Hindi", code: "hi" },
  { name: "Tamil", code: "ta" },
  { name: "English", code: "en" },
  { name: "Telugu", code: "te" },
  { name: "Kannada", code: "kn" },
  { name: "Malayalam", code: "ml" },
  { name: "Marathi", code: "mr" },
  { name: "Gujarati", code: "gu" },
  { name: "Punjabi", code: "pa" },
  { name: "Bengali", code: "bn" },
  { name: "Odia", code: "or" },
  { name: "Urdu", code: "ur" },
  { name: "Nepali", code: "ne" },
  { name: "Sanskrit", code: "sa" }
];

export default function SpeechInput({
  onAudioReady,
  onTtsReady,
  onTranscriptionAudioReady,
  tab,
  setTab
}) {
  const [processing, setProcessing] = useState(false);
  const [targetLang, setTargetLang] = useState("ta");

  const [audioFile, setAudioFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const [transcription, setTranscription] = useState("");
  const [translation, setTranslation] = useState("");

  /* ================= MICROPHONE STATES ================= */
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  /* ================= MICROPHONE ================= */
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const file = new File([blob], "mic.webm", { type: "audio/webm" });

      setProcessing(true);
      setTranscription("");
      setTranslation("");

      const formData = new FormData();
      formData.append("audio", file);
      formData.append("target_lang", targetLang);

      try {
        const res = await fetch("http://localhost:5000/transcribe", {
          method: "POST",
          body: formData
        });

        const data = await res.json();

        setTranscription(data.transcription || "");
        setTranslation(data.translation || "");

        onTranscriptionAudioReady?.(data.transcription_audio);
        onTtsReady?.(data.tts_audio);
      } catch (err) {
        alert("Microphone processing failed");
        console.error(err);
      }

      setProcessing(false);
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  /* ================= AUDIO FILE ================= */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAudioFile(file);
    const localUrl = URL.createObjectURL(file);
    onAudioReady?.(localUrl);
  };

  const handleTranslate = async () => {
    if (!audioFile) {
      alert("Please upload an audio file");
      return;
    }

    setProcessing(true);
    setTranscription("");
    setTranslation("");

    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("target_lang", targetLang);

    try {
      const res = await fetch("http://127.0.0.1:5000/transcribe", {
        method: "POST",
        body: formData
      });
      const data = await res.json();

      setTranscription(data.transcription || "");
      setTranslation(data.translation || "");

      onTranscriptionAudioReady?.(data.transcription_audio);
      onTtsReady?.(data.tts_audio);
    } catch (err) {
      alert("Backend connection failed");
      console.error(err);
    }

    setProcessing(false);
  };

  /* ================= VIDEO FILE ================= */
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setVideoFile(file);
    const localUrl = URL.createObjectURL(file);
    onAudioReady?.(localUrl);
  };

  const handleVideoTranslate = async () => {
    if (!videoFile) {
      alert("Please upload a video file");
      return;
    }

    setProcessing(true);
    setTranscription("");
    setTranslation("");

    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("target_lang", targetLang);

    try {
      const res = await fetch("http://127.0.0.1:5000/video", {
        method: "POST",
        body: formData
      });
      const data = await res.json();

      setTranscription(data.transcription || "");
      setTranslation(data.translation || "");

      onTranscriptionAudioReady?.(data.transcription_audio);
      onTtsReady?.(data.tts_audio);
    } catch (err) {
      alert("Video processing failed");
      console.error(err);
    }

    setProcessing(false);
  };

  /* ================= YOUTUBE ================= */
  const handleYoutubeTranslate = async () => {
    if (!youtubeUrl.trim()) {
      alert("Please enter YouTube URL");
      return;
    }

    setProcessing(true);
    setTranscription("");
    setTranslation("");

    try {
      const res = await fetch("http://127.0.0.1:5000/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: youtubeUrl,
          target_lang: targetLang
        })
      });
      const data = await res.json();

      setTranscription(data.transcription || "");
      setTranslation(data.translation || "");

      onTranscriptionAudioReady?.(data.transcription_audio);
      onTtsReady?.(data.tts_audio);
    } catch (err) {
      alert("YouTube processing failed");
      console.error(err);
    }

    setProcessing(false);
  };

  return (
    <div className="card">
      <h3>AI-Powered Speech Translator</h3>

      {/* ================= TABS ================= */}
      <div className="tab-bar">
        {["Microphone", "Audio File", "Video File", "YouTube"].map((t) => {
          const key = t.toLowerCase().replace(" ", "");
          return (
            <div
              key={t}
              className={`tab ${tab === key ? "active" : ""}`}
              onClick={() => setTab(key)}
            >
              {t}
            </div>
          );
        })}
      </div>

      {/* ================= MICROPHONE ================= */}
      {tab === "microphone" && (
        <div style={{ marginTop: "20px" }}>
          {!recording ? (
            <button onClick={startRecording}>🎤 Start Recording</button>
          ) : (
            <button onClick={stopRecording}>⏹ Stop Recording</button>
          )}
        </div>
      )}

      {/* ================= AUDIO FILE ================= */}
      {tab === "audiofile" && (
        <div className="file-box" style={{ marginTop: "20px" }}>
          <p><b>Upload Audio:</b></p>
          <input type="file" accept="audio/*" onChange={handleFileChange} />
        </div>
      )}

      {/* ================= VIDEO FILE ================= */}
      {tab === "videofile" && (
        <div className="file-box" style={{ marginTop: "20px" }}>
          <p><b>Upload Video:</b></p>
          <input type="file" accept="video/*" onChange={handleVideoChange} />
        </div>
      )}

      {/* ================= YOUTUBE ================= */}
      {tab === "youtube" && (
        <div className="file-box" style={{ marginTop: "20px" }}>
          <p><b>YouTube URL:</b></p>
          <input
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            style={{ width: "100%" }}
          />
        </div>
      )}

      {/* ================= LANGUAGE ================= */}
      <div className="lang-row">
        <div className="lang-box">
          <p>Source Language</p>
          <select disabled>
            <option>Auto-detect</option>
          </select>
        </div>

        <div className="lang-box">
          <p>Target Language</p>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
          >
            {INDIAN_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= BUTTON ================= */}
      <button
        className="translate-btn"
        onClick={
          tab === "youtube"
            ? handleYoutubeTranslate
            : tab === "videofile"
            ? handleVideoTranslate
            : tab === "microphone"
            ? recording
              ? stopRecording
              : startRecording
            : handleTranslate
        }
        disabled={processing}
      >
        <FaPlay style={{ marginRight: "8px" }} />
        Translate Speech
      </button>

      {processing && <p>Processing...</p>}

      {!processing && transcription && (
        <div className="output-box">
          <h4>Transcription</h4>
          <p>{transcription}</p>

          <h4>Translation</h4>
          <p>{translation}</p>
        </div>
      )}
    </div>
  );
}