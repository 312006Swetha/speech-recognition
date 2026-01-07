import { FaPlay, FaPause } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";

export default function AudioWaveform({ audioUrl, title = "Live Audio Stream" }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const [bars, setBars] = useState(
    Array.from({ length: 48 }, () => Math.random() * 60 + 20)
  );

  // 🔊 Animate ONLY while audio is playing
  useEffect(() => {
    if (!playing) return;

    const interval = setInterval(() => {
      setBars(
        Array.from({ length: 48 }, () =>
          Math.floor(Math.random() * 80) + 10
        )
      );
    }, 100);

    return () => clearInterval(interval);
  }, [playing]);

  // 🔥 STOP waveform when audio ends
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setPlaying(false);   // ⛔ STOP waveform
    };

    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const playAudio = async () => {
    if (!audioRef.current) return;

    try {
      await audioRef.current.play();
      setPlaying(true);
    } catch (err) {
      console.error("Play failed:", err);
    }
  };

  const pauseAudio = () => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    setPlaying(false);
  };

  if (!audioUrl) return null;

  return (
    <div className="card">
      <h3>{title}</h3>

      {/* 🔊 AUDIO ELEMENT */}
      <audio ref={audioRef} src={audioUrl} preload="auto" />

      {/* 🔊 WAVEFORM */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          justifyContent: "center",
          alignItems: "center",
          height: "90px",
          marginTop: "20px"
        }}
      >
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              width: "8px",
              height: `${h}px`,
              background: "#3b82f6",
              borderRadius: "6px",
              transition: "height 0.1s ease"
            }}
          />
        ))}
      </div>

      {/* CONTROLS */}
      <div
        style={{
          marginTop: "25px",
          display: "flex",
          gap: "15px",
          justifyContent: "center"
        }}
      >
        <button onClick={playAudio}>
          <FaPlay />
        </button>

        <button onClick={pauseAudio}>
          <FaPause />
        </button>
      </div>
    </div>
  );
}
