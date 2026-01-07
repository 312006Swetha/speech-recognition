🌐 AI Real-Time Speech Translator

An AI Real-Time Speech Translator is an intelligent system that listens to spoken language, automatically converts speech into text, translates it into multiple target languages, and generates spoken output in real time. It leverages advanced speech recognition, natural language processing, and text-to-speech technologies to enable seamless multilingual communication across digital platforms such as OTT media, live broadcasts, and streaming applications.

🧩 Problem Statement

The rapid expansion of OTT platforms and live digital streaming has increased the demand for multilingual content. However, live commentary and spoken media are often available in only one or two languages, limiting accessibility for diverse audiences. Existing translation solutions lack real-time performance, seamless integration with OTT feeds, or high-quality speech output. Therefore, there is a need to develop an AI-based real-time speech-to-speech translation system that can accurately translate live English and Hindi commentary into more than 12 languages, integrate smoothly into OTT digital feeds, and enhance accessibility and user experience for a global, multilingual audience. 

💡 Proposed Solution

The proposed system is an AI-based multilingual speech translation platform that accepts audio files, video files, or YouTube links as input. The system extracts audio, converts speech into text using a deep learning model, translates the text into a user-selected target language, and generates natural-sounding speech output. To handle long audio efficiently, the system splits the audio into smaller chunks. This solution improves accessibility, supports multiple Indian and global languages, and provides both text and audio outputs for enhanced user experience.

🛠️ Technology Stack
Backend

Flask – REST API development

Python – Core programming language

AI & Machine Learning

OpenAI Whisper – Speech-to-text (ASR)

PyTorch – Deep learning framework

Audio & Video Processing

Librosa – Audio loading and chunking

FFmpeg – Audio extraction and format conversion

yt-dlp – YouTube audio download

Translation & Speech

GoogleTrans – Text translation

gTTS (Google Text-to-Speech) – Speech synthesis

Deployment Support

CUDA (Optional) – GPU acceleration

⚙️ Installation and Setup
Step 1: Clone the Repository
git clone <repository-url>
cd multilingual-speech-translation

Step 2: Create Virtual Environment (Recommended)
python -m venv venv
source venv/bin/activate    # Linux / Mac
venv\Scripts\activate       # Windows

Step 3: Install Dependencies
pip install -r requirements.txt

Step 4: Install FFmpeg

Download FFmpeg from: https://ffmpeg.org/download.html

Add FFmpeg to system PATH

Verify installation:

ffmpeg -version

Step 5: Download Whisper Model

Place the Whisper model files inside:

./whisper/whisper_hi_en

Step 6: Run the Application
python app.py


The server will start at:

http://localhost:5000
