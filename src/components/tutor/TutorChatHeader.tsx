import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TutorChatHeaderProps {
  materials: Array<{
    id: string;
    file_name: string;
    storage_path: string;
  }>;
  selectedMaterial: string | null;
  onMaterialSelect: (value: string) => void;
}

export const TutorChatHeader = ({
  materials,
  selectedMaterial,
  onMaterialSelect,
}: TutorChatHeaderProps) => {
  return (
    <div className="p-4 border-b">
      <h2 className="text-lg font-semibold">AI Study Assistant</h2>
      <p className="text-sm text-gray-600 mb-4">
        Ask me to create study guides, generate quizzes, build study schedules, or explain any topic you're struggling with.
      </p>
      
      {materials.length > 0 && (
        <Card className="bg-gray-50">
          <CardContent className="pt-4">
            <Select
              value={selectedMaterial || ""}
              onValueChange={onMaterialSelect}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a course material to reference" />
              </SelectTrigger>
              <SelectContent>
                {materials.map((material) => (
                  <SelectItem key={material.id} value={material.storage_path}>
                    {material.file_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}
    </div>
  );
};