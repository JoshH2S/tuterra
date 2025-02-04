import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";

interface Objective {
  description: string;
  days: number;
}

interface ObjectiveInputProps {
  objective: Objective;
  index: number;
  onChange: (index: number, field: keyof Objective, value: string | number) => void;
}

export const ObjectiveInput = ({ objective, index, onChange }: ObjectiveInputProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Objective {index + 1}</Label>
        <Input
          placeholder="Enter learning objective"
          value={objective.description}
          onChange={(e) => onChange(index, "description", e.target.value)}
        />
      </div>
      <div>
        <Label>Days to Complete</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="1"
            value={objective.days}
            onChange={(e) => onChange(index, "days", parseInt(e.target.value))}
            className="w-24"
          />
          <Clock className="h-4 w-4 text-gray-500" />
        </div>
      </div>
    </div>
  );
};