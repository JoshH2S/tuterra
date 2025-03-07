
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuestionFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function QuestionFilter({ value, onChange }: QuestionFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter questions" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Questions</SelectItem>
        <SelectItem value="incorrect">Incorrect Only</SelectItem>
        <SelectItem value="correct">Correct Only</SelectItem>
      </SelectContent>
    </Select>
  );
}
