
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

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
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
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" {...props} />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" {...props} />,
        Caption: ({ ...props }) => <CustomCaption {...props} />
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

function CustomCaption({ displayMonth, ...props }: CaptionProps) {
    const { onMonthChange, fromYear, toYear } = props;
    const months = Array.from({ length: 12 }, (_, i) => new Date(new Date().getFullYear(), i, 1));
    const years: number[] = [];
    const startYear = fromYear || new Date().getFullYear() - 100;
    const endYear = toYear || new Date().getFullYear();
    for (let i = startYear; i <= endYear; i++) {
        years.push(i);
    }
  
    const handleMonthChange = (value: string) => {
      const month = parseInt(value, 10);
      const newDate = new Date(displayMonth);
      newDate.setMonth(month);
      onMonthChange?.(newDate);
    };
  
    const handleYearChange = (value: string) => {
      const year = parseInt(value, 10);
      const newDate = new Date(displayMonth);
      newDate.setFullYear(year);
      onMonthChange?.(newDate);
    };

    return (
      <div className="flex justify-center items-center gap-2 mb-4">
          <Select
              value={String(displayMonth.getMonth())}
              onValueChange={handleMonthChange}
          >
              <SelectTrigger className="w-[120px] focus:ring-0">
                  <SelectValue>{format(displayMonth, 'MMMM', { locale: es })}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                  {months.map((month, i) => (
                      <SelectItem key={i} value={String(i)}>
                          {format(month, 'MMMM', { locale: es })}
                      </SelectItem>
                  ))}
              </SelectContent>
          </Select>
          <Select
              value={String(displayMonth.getFullYear())}
              onValueChange={handleYearChange}
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
