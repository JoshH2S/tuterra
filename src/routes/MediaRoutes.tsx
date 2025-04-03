
import { Route, Routes } from "react-router-dom";
import { MediaLibrary } from "@/components/media/MediaLibrary";

export const mediaRoutes = [
  <Route key="media-library" path="/" element={<MediaLibrary />} />
];
