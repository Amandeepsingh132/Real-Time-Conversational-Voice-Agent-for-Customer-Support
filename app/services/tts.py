from openai import OpenAI
from app.core.config import settings

client = OpenAI(
    api_key=settings.GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

async def text_to_speech(text: str, output_path: str):
    """
    Converts text to speech using Groq's Orpheus TTS.
    """
    # Orpheus on Groq supports voices like 'hannah', 'troy', etc.
    # It currently only supports 'wav' response format.
    response = client.audio.speech.create(
        model=settings.TTS_MODEL,
        voice="hannah", 
        input=text,
        response_format="wav"
    )
    response.stream_to_file(output_path)
    return output_path
