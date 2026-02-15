from openai import OpenAI
from app.core.config import settings

client = OpenAI(
    api_key=settings.GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

async def transcribe_audio(audio_file_path: str) -> str:
    """
    Transcribes audio using Groq's Whisper-large-v3.
    """
    with open(audio_file_path, "rb") as audio_file:
        transcription = client.audio.transcriptions.create(
            file=audio_file,
            model=settings.STT_MODEL,
            response_format="text"
        )
    return transcription
