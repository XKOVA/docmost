import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useCurrentUser from "@/features/user/hooks/use-current-user";
import APP_ROUTE from "@/lib/app-route";

export default function LandingPageRedirect() {
  const { data, isLoading, isError } = useCurrentUser();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    // If still loading user data, wait
    if (isLoading) {
      return;
    }

    // If there's an error (like 401 unauthorized), let the API interceptor handle it
    if (isError) {
      return;
    }

    // If user is authenticated, check for default landing page
    if (data?.workspace) {
      const defaultLandingPage = data.workspace.defaultLandingPage;
      
      if (defaultLandingPage) {
        // If a default landing page is configured, redirect there
        setRedirectPath(defaultLandingPage);
      } else {
        // Default behavior: redirect to home
        setRedirectPath(APP_ROUTE.HOME);
      }
    }
  }, [data, isLoading, isError]);

  // Show loading state while determining redirect
  if (isLoading || !redirectPath) {
    return <></>;
  }

  return <Navigate to={redirectPath} replace />;
}
