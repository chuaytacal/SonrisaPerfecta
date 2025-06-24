
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type CaptionProps } from "react-day-picker"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function capitalizeFirstLetter(string: string) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  // Use a local state for the month, initialized from props.
  const [internalMonth, setInternalMonth] = React.useState(
    props.month || props.defaultMonth || new Date()
  );

  // When the external month prop changes (e.g., in a controlled component), update the internal state.
  React.useEffect(() => {
    if (props.month && props.month.getTime() !== internalMonth.getTime()) {
      setInternalMonth(props.month);
    }
  }, [props.month, internalMonth]);

  const handleMonthChange = (month: Date) => {
    // If the parent component provides an onMonthChange handler, call it.
    if (props.onMonthChange) {
      props.onMonthChange(month);
    }
    // Always update the internal state to make the calendar interactive.
    setInternalMonth(month);
  };


  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium hidden", // Hide default label
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      month={internalMonth}
      onMonthChange={handleMonthChange}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" {...props} />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" {...props} />,
        // Pass the current month and the handler to the custom caption
        Caption: ({ ...captionProps }) => <CustomCaption {...captionProps} onMonthChange={handleMonthChange} fromYear={props.fromYear} toYear={props.toYear}/>
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

function CustomCaption({ displayMonth, onMonthChange, fromYear, toYear }: CaptionProps & {onMonthChange: (date: Date) => void, fromYear?: number, toYear?: number}) {
    const months = Array.from({ length: 12 }, (_, i) => new Date(new Date().getFullYear(), i, 1));
    const years: number[] = [];
    const startYear = fromYear || new Date().getFullYear() - 100;
    const endYear = toYear || new Date().getFullYear();
    for (let i = startYear; i <= endYear; i++) {
        years.push(i);
    }
  
    const handleMonthSelectChange = (value: string) => {
      const month = parseInt(value, 10);
      const newDate = new Date(displayMonth);
      newDate.setMonth(month);
      onMonthChange(newDate);
    };
  
    const handleYearSelectChange = (value: string) => {
      const year = parseInt(value, 10);
      const newDate = new Date(displayMonth);
      newDate.setFullYear(year);
      onMonthChange(newDate);
    };

    return (
      <div className="flex justify-center items-center gap-2 mb-4">
          <Select
              value={String(displayMonth.getMonth())}
              onValueChange={handleMonthSelectChange}
          >
              <SelectTrigger className="w-[120px] focus:ring-0">
                  <SelectValue>{capitalizeFirstLetter(format(displayMonth, 'MMMM', { locale: es }))}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                  {months.map((month, i) => (
                      <SelectItem key={i} value={String(i)}>
                          {capitalizeFirstLetter(format(month, 'MMMM', { locale: es }))}
                      </SelectItem>
                  ))}
              </SelectContent>
          </Select>
          <Select
              value={String(displayMonth.getFullYear())}
              onValueChange={handleYearSelectChange}
          >
              <SelectTrigger className="w-[100px] focus:ring-0">
                  <SelectValue>{displayMonth.getFullYear()}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                  {years.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                          {year}
                      </SelectItem>
                  ))}
              </SelectContent>
          </Select>
      </div>
    );
  }

export { Calendar }
