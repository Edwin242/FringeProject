"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ArrowDownAZ, ArrowUpAZ, Calendar, Check, ChevronsUpDown, DollarSign } from "lucide-react"

export type SortOption = {
  field: string
  direction: "asc" | "desc"
  label: string
}

interface SortMenuProps {
  currentSort: SortOption
  onSortChange: (sort: SortOption) => void
}

export default function SortMenu({ currentSort, onSortChange }: SortMenuProps) {
  const sortOptions: SortOption[] = [
    { field: "date", direction: "desc", label: "Date (Newest first)" },
    { field: "date", direction: "asc", label: "Date (Oldest first)" },
    { field: "customer", direction: "asc", label: "Customer (A-Z)" },
    { field: "customer", direction: "desc", label: "Customer (Z-A)" },
    { field: "total", direction: "desc", label: "Total (High to Low)" },
    { field: "total", direction: "asc", label: "Total (Low to High)" },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800">
          <span>Sort</span>
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-gray-900 border-gray-800 text-gray-300">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-800" />
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={`${option.field}-${option.direction}`}
            className={`cursor-pointer hover:bg-gray-800 hover:text-white ${
              currentSort.field === option.field && currentSort.direction === option.direction
                ? "bg-gray-800 text-white"
                : ""
            }`}
            onClick={() => onSortChange(option)}
          >
            {option.field === "date" && <Calendar className="mr-2 h-4 w-4" />}
            {option.field === "customer" &&
              (option.direction === "asc" ? (
                <ArrowDownAZ className="mr-2 h-4 w-4" />
              ) : (
                <ArrowUpAZ className="mr-2 h-4 w-4" />
              ))}
            {option.field === "total" && <DollarSign className="mr-2 h-4 w-4" />}
            <span>{option.label}</span>
            {currentSort.field === option.field && currentSort.direction === option.direction && (
              <Check className="ml-auto h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

