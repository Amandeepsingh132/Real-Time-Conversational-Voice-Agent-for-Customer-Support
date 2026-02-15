import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    STT_MODEL = "whisper-large-v3"
    TTS_MODEL = "canopylabs/orpheus-v1-english"
    LLM_MODEL = "llama-3.3-70b-versatile"
    
settings = Settings()
