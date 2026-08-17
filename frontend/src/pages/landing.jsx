import '../App.css';
import { Link, useNavigate } from 'react-router-dom';

import Logo from '../assets/logo.png';
import HeroImage from '../assets/hero.png';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landingPageContainer">
            <nav>
                <div className="navHeader">
                    <img src={Logo} alt="Logo" style={{ width: '8rem', height: 'auto' }} />
                </div>
                <div className="navlist">
                    <p onClick={() => navigate('/aljk23')}>Join as Guest</p>
                    <p onClick={() => navigate('/auth')}>Login</p>
                    <div role="button" onClick={() => navigate('/auth')}>
                        <p>Sign Up</p>
                    </div>
                </div>
            </nav>

            <div className="landingMainContainer">
                <div style={{ width: '40%', marginLeft: '5rem' }}>
                    <h1><span style={{ color: '#3a32f5' }}>Connect</span> with the World!</h1>
                    <p>Join our community and connect with people from all over the world!</p>
                    <div role="button"><Link to="/auth">Get Started</Link></div>
                </div>
                <div style={{ marginRight: '5rem', marginTop: '2rem' }}>
                    <img src={HeroImage} alt="Hero" style={{ width: '56rem', height: 'auto' }} />
                </div>
            </div>
        </div>
    )
}
