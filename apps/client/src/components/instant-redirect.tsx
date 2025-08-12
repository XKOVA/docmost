import { Navigate } from "react-router-dom";

// Ultra-fast redirect - no API calls, no loading states
// Use this if you want instant redirects and rarely change the default landing page
export default function InstantRedirect() {
    // Check localStorage first for logged-in users
    const storedUserData = localStorage.getItem('currentUser');

    if (storedUserData) {
        try {
            const userData = JSON.parse(storedUserData);
            if (userData?.workspace?.defaultLandingPage) {
                return <Navigate to={userData.workspace.defaultLandingPage} replace />;
            }
        } catch (e) {
            localStorage.removeItem('currentUser');
        }
    }

    // For anonymous users, redirect directly to your current default landing page
    return <Navigate to="/share/0wgeen4ynv/p/xkova-docs-j8eCOENhNq" replace />;
}
