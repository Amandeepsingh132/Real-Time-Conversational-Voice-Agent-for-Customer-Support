# Real-Time Conversational Voice Agent

This project is a real-time AI voice agent for customer support.

## Project Structure
- `backend/`: FastAPI server handling STT, RAG, and TTS.
- `frontend/`: React + Vite application for the user interface.

## Tech Stack
- **Backend**: Python, FastAPI, LangChain, Groq (Whisper-large-v3, Orpheus-v1-english, Llama-3).
- **Frontend**: React, TypeScript, Vite, Framer Motion, Lucide icons.

## Setup

### Backend
1. Create a virtual environment: `python -m venv venv`
2. Activate it: `venv\Scripts\activate` (Windows)
3. Install dependencies: `pip install -r backend/requirements.txt`
4. Ensure your `backend/.env` has a valid `GROQ_API_KEY`.
5. Run the server: `python -m backend.app.main` (from the root or `cd backend && python -m app.main`)

### Frontend
1. Navigate to the folder: `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

## Usage
1. Click the "Start Call" icon to connect to the WebSocket server.
2. The **Agent** will greet you in the transcript.
3. **Hold to Speak**: Press and hold the blue microphone button to speak.
4. **Real-time Feedback**: You will see your transcription appear in the chat bubble, followed by the agent's response.
5. **Auto-Play**: The agent's voice response will play automatically.
6. **Waveform**: The visualizer shows activity when you speak or the agent responds.
