import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/authContext'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import VideocamIcon from '@mui/icons-material/Videocam';
import { Box, Button, CircularProgress, Container, Stack } from '@mui/material';
import Logo from '../assets/logo.png';
import '../App.css';

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([])
    const [loading, setLoading] = useState(true);
    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                if (Array.isArray(history)) {
                    setMeetings(history);
                } else {
                    setMeetings([]);
                }
            } catch {
                // IMPLEMENT SNACKBAR
            } finally {
                setLoading(false);
            }
        }

        fetchHistory();
    }, [getHistoryOfUser]);

    let formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const year = date.getFullYear();

        return `${day}/${month}/${year}`
    }

    return (
        <div className="historyPage">
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Box className="historyHeader">
                    <Stack direction="row" spacing={1.2} alignItems="center">
                        <img src={Logo} alt="NexMeet logo" style={{ width: "15%" }} />
                    </Stack>

                    <Button
                        startIcon={<HomeIcon />}
                        variant="outlined"
                        onClick={() => routeTo("/home")}
                        sx={{ padding: "4px 32px" }}
                    >
                        Home
                    </Button>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '220px' }}>
                        <CircularProgress />
                    </Box>
                ) : meetings.length === 0 ? (
                    <Card variant="outlined" className="historyCard">
                        <CardContent>
                            <Typography variant="h6" gutterBottom>No meetings yet</Typography>
                            <Typography color="text.secondary">Once you join meetings, they will appear here.</Typography>
                        </CardContent>
                    </Card>
                ) : (
                    <Stack spacing={1.6} sx={{ mt: 2 }}>
                        {meetings.map((meeting, index) => (
                            <Card key={`${meeting.meetingCode}-${meeting.date || index}`} variant="outlined" className="historyCard">
                                <CardContent>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.2}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <VideocamIcon color="primary" />
                                            <Typography variant="subtitle1" fontWeight={600}>{meeting.meetingCode}</Typography>
                                        </Stack>

                                        <Stack direction="row" spacing={0.8} alignItems="center">
                                            <AccessTimeFilledIcon fontSize="small" color="action" />
                                            <Typography variant="body2" color="text.secondary">{formatDate(meeting.date || meeting.createdAt)}</Typography>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}
            </Container>
        </div>
    )
}
