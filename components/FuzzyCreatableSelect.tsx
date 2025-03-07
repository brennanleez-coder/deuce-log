import React from "react";
import CreatableSelect from "react-select/creatable";
import fuzzysort from "fuzzysort";

interface FuzzyCreatableSelectProps {
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

const FuzzyCreatableSelect: React.FC<FuzzyCreatableSelectProps> = ({
  label,
  placeholder,
  value,
  onChange,
  sessionPlayers,
  onAddPlayer,
  exclude = [],
}) => {
  // 1) Filter out excluded players (case-insensitive)
  const lowercasedExclude = exclude.map((ex) => ex.toLowerCase());
  const filteredPlayers = sessionPlayers.filter(
    (p) => !lowercasedExclude.includes(p.toLowerCase())
  );
  // 2) Sort the filtered players alphabetically
  const sortedPlayers = filteredPlayers.sort((a, b) => a.localeCompare(b));

  // 3) Convert sorted players into react-select options
  const options = sortedPlayers.map((p) => ({ label: p, value: p }));

  // 4) Fuzzy filter function for react-select
  const fuzzyFilterOption = (
    option: { label: string; value: string },
    input: string
  ) => {
    if (!input) return true; // show all if no input
    const result = fuzzysort.go(input, [option.label], {
      limit: 1,
      threshold: -10000,
    });
    return result.length > 0;
  };

  // 5) Handle creating a new player
  const handleCreateOption = (inputValue: string) => {
    const normalized = inputValue.trim();
    if (!normalized) return;

    // Check for duplicates ignoring case
    const alreadyExists = sessionPlayers.some(
      (p) => p.toLowerCase() === normalized.toLowerCase()
    );
    if (alreadyExists) {
      alert(`"${normalized}" already exists in this session.`);
      return;
    }

    onAddPlayer(normalized);
    onChange(normalized);
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <CreatableSelect
        value={value ? { label: value, value: value } : null}
        options={options}
        filterOption={fuzzyFilterOption}
        onChange={(selectedOption) => {
          if (!selectedOption) {
            onChange(""); // Clear the input when x is pressed
            return;
          }
          onChange(selectedOption.value);
        }}
        onCreateOption={handleCreateOption}
        formatCreateLabel={(inputVal) => `Add new player: "${inputVal}"`}
        placeholder={placeholder || "Search or add a player..."}
        isClearable
        classNamePrefix="fuzzy-select"
      />
    </div>
  );
};

export default FuzzyCreatableSelect;
