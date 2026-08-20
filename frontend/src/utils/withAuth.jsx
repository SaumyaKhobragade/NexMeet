import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"

const withAuth = (WrappedComponent) => {
    const AuthComponent = (props) => {
        const router = useNavigate();
        const [isAuthed, setIsAuthed] = useState(false);

        useEffect(() => {
            if (localStorage.getItem("token")) {
                setIsAuthed(true);
            } else {
                router("/auth");
            }
        }, [router])

        if (!isAuthed) return null;

        return <WrappedComponent {...props} />
    }

    return AuthComponent;
}

export default withAuth;
