import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/authContext';
import { Snackbar } from '@mui/material';
import Logo from '../assets/logo.png';
import authIllustration from '../assets/background_2.jpg';

const defaultTheme = createTheme();

export default function Authentication() {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [formState, setFormState] = React.useState(0);
    const [open, setOpen] = React.useState(false);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    let handleAuth = async () => {
        try {
            setError("");
            setMessage("");

            if (formState === 0) {
                await handleLogin(username, password);
                setMessage("Login successful");
                setOpen(true);
                return;
            }

            if (formState === 1) {
                const result = await handleRegister(name, username, password);
                setName("");
                setUsername("");
                setPassword("");
                setMessage(result);
                setOpen(true);
                setFormState(0);
            }
        } catch (err) {
            const responseMessage = err?.response?.data?.message || err?.message || "Something went wrong";
            setError(responseMessage);
            setOpen(false);
        }
    }

    return (
        <ThemeProvider theme={defaultTheme}>
            <Box
                component="main"
                sx={{
                    minHeight: '100vh',
                    background: '#edf3fb',
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    '@media (max-width: 900px)': {
                        flexDirection: 'column',
                    },
                }}
            >
                <CssBaseline />

                <Box
                    sx={{
                        background: 'linear-gradient(180deg, rgba(245,247,251,0.96) 0%, rgba(234,240,255,0.94) 100%)',
                        p: { xs: 3, sm: 4 },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(12px)',
                        borderRight: '1px solid rgba(79, 90, 160, 0.12)',
                        width: '38%',
                        minHeight: '100vh',
                        order: 1,
                        '@media (max-width: 900px)': {
                            width: '100%',
                            minHeight: 'auto',
                            borderRight: 'none',
                        },
                    }}
                >
                    <Box sx={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 3.5 }}>
                            <Box
                                component="img"
                                src={Logo}
                                alt="NexMeet logo"
                                sx={{ width: '100%', maxWidth: 180, borderRadius: 2 }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.25, mb: 3.5, background: 'rgba(255,255,255,0.5)', p: 0.8, borderRadius: 3, width: '80%', border: '1px solid rgba(122,136,255,0.15)', boxShadow: '0 10px 25px rgba(71, 85, 170, 0.08)' }}>
                            <Button
                                variant={formState === 0 ? 'contained' : 'text'}
                                onClick={() => setFormState(0)}
                                sx={{
                                    borderRadius: 2,
                                    px: 3,
                                    py: 1.1,
                                    minWidth: 118,
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.04em',
                                    fontSize: '0.78rem',
                                    bgcolor: formState === 0 ? '#3a32f5' : 'transparent',
                                    color: formState === 0 ? '#fff' : '#2d3748',
                                    boxShadow: formState === 0 ? '0 10px 22px rgba(58, 50, 245, 0.24)' : 'none',
                                    '&:hover': {
                                        bgcolor: formState === 0 ? '#2f2ad8' : 'rgba(58,50,245,0.06)',
                                    },
                                }}
                            >
                                Sign In
                            </Button>
                            <Button
                                variant={formState === 1 ? 'contained' : 'text'}
                                onClick={() => setFormState(1)}
                                sx={{
                                    borderRadius: 2,
                                    px: 3,
                                    py: 1.1,
                                    minWidth: 130,
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.04em',
                                    fontSize: '0.78rem',
                                    bgcolor: formState === 1 ? '#3a32f5' : 'transparent',
                                    color: formState === 1 ? '#fff' : '#2d3748',
                                    boxShadow: formState === 1 ? '0 10px 22px rgba(58, 50, 245, 0.24)' : 'none',
                                    '&:hover': {
                                        bgcolor: formState === 1 ? '#2f2ad8' : 'rgba(58,50,245,0.06)',
                                    },
                                }}
                            >
                                Sign Up
                            </Button>
                        </Box>

                        <Box component="form" noValidate sx={{ mt: 0.8, width: '100%' }}>
                            {formState === 1 && (
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="full-name"
                                    label="Full Name"
                                    name="fullName"
                                    value={name}
                                    autoFocus
                                    onChange={(e) => setName(e.target.value)}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, background: 'rgba(255,255,255,0.72)', borderColor: 'rgba(84, 86, 170, 0.18)', boxShadow: '0 10px 25px rgba(41, 60, 120, 0.04)' } }}
                                />
                            )}

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                value={username}
                                autoFocus={formState === 0}
                                onChange={(e) => setUsername(e.target.value)}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, background: 'rgba(255,255,255,0.72)', borderColor: 'rgba(84, 86, 170, 0.18)', boxShadow: '0 10px 25px rgba(41, 60, 120, 0.04)' } }}
                            />

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                value={password}
                                type="password"
                                onChange={(e) => setPassword(e.target.value)}
                                id="password"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, background: 'rgba(255,255,255,0.72)', borderColor: 'rgba(84, 86, 170, 0.18)', boxShadow: '0 10px 25px rgba(41, 60, 120, 0.04)' } }}
                            />

                            {error && (
                                <Box component="p" sx={{ mt: 2, color: '#d32f2f', fontSize: '0.95rem', minHeight: 20, fontWeight: 500 }}>
                                    {error}
                                </Box>
                            )}

                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                sx={{
                                    mt: 3,
                                    py: 1.6,
                                    borderRadius: 2,
                                    background: 'linear-gradient(135deg, #3a32f5 0%, #5f5ef1 100%)',
                                    fontWeight: 800,
                                    textTransform: 'none',
                                    fontSize: '1.05rem',
                                    boxShadow: '0 16px 28px rgba(58, 50, 245, 0.22)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #2f2ad8 0%, #4c4ce8 100%)',
                                    },
                                }}
                                onClick={handleAuth}
                            >
                                {formState === 0 ? 'Login' : 'Register'}
                            </Button>
                        </Box>
                    </Box>
                </Box>

                <Box
                    sx={{
                        position: 'relative',
                        backgroundImage: `url(${authIllustration})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        minHeight: '100vh',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '62%',
                        order: 2,
                        '@media (max-width: 900px)': {
                            width: '100%',
                            minHeight: 380,
                        },
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(120deg, rgba(5, 10, 35, 0.15) 0%, rgba(44, 62, 147, 0.18) 100%)',
                            backdropFilter: 'blur(3px)',
                        }}
                    />

                    <Box
                        sx={{
                            position: 'relative',
                            zIndex: 1,
                            color: '#fff',
                            textAlign: 'center',
                            px: 4,
                            maxWidth: 760,
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Box
                            component="span"
                            sx={{
                                display: 'inline-block',
                                px: 2.2,
                                py: 0.8,
                                borderRadius: 999,
                                background: 'rgba(255,255,255,0.12)',
                                border: '1px solid rgba(255,255,255,0.18)',
                                fontSize: '0.8rem',
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                mb: 2.2,
                                fontWeight: 700,
                            }}
                        >
                            Smart meetings
                        </Box>

                        <Box
                            component="h2"
                            sx={{
                                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.25rem' },
                                lineHeight: 1.1,
                                fontWeight: 800,
                                mb: 1.5,
                                textShadow: '0 10px 26px rgba(0,0,0,0.28)',
                            }}
                        >
                            Meet people, share ideas, and launch instantly.
                        </Box>

                        <Box
                            component="p"
                            sx={{
                                fontSize: { xs: '0.98rem', md: '1.1rem' },
                                lineHeight: 1.7,
                                color: 'rgba(255,255,255,0.88)',
                                maxWidth: 520,
                                mx: 'auto',
                                textShadow: '0 4px 18px rgba(0,0,0,0.25)',
                            }}
                        >
                            Connect effortlessly, collaborate in real time, and keep every conversation moving with NexMeet.
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Snackbar
                open={open}
                autoHideDuration={4000}
                message={message}
                onClose={() => setOpen(false)}
            />
        </ThemeProvider>
    );
}
