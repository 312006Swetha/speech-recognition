import AudioWaveform from "./AudioWaveform";

export default function TranslatedAudio({ audioUrl }) {
  if (!audioUrl) return null;

  return (
    <AudioWaveform
      audioUrl={audioUrl}
      title="Live Translated Audio"
    />
  );
}
