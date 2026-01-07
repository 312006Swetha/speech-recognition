import { useState } from "react";
import "./styles.css";
import "./App.css";

import Header from "./components/Header";
import SpeechInput from "./components/SpeechInput";
import AudioWaveform from "./components/AudioWaveform";
import TranslatedAudio from "./components/TranslatedAudio";

function App() {
  const [tab, setTab] = useState("audiofile");

  // 🔊 Live Audio Stream (TRANSCRIPTION speech)
  const [liveAudio, setLiveAudio] = useState(null);

  // 🔊 Live Translated Audio
  const [translatedAudio, setTranslatedAudio] = useState(null);

  return (
    <div style={{ padding: "30px" }}>
      <Header />

      <SpeechInput
        tab={tab}
        setTab={setTab}

        // ❌ DO NOT USE uploaded audio for live stream
        onAudioReady={() => {}} 

        // ✅ USE transcription TTS for live stream
        onTranscriptionAudioReady={setLiveAudio}

        // ✅ translated audio
        onTtsReady={setTranslatedAudio}
      />

      {/* 🔊 LIVE AUDIO STREAM → TRANSCRIPTION SPEECH */}
      {tab === "audiofile" && liveAudio && (
        <AudioWaveform audioUrl={liveAudio} />
      )}

      {/* 🔊 LIVE TRANSLATED AUDIO */}
      {translatedAudio && (
        <TranslatedAudio audioUrl={translatedAudio} />
      )}
    </div>
  );
}

export default App;
