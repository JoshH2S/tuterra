
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Team {
  id: string;
  name: string;
  avatar?: string;
}

// Sample team data - replace with your actual data source
const teams: Team[] = [
  {
    id: "1",
    name: "tuterra.ai",
    avatar: "/lovable-uploads/0b906dbe-8ddf-4736-8e1f-ef3ad2bf047b.png",
  },
  {
    id: "2",
    name: "Personal Account",
  },
];

interface TeamSwitcherProps {
  isCollapsed?: boolean;
}

export function TeamSwitcher({ isCollapsed = false }: TeamSwitcherProps) {
  const [selectedTeam, setSelectedTeam] = useState<Team>(teams[0]);

  return (
    <DropdownMenu>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "flex h-10 w-full items-center justify-between gap-2 p-2",
                  "hover:bg-slate-100 dark:hover:bg-slate-800",
                  "data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800"
                )}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={selectedTeam.avatar} />
                    <AvatarFallback className="text-xs">
                      {selectedTeam.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="truncate font-medium"
                    >
                      {selectedTeam.name}
                    </motion.span>
                  )}
                </div>
                {!isCollapsed && <ChevronsUpDown className="h-4 w-4 text-slate-500" />}
              </Button>
            </DropdownMenuTrigger>
            {isCollapsed && (
              <TooltipContent side="right">Switch Team</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>My Teams</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {teams.map((team) => (
          <DropdownMenuItem
            key={team.id}
            onClick={() => setSelectedTeam(team)}
            className="flex items-center gap-2"
          >
            <Avatar className="h-5 w-5">
              <AvatarImage src={team.avatar} />
              <AvatarFallback className="text-xs">
                {team.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 truncate">{team.name}</span>
            {selectedTeam.id === team.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>Create New Team</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
