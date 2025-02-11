
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { CourseMaterial } from "@/types/course";

interface CourseMaterialsTabProps {
  materials: CourseMaterial[];
}

export const CourseMaterialsTab = ({ materials }: CourseMaterialsTabProps) => {
  return (
    <div className="space-y-4">
      {materials.map((material) => (
        <Card key={material.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="font-medium">{material.file_name}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
