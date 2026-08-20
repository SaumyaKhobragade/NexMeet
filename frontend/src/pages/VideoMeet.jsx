import { useCallback, useEffect, useRef, useState } from 'react'
import io from "socket.io-client";

import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'

import styles from "../styles/VideoComponent.module.css";
import server from '../environment.js';

const server_url = server;

let connections = {};

const peerConfigConnections = {
    "iceServers": [
        // Stun servers are lightweight servers running on the public internet that help WebRTC clients discover their public IP address and port. They are used to establish peer-to-peer connections between clients behind NATs (Network Address Translators) or firewalls.
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeet() {
    let socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoRef = useRef();
    const videoRef = useRef([])

    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [screenAvailable, setScreenAvailable] = useState();
    let [video, setVideo] = useState([]);
    let [audio, setAudio] = useState();
    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(true)
    let [messages, setMessages] = useState([])
    let [message, setMessage] = useState("");
    let [newMessages, setNewMessages] = useState(0);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    let [videos, setVideos] = useState([])

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    const getPermissions = useCallback(async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
            } else {
                setVideoAvailable(false);
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
            } else {
                setAudioAvailable(false);
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }, [audioAvailable, videoAvailable]);

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let getUserMediaSuccess = useCallback((stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (err) { console.log(err) }

        window.localStream = stream
        localVideoRef.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoRef.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch((err) => console.log(err))
                })
            }
        })
    }, []);

    let getUserMedia = useCallback(async () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then(() => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (err) { console.log(err) }
        }
    }, [video, audio, videoAvailable, audioAvailable, getUserMediaSuccess]);

    let getDislayMediaSuccess = useCallback((stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (err) { console.log(err) }

        window.localStream = stream
        localVideoRef.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoRef.current.srcObject = window.localStream

            getUserMedia()
        })
    }, [getUserMedia]);

    let getDislayMedia = useCallback(() => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then(() => { })
                    .catch((err) => console.log(err))
            }
        }
    }, [screen, getDislayMediaSuccess]);

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {
                    if (connections[socketListId]) return;

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            // Create a new video
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };


                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (err) { console.log(err) }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let handleVideo = () => {
        setVideo(!video);
    }

    let handleAudio = () => {
        setAudio(!audio)
    }

    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoRef.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (err) { console.log(err) }
        window.location.href = "/"
    }

    let closeChat = () => {
        setModal(false);
    }

    let handleMessage = (e) => {
        setMessage(e.target.value);
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };

    let sendMessage = () => {
        socketRef.current.emit('chat-message', message, username)
        setMessage("");
    }

    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }

    useEffect(() => {
        getPermissions();
    }, [getPermissions]);

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    }, [video, audio, getUserMedia]);

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen, getDislayMedia]);

    // Cleanup on unmount: disconnect socket, stop all tracks, close peer connections
    useEffect(() => {
        return () => {
            try {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                }
            } catch (e) { console.log(e) }

            try {
                let tracks = localVideoRef.current?.srcObject?.getTracks();
                tracks?.forEach(track => track.stop());
            } catch (e) { console.log(e) }

            try {
                if (window.localStream) {
                    window.localStream.getTracks().forEach(track => track.stop());
                    window.localStream = null;
                }
            } catch (e) { console.log(e) }

            // Close all peer connections
            for (let id in connections) {
                try {
                    connections[id].close();
                } catch (e) { console.log(e) }
            }
            connections = {};
        };
    }, []);

    return (
        <div>
            {askForUsername === true ?
                <div className={styles.lobbyContainer}>
                    <div className={styles.lobbyCard}>
                        <h2 className={styles.lobbyTitle}>
                            Join <span className={styles.lobbyTitleAccent}>NexMeet</span>
                        </h2>

                        <video
                            className={styles.lobbyPreview}
                            ref={localVideoRef}
                            autoPlay
                            muted
                        />

                        <div className={styles.lobbyActions}>
                            <TextField
                                id="lobby-username"
                                label="Your name"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && username.trim() && connect()}
                                variant="outlined"
                                fullWidth
                                size="small"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                        color: '#e2e8f0',
                                        '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
                                        '&:hover fieldset': { borderColor: 'rgba(99,102,241,0.5)' },
                                        '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                                    },
                                    '& .MuiInputLabel-root': { color: '#64748b' },
                                    '& .MuiInputLabel-root.Mui-focused': { color: '#818cf8' },
                                }}
                            />
                            <Button
                                id="lobby-connect-btn"
                                variant="contained"
                                onClick={connect}
                                disabled={!username.trim()}
                                fullWidth
                                sx={{
                                    borderRadius: '12px',
                                    padding: '0.75rem',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
                                    textTransform: 'none',
                                    boxShadow: 'none',
                                    '&:hover': { opacity: 0.9, boxShadow: 'none' },
                                    '&.Mui-disabled': { opacity: 0.4, color: '#fff' },
                                }}
                            >
                                Join Meeting
                            </Button>
                        </div>
                    </div>
                </div> :
                <div className={styles.meetVideoContainer}>

                    {/* ── Chat panel ── */}
                    {showModal && (
                        <div className={styles.chatRoom}>
                            <div className={styles.chatContainer}>
                                <div className={styles.chatHeader}>
                                    <h1>Chat</h1>
                                    <button className={styles.chatCloseBtn} onClick={closeChat} title="Close chat">✕</button>
                                </div>

                                <div className={styles.chattingDisplay}>
                                    {messages.length !== 0
                                        ? messages.map((item, index) => (
                                            <div className={styles.chatMessage} key={index}>
                                                <p className={styles.chatSender}>{item.sender}</p>
                                                <p className={styles.chatText}>{item.data}</p>
                                            </div>
                                        ))
                                        : <p className={styles.noMessages}>No messages yet</p>
                                    }
                                </div>

                                <div className={styles.chattingArea}>
                                    <TextField
                                        value={message}
                                        onChange={handleMessage}
                                        onKeyDown={e => e.key === 'Enter' && message.trim() && sendMessage()}
                                        id="chat-message-input"
                                        label="Message"
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            flex: 1,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px',
                                                color: '#e2e8f0',
                                                '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
                                                '&:hover fieldset': { borderColor: 'rgba(99,102,241,0.5)' },
                                                '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                                            },
                                            '& .MuiInputLabel-root': { color: '#64748b' },
                                            '& .MuiInputLabel-root.Mui-focused': { color: '#818cf8' },
                                        }}
                                    />
                                    <Button
                                        id="chat-send-btn"
                                        variant="contained"
                                        onClick={sendMessage}
                                        disabled={!message.trim()}
                                        sx={{
                                            borderRadius: '10px',
                                            flexShrink: 0,
                                            padding: '0.5rem 1rem',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                            background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
                                            textTransform: 'none',
                                            boxShadow: 'none',
                                            whiteSpace: 'nowrap',
                                            '&:hover': { opacity: 0.9, boxShadow: 'none' },
                                            '&.Mui-disabled': { opacity: 0.35, color: '#fff' },
                                        }}
                                    >
                                        Send
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Controls bar ── */}
                    <div className={styles.buttonContainers}>
                        <IconButton
                            id="ctrl-video"
                            onClick={handleVideo}
                            sx={{
                                width: 52, height: 52,
                                color: video ? '#fff' : '#f87171',
                                background: video ? 'rgba(255,255,255,0.08)' : 'rgba(239,68,68,0.18)',
                                border: `1px solid ${video ? 'rgba(255,255,255,0.12)' : 'rgba(239,68,68,0.4)'}`,
                                transition: 'all 0.18s ease',
                                '&:hover': { background: video ? 'rgba(255,255,255,0.16)' : 'rgba(239,68,68,0.28)', transform: 'translateY(-2px)' },
                            }}
                        >
                            {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>

                        <IconButton
                            id="ctrl-audio"
                            onClick={handleAudio}
                            sx={{
                                width: 52, height: 52,
                                color: audio ? '#fff' : '#f87171',
                                background: audio ? 'rgba(255,255,255,0.08)' : 'rgba(239,68,68,0.18)',
                                border: `1px solid ${audio ? 'rgba(255,255,255,0.12)' : 'rgba(239,68,68,0.4)'}`,
                                transition: 'all 0.18s ease',
                                '&:hover': { background: audio ? 'rgba(255,255,255,0.16)' : 'rgba(239,68,68,0.28)', transform: 'translateY(-2px)' },
                            }}
                        >
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>

                        {screenAvailable === true && (
                            <IconButton
                                id="ctrl-screen"
                                onClick={handleScreen}
                                sx={{
                                    width: 52, height: 52,
                                    color: screen ? '#38bdf8' : '#fff',
                                    background: screen ? 'rgba(56,189,248,0.18)' : 'rgba(255,255,255,0.08)',
                                    border: `1px solid ${screen ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.12)'}`,
                                    transition: 'all 0.18s ease',
                                    '&:hover': { background: screen ? 'rgba(56,189,248,0.28)' : 'rgba(255,255,255,0.16)', transform: 'translateY(-2px)' },
                                }}
                            >
                                {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                            </IconButton>
                        )}

                        <IconButton
                            id="ctrl-end-call"
                            onClick={handleEndCall}
                            sx={{
                                width: 52, height: 52,
                                color: '#fff',
                                background: 'rgba(239,68,68,0.75)',
                                border: '1px solid rgba(239,68,68,0.6)',
                                transition: 'all 0.18s ease',
                                '&:hover': { background: 'rgba(239,68,68,0.9)', transform: 'translateY(-2px)' },
                            }}
                        >
                            <CallEndIcon />
                        </IconButton>

                        <Badge
                            badgeContent={newMessages}
                            max={999}
                            color="secondary"
                            sx={{ '& .MuiBadge-badge': { background: '#6366f1', color: '#fff' } }}
                        >
                            <IconButton
                                id="ctrl-chat"
                                onClick={() => { setModal(!showModal); if (!showModal) setNewMessages(0); }}
                                sx={{
                                    width: 52, height: 52,
                                    color: showModal ? '#818cf8' : '#fff',
                                    background: showModal ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.08)',
                                    border: `1px solid ${showModal ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.12)'}`,
                                    transition: 'all 0.18s ease',
                                    '&:hover': { background: showModal ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.16)', transform: 'translateY(-2px)' },
                                }}
                            >
                                <ChatIcon />
                            </IconButton>
                        </Badge>
                    </div>

                    {/* ── Local (self) video PiP ── */}
                    <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted />

                    {/* ── Remote participants ── */}
                    <div className={styles.conferenceView}>
                        {videos.map((video) => (
                            <div key={video.socketId}>
                                <video
                                    data-socket={video.socketId}
                                    ref={ref => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }}
                                    autoPlay
                                    playsInline
                                />
                            </div>
                        ))}
                    </div>
                </div>
            }
        </div>
    );
}
