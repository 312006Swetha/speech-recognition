from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import librosa
import torch
import subprocess
from transformers import WhisperProcessor, WhisperForConditionalGeneration
from googletrans import Translator
from gtts import gTTS
import uuid
import yt_dlp

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
TTS_FOLDER = "tts_audio"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TTS_FOLDER, exist_ok=True)

MODEL_PATH = "./whisper/whisper_hi_en"

# ===============================
# LOAD WHISPER MODEL
# ===============================
processor = WhisperProcessor.from_pretrained(MODEL_PATH)
model = WhisperForConditionalGeneration.from_pretrained(MODEL_PATH)

device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

translator = Translator()

# ===============================
# LANGUAGE DETECTION
# ===============================
def detect_tts_language(text):
    try:
        lang = translator.detect(text).lang
        return lang if lang in ["en","hi","ta","te","kn","ml","mr","gu","bn","ur","ne","pa"] else "en"
    except:
        return "en"

def split_audio(audio, sr, sec=30):
    size = sec * sr
    return [audio[i:i+size] for i in range(0, len(audio), size)]


# ===============================
# YOUTUBE AUDIO DOWNLOAD
# ===============================
def download_youtube_audio(url):
    output_path = os.path.join(UPLOAD_FOLDER, "%(id)s.%(ext)s")

    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": output_path,
        "postprocessors": [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
            "preferredquality": "192"
        }],
        "quiet": True
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        audio_file = os.path.join(UPLOAD_FOLDER, f"{info['id']}.mp3")

    return audio_file

# ===============================
# VIDEO → AUDIO EXTRACT

def extract_audio_from_video(video_path):
    audio_path = video_path.rsplit(".", 1)[0] + ".wav"

    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-ar", "16000",
        "-ac", "1",
        audio_path
    ]

    result = subprocess.run(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    if result.returncode != 0:
        raise Exception(f"FFmpeg failed: {result.stderr}")

    return audio_path

# ===============================
# AUDIO FILE ROUTE
# ===============================
# ===============================
@app.route("/transcribe", methods=["POST"])
def transcribe():
    audio_file = request.files["audio"]
    target_lang = request.form.get("target_lang", "en")

    uid = str(uuid.uuid4())
    webm_path = os.path.join(UPLOAD_FOLDER, f"{uid}.webm")
    wav_path = os.path.join(UPLOAD_FOLDER, f"{uid}.wav")

    audio_file.save(webm_path)

    # convert webm → wav
    subprocess.run(
        ["ffmpeg", "-y", "-i", webm_path, "-ar", "16000", "-ac", "1", wav_path],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    audio, _ = librosa.load(wav_path, sr=16000)
    chunks = split_audio(audio, 16000)

    texts = []
    for chunk in chunks:
        inputs = processor(chunk, sampling_rate=16000, return_tensors="pt")
        with torch.no_grad():
            ids = model.generate(inputs.input_features.to(device))
        texts.append(processor.decode(ids[0], skip_special_tokens=True))

    transcription = " ".join(texts)
    translation = translator.translate(transcription, dest=target_lang).text

    lang = detect_tts_language(transcription)
    t1 = f"trans_{uid}.mp3"
    t2 = f"tts_{uid}.mp3"

    gTTS(transcription, lang=lang).save(os.path.join(TTS_FOLDER, t1))
    gTTS(translation, lang=target_lang).save(os.path.join(TTS_FOLDER, t2))

    return jsonify({
        "transcription": transcription,
        "translation": translation,
        "transcription_audio": f"http://localhost:5000/tts/{t1}",
        "tts_audio": f"http://localhost:5000/tts/{t2}"
    })



# ===============================
# YOUTUBE ROUTE
# ===============================
@app.route("/youtube", methods=["POST"])
def youtube_translate():
    try:
        data = request.json
        url = data.get("url")
        target_lang = data.get("target_lang", "en")

        audio_path = download_youtube_audio(url)
        audio, _ = librosa.load(audio_path, sr=16000)

        chunks = split_audio(audio, 16000)
        text_all = []

        for chunk in chunks:
            inputs = processor(chunk, sampling_rate=16000, return_tensors="pt")
            with torch.no_grad():
                ids = model.generate(inputs.input_features.to(device))
            text_all.append(processor.decode(ids[0], skip_special_tokens=True))

        transcription = " ".join(text_all)
        translation = translator.translate(transcription, dest=target_lang).text

        lang = detect_tts_language(transcription)
        t1 = f"yt_trans_{uuid.uuid4()}.mp3"
        t2 = f"yt_tts_{uuid.uuid4()}.mp3"

        gTTS(transcription, lang=lang).save(os.path.join(TTS_FOLDER, t1))
        gTTS(translation, lang=target_lang).save(os.path.join(TTS_FOLDER, t2))

        return jsonify({
            "transcription": transcription,
            "translation": translation,
            "transcription_audio": f"http://127.0.0.1:5000/tts/{t1}",
            "tts_audio": f"http://127.0.0.1:5000/tts/{t2}"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===============================
# VIDEO FILE ROUTE
# ===============================
@app.route("/video", methods=["POST"])
def video_translate():
    try:
        video = request.files["video"]
        target_lang = request.form.get("target_lang", "en")

        video_path = os.path.join(UPLOAD_FOLDER, video.filename)
        video.save(video_path)

        audio_path = extract_audio_from_video(video_path)
        audio, _ = librosa.load(audio_path, sr=16000)

        chunks = split_audio(audio, 16000)
        text_all = []

        for chunk in chunks:
            inputs = processor(chunk, sampling_rate=16000, return_tensors="pt")
            with torch.no_grad():
                ids = model.generate(inputs.input_features.to(device))
            text_all.append(processor.decode(ids[0], skip_special_tokens=True))

        transcription = " ".join(text_all)
        translation = translator.translate(transcription, dest=target_lang).text

        lang = detect_tts_language(transcription)
        t1 = f"video_trans_{uuid.uuid4()}.mp3"
        t2 = f"video_tts_{uuid.uuid4()}.mp3"

        gTTS(transcription, lang=lang).save(os.path.join(TTS_FOLDER, t1))
        gTTS(translation, lang=target_lang).save(os.path.join(TTS_FOLDER, t2))

        return jsonify({
            "transcription": transcription,
            "translation": translation,
            "transcription_audio": f"http://127.0.0.1:5000/tts/{t1}",
            "tts_audio": f"http://127.0.0.1:5000/tts/{t2}"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===============================
# SERVE AUDIO
# ===============================
@app.route("/tts/<filename>")
def serve_tts(filename):
    return send_file(os.path.join(TTS_FOLDER, filename), mimetype="audio/mpeg")

# ===============================
# RUN SERVER
# ===============================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)