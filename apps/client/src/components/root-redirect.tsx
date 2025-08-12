import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function RootRedirect() {
    const [redirectTo, setRedirectTo] = useState<string | null>(null);

    useEffect(() => {
        const checkDefaultLandingPage = async () => {
            try {
                // Check localStorage first (synchronous, faster)
                const storedUserData = localStorage.getItem('currentUser');
                if (storedUserData) {
                    try {
                        const userData = JSON.parse(storedUserData);
                        if (userData?.workspace?.defaultLandingPage) {
                            setRedirectTo(userData.workspace.defaultLandingPage);
                            return;
                        }
                    } catch (e) {
                        localStorage.removeItem('currentUser');
                    }
                }

                // Parallel: Start API call immediately for anonymous users
                const response = await fetch('/api/workspace/public', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({}),
                });

                if (response.ok) {
                    const workspaceData = await response.json();
                    if (workspaceData?.data?.defaultLandingPage) {
                        setRedirectTo(workspaceData.data.defaultLandingPage);
                        return;
                    }
                }

                // Fallback to home
                setRedirectTo("/home");
            } catch (error) {
                console.debug('Error checking default landing page:', error);
                setRedirectTo("/home");
            }
        };

        checkDefaultLandingPage();
    }, []);

    // Return null while checking - CSS handles the loading state
    if (!redirectTo) {
        return null;
    }

    return <Navigate to={redirectTo} replace />;
}
