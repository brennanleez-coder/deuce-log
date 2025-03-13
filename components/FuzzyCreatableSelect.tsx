"use client";

import React, { useState, useEffect } from "react";
import fuzzysort from "fuzzysort";

// Shadcn UI components
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface FuzzyCreatableComboboxProps {
  label?: string;
  placeholder?: string;
  value: string | null; // current selected player name
  onChange: (newValue: string) => void;
  sessionPlayers: string[]; // current session's existing players
  onAddPlayer: (newPlayerName: string) => void;
  /**
   * Optional array of names to exclude (case-insensitive).
   * These won’t appear as selectable options in the dropdown.
   */
  exclude?: string[];
}

/**
 * A Command-based Combobox that supports fuzzy search and creating new players,
 * with responsiveness for mobile and desktop.
 */
const FuzzyCreatableCombobox: React.FC<FuzzyCreatableComboboxProps> = ({
  label,
  placeholder,
  value,
  onChange,
  sessionPlayers,
  onAddPlayer,
  exclude = [],
}) => {
  // Tracks whether the popover (command menu) is open
  const [open, setOpen] = useState(false);

  // Internal search query in the combobox
  const [query, setQuery] = useState("");

  // 1) Filter out excluded players
  const lowercasedExclude = exclude.map((ex) => ex.toLowerCase());
  const filteredPlayers = sessionPlayers.filter(
    (p) => !lowercasedExclude.includes(p.toLowerCase())
  );

  // 2) Sort the filtered players alphabetically
  const sortedPlayers = filteredPlayers.sort((a, b) => a.localeCompare(b));

  // 3) Fuzzy filter function
  const fuzzyResults = fuzzysort.go(query, sortedPlayers, {
    limit: 50, // up to 50 matches
    threshold: -10000,
  });

  // Convert fuzzysort results into a list of strings
  const fuzzyPlayerNames = query
    ? fuzzyResults.map((res) => res.target)
    : sortedPlayers;

  // 4) Check if typed input can be used to create a new player
  const trimmedQuery = query.trim();
  const alreadyExists = sessionPlayers.some(
    (p) => p.toLowerCase() === trimmedQuery.toLowerCase()
  );
  const canCreateNew =
    trimmedQuery.length > 0 &&
    !alreadyExists &&
    !lowercasedExclude.includes(trimmedQuery.toLowerCase());

  // Handle selecting a player
  const handleSelect = (playerName: string) => {
    onChange(playerName);
    setQuery(playerName);
    setOpen(false);
  };

  // Handle creating a new player
  const handleCreate = (playerName: string) => {
    onAddPlayer(playerName);
    onChange(playerName);
    setQuery(playerName);
    setOpen(false);
  };

  // Keep query in sync if an external value is set/cleared
  useEffect(() => {
    if (!value) {
      setQuery("");
    } else {
      setQuery(value);
    }
  }, [value]);

  return (
    <div className="space-y-1">
      {label && (
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            // Make the button take up full width by default (on mobile),
            // but you can tweak if you want a smaller or flexible button.
            className="w-full justify-between"
            onClick={() => setOpen(!open)}
          >
            {value || placeholder || "Search or add a player..."}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          // Below classes make the popover adapt for mobile:
          // - "p-0" removes default padding so Command can fill
          // - "w-full" ensures it can fill horizontally in smaller screens
          // - "sm:w-[300px]" sets a max width for desktop
          // - "max-w-[90vw]" keeps it within 90% of the viewport width on mobile
          className="p-0 w-full sm:w-[300px] max-w-[90vw]"
        >
          <Command>
            <CommandInput
              placeholder={placeholder || "Search or add a player..."}
              value={query}
              onValueChange={(val) => setQuery(val)}
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {fuzzyPlayerNames.map((player) => (
                  <CommandItem key={player} onSelect={() => handleSelect(player)}>
                    {player}
                  </CommandItem>
                ))}

                {/* Show "Add new player" if user typed something not found */}
                {canCreateNew && (
                  <CommandItem
                    key="__create_new"
                    className="text-blue-600"
                    onSelect={() => handleCreate(trimmedQuery)}
                  >
                    Add new player: "{trimmedQuery}"
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FuzzyCreatableCombobox;
