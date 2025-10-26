import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import AppLayout from "@/components/AppLayout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <h1 className="text-5xl font-extrabold">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found</p>
        <a href="/" className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-primary-foreground">Return Home</a>
      </div>
    </AppLayout>
  );
};

export default NotFound;
