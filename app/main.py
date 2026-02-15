import os
import uuid
import wave
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.services.stt import transcribe_audio
from app.services.tts import text_to_speech
from app.services.rag import get_rag_response

app = FastAPI(title="Voice Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = "temp_audio"
os.makedirs(TEMP_DIR, exist_ok=True)

@app.websocket("/ws/voice")
async def voice_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected")
    
    try:
        while True:
            # Receive audio data from client
            audio_data = await websocket.receive_bytes()
            
            if not audio_data:
                continue

            # Save audio to temporary file
            session_id = str(uuid.uuid4())
            # We use .webm as a generic container that Whisper understands well from browsers
            input_file = os.path.join(TEMP_DIR, f"input_{session_id}.webm")
            
            with open(input_file, "wb") as f:
                f.write(audio_data)
            
            # 1. STT: Transcribe audio
            try:
                text_query = await transcribe_audio(input_file)
                if not text_query or len(text_query.strip()) < 2:
                    continue
                    
                print(f"User said: {text_query}")
                # Send user transcript back
                await websocket.send_json({"type": "transcript", "role": "user", "text": text_query})
                
                # 2. RAG: Get response from LLM
                response_text = await get_rag_response(text_query)
                print(f"Agent response: {response_text}")
                # Send agent transcript back
                await websocket.send_json({"type": "transcript", "role": "agent", "text": response_text})
                
                # 3. TTS: Convert response to speech
                output_file = os.path.join(TEMP_DIR, f"output_{session_id}.wav")
                await text_to_speech(response_text, output_file)
                
                # 4. Send audio bytes back to client
                with open(output_file, "rb") as f:
                    # We send a marker before audio
                    await websocket.send_json({"type": "audio_start"})
                    await websocket.send_bytes(f.read())
                    
                # Cleanup temp files
                if os.path.exists(input_file): os.remove(input_file)
                if os.path.exists(output_file): os.remove(output_file)
            except Exception as e:
                print(f"Processing error: {e}")
                await websocket.send_json({"type": "error", "message": str(e)})
            
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"Socket error: {e}")
        try:
            await websocket.close()
        except:
            pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
