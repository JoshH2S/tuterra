
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, DropdownProps } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-6", // Increased vertical spacing
        caption: "flex justify-center pt-3 relative items-center mb-6", // Increased top and bottom spacing
        caption_label: "text-sm font-medium",
        caption_dropdowns: "flex justify-center gap-2 mt-4", // Increased gap and vertical spacing
        nav: "hidden", // Hide the navigation buttons
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem] px-0",
        row: "flex w-full mt-2",
        cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-30",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        // Improved dropdown styling
        dropdown: "focus:outline-none focus:ring-0",
        dropdown_month: "w-[110px]", // Made month dropdown wider
        dropdown_year: "w-[80px]", // Made year dropdown wider
        dropdown_icon: "ml-auto h-4 w-4 opacity-50",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-5 w-5" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-5 w-5" />,
        Dropdown: ({ value, onChange, children, ...props }: DropdownProps) => {
          // Type safety for options
          const options = React.Children.toArray(children) as React.ReactElement[];
          
          // Create a proper handler that adapts the string value to match the expected type
          const handleValueChange = (newValue: string) => {
            if (onChange) {
              onChange(newValue as any);
            }
          };

          // Safely handle props when determining formatted value
          const propName = props.name as string | undefined;
          // Ensure value is properly typed for formatting
          const valueToFormat = typeof value === 'number' || typeof value === 'string' ? value : '';
          const formattedValue = propName === "months" && typeof valueToFormat === "number" 
            ? format(new Date(0, valueToFormat), 'MMMM')
            : String(valueToFormat);
          
          return (
            <Select
              value={String(valueToFormat)}
              onValueChange={handleValueChange}
            >
              <SelectTrigger className={cn("h-9 px-3 py-2 text-sm rounded-md", props.className)}>
                <SelectValue placeholder={formattedValue}>
                  {formattedValue}
                </SelectValue>
              </SelectTrigger>
              <SelectContent position="popper" className="z-[60] min-w-[8rem]">
                {options.map((option) => {
                  if (!React.isValidElement(option)) return null;
                  
                  const optionProps = option.props || {};
                  const optionValue = optionProps.value !== undefined ? String(optionProps.value) : "";
                  const isMonth = propName === "months";
                  
                  return (
                    <SelectItem
                      key={optionValue}
                      value={optionValue}
                      className="text-sm"
                    >
                      {isMonth && typeof optionProps.value === "number"
                        ? format(new Date(0, optionProps.value), 'MMMM')
                        : optionProps.children}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          );
        }
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
