import { useState, useEffect, useRef, useCallback } from 'react';

interface Message {
    role: 'user' | 'agent';
    text: string;
}

// ---------- inline SVG icons ----------
const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
);

const MicOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="2" x2="22" y1="2" y2="22" />
        <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
        <path d="M5 10v2a7 7 0 0 0 12 5.19" />
        <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
        <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
        <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
);

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

const PhoneOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67" />
        <path d="M14.118 5.882A19.2 19.2 0 0 0 4.18 2 2 2 0 0 0 2 4.11v3a2 2 0 0 0 1.72 2c.96.127 1.903.361 2.81.7a2 2 0 0 0 2.11-.45l1.27-1.27" />
        <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
);

const BotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" />
        <path d="M2 14h2" /><path d="M20 14h2" />
        <path d="M15 13v2" /><path d="M9 13v2" />
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const SpinnerIcon = () => (
    <svg className="spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

const HeadphonesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    </svg>
);

// ---------- component ----------
const VoiceAgent = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [status, setStatus] = useState<string>('Disconnected');
    const [messages, setMessages] = useState<Message[]>([]);
    const [waveBars, setWaveBars] = useState<number[]>(Array(24).fill(4));

    const ws = useRef<WebSocket | null>(null);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    // auto-scroll transcript
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // waveform animation
    useEffect(() => {
        if (isListening || status === 'Speaking...') {
            const id = setInterval(() => {
                setWaveBars(Array(24).fill(0).map(() => Math.random() * 48 + 4));
            }, 80);
            return () => clearInterval(id);
        }
        setWaveBars(Array(24).fill(4));
    }, [isListening, status]);

    // ── WebSocket ──
    const connect = useCallback(() => {
        setStatus('Connecting...');
        const socket = new WebSocket('ws://localhost:8000/ws/voice');
        ws.current = socket;

        socket.onopen = () => {
            setIsConnected(true);
            setStatus('Active');
            setMessages(prev => [...prev, { role: 'agent', text: 'Connected! Hold the mic button to speak, release to send.' }]);
        };

        socket.onmessage = async (event) => {
            if (typeof event.data === 'string') {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'transcript') {
                        setMessages(prev => [...prev, { role: data.role, text: data.text }]);
                    } else if (data.type === 'error') {
                        setMessages(prev => [...prev, { role: 'agent', text: `⚠ ${data.message}` }]);
                        setStatus('Active');
                    } else if (data.type === 'audio_start') {
                        setStatus('Speaking...');
                    }
                } catch { /* ignore */ }
            } else {
                // binary audio
                try {
                    const blob = new Blob([event.data], { type: 'audio/wav' });
                    const url = URL.createObjectURL(blob);
                    const audio = new Audio(url);
                    audio.onended = () => {
                        setStatus('Active');
                        URL.revokeObjectURL(url);
                    };
                    await audio.play();
                } catch (e) {
                    console.error('Audio playback error:', e);
                    setStatus('Active');
                }
            }
        };

        socket.onclose = () => {
            setIsConnected(false);
            setStatus('Disconnected');
        };

        socket.onerror = () => setStatus('Error');
    }, []);

    const disconnect = useCallback(() => {
        ws.current?.close();
    }, []);

    // ── Recording ──
    const startRecording = useCallback(async () => {
        if (!isConnected || isListening) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/ogg;codecs=opus';

            const recorder = new MediaRecorder(stream, { mimeType });
            mediaRecorder.current = recorder;
            audioChunks.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunks.current.push(e.data);
            };

            recorder.onstop = async () => {
                if (audioChunks.current.length > 0 && ws.current?.readyState === WebSocket.OPEN) {
                    const blob = new Blob(audioChunks.current, { type: mimeType });
                    setStatus('Processing...');
                    ws.current.send(await blob.arrayBuffer());
                }
                // stop mic stream
                streamRef.current?.getTracks().forEach(t => t.stop());
                streamRef.current = null;
            };

            recorder.start();
            setIsListening(true);
            setStatus('Listening...');
        } catch (err) {
            console.error('Mic error:', err);
            setStatus('Mic Error');
        }
    }, [isConnected, isListening]);

    const stopRecording = useCallback(() => {
        if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
            mediaRecorder.current.stop();
            setIsListening(false);
        }
    }, []);

    // ── Derived State ──
    const statusClass = isListening ? 'listening'
        : status === 'Processing...' ? 'processing'
            : status === 'Speaking...' ? 'speaking'
                : isConnected ? 'online' : 'offline';

    const orbClass = `mic-orb${isConnected ? ' active' : ''}${isListening ? ' listening' : ''}${status === 'Processing...' ? ' processing' : ''}`;

    return (
        <div className="app-layout">
            {/* ─── Left: Controls ─── */}
            <div className="glass-card control-panel">
                <div className="panel-header">
                    <span className="panel-title">Live Agent</span>
                    <div className="status-badge">
                        <span className={`status-dot ${statusClass}`} />
                        <span className="status-label">{status}</span>
                    </div>
                </div>

                {/* Waveform */}
                <div className="waveform-container">
                    {waveBars.map((h, i) => (
                        <div key={i} className="wave-bar" style={{ height: `${h}px` }} />
                    ))}
                </div>

                {/* Orb */}
                <div className={orbClass}>
                    {status === 'Processing...' ? <SpinnerIcon /> : isListening ? <MicIcon /> : <MicOffIcon />}
                </div>

                {/* Buttons */}
                <div className="controls-area">
                    <p className="helper-text">
                        {isConnected ? 'Hold the button below to speak' : 'Connect to start a support session'}
                    </p>

                    <button
                        className={`btn ${isConnected ? 'btn-disconnect' : 'btn-connect'}`}
                        onClick={isConnected ? disconnect : connect}
                    >
                        {isConnected ? <><PhoneOffIcon /> End Session</> : <><PhoneIcon /> Start Call</>}
                    </button>

                    {isConnected && (
                        <button
                            className={`btn btn-speak${isListening ? ' active' : ''}`}
                            onMouseDown={startRecording}
                            onMouseUp={stopRecording}
                            onMouseLeave={stopRecording}
                            onTouchStart={startRecording}
                            onTouchEnd={stopRecording}
                        >
                            <MicIcon />
                            {isListening ? '🔴  Listening...' : 'Hold to Speak'}
                        </button>
                    )}
                </div>
            </div>

            {/* ─── Right: Transcript ─── */}
            <div className="glass-card transcript-panel">
                <div className="transcript-header">
                    <BotIcon />
                    <h2>Conversation</h2>
                </div>

                <div className="transcript-body">
                    {messages.length === 0 && (
                        <div className="empty-state">
                            <HeadphonesIcon />
                            <p>No conversation yet</p>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div key={i} className={`message-row ${msg.role}`}>
                            <div className={`message-bubble ${msg.role}`}>
                                {msg.role === 'agent' && <BotIcon />}
                                <span>{msg.text}</span>
                                {msg.role === 'user' && <UserIcon />}
                            </div>
                        </div>
                    ))}
                    <div ref={transcriptEndRef} />
                </div>

                <div className="transcript-footer">
                    <span className="footer-item">AI Guard Active</span>
                    <span className="footer-divider" />
                    <span className="footer-item">Ultra Low Latency</span>
                    <span className="footer-divider" />
                    <span className="footer-item">Encrypted Stream</span>
                </div>
            </div>
        </div>
    );
};

export default VoiceAgent;
