import { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import LogoutIcon from '@mui/icons-material/Logout';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import { AuthContext } from '../contexts/authContext';
import Logo from '../assets/logo.png';

const HomeComponent = withAuth(function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const [error, setError] = useState("");

    const { addToUserHistory } = useContext(AuthContext);

    let handleJoinVideoCall = async () => {
        const code = meetingCode.trim();
        if (!code) {
            setError("Please enter a valid meeting code.");
            return;
        }

        setError("");
        await addToUserHistory(code)
        navigate(`/${code}`)
    }

    return (
        <div className="homePage">
            <div className="homeNavBar">
                <Stack direction="row" spacing={1.5}>
                    <img src={Logo} alt="NexMeet logo" style={{ width: "10%"}} />
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                        variant="outlined"
                        startIcon={<RestoreIcon />}
                        onClick={() => navigate("/history")}
                    >
                        History
                    </Button>
                    <Button
                        color="error"
                        variant="text"
                        startIcon={<LogoutIcon />}
                        onClick={() => {
                            localStorage.removeItem("token")
                            navigate("/auth")
                        }}
                    >
                        Logout
                    </Button>
                </Stack>
            </div>

            <div className="homeHeroWrap">
                <Paper elevation={0} className="homeHeroCard">
                    <Typography variant="h4" className="homeTitle">
                        Smooth video meetings for your team
                    </Typography>
                    <Typography variant="body1" className="mutedText" sx={{ mb: 2.5 }}>
                        Enter a meeting code and connect instantly with clear, reliable calls.
                    </Typography>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
                        <TextField
                            value={meetingCode}
                            onChange={(e) => setMeetingCode(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleJoinVideoCall();
                                }
                            }}
                            id="meeting-code"
                            label="Meeting Code"
                            variant="outlined"
                            fullWidth
                        />
                        <Button
                            onClick={handleJoinVideoCall}
                            variant='contained'
                            size='large'
                            startIcon={<VideoCallIcon />}
                            disabled={!meetingCode.trim()}
                        >
                            Join
                        </Button>
                    </Stack>

                    {error && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                </Paper>

                <div className='homeLogoPanel'>
                    <img src={Logo} alt="NexMeet" />
                </div>
            </div>
        </div>
    )
})

export default HomeComponent;
