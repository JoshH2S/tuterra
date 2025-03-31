
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { MediaLibrary } from "@/components/media/MediaLibrary";

export const MediaRoutes = () => {
  return (
    <>
      <Route
        path="/media-library"
        element={
          <ProtectedRoute>
            <MediaLibrary />
          </ProtectedRoute>
        }
      />
    </>
  );
};
