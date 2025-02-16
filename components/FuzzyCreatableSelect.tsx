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
  exclude = [], // Default to empty array if not provided
}) => {
  /**
   * 1) Filter out excluded players
   *    We’ll do a case-insensitive comparison so that "John" is excluded
   *    if "john" is in the exclude array, and vice versa.
   */
  const lowercasedExclude = exclude.map((ex) => ex.toLowerCase());
  const filteredPlayers = sessionPlayers.filter(
    (p) => !lowercasedExclude.includes(p.toLowerCase())
  );

  /**
   * 2) Convert filtered session players into react-select’s { label, value } format
   */
  const options = filteredPlayers.map((p) => ({ label: p, value: p }));

  /**
   * 3) Fuzzy filter function for react-select
   */
  const fuzzyFilterOption = (
    option: { label: string; value: string },
    input: string
  ) => {
    if (!input) return true; // show all if no input
    // Use fuzzysort to compare user input to the option label
    const result = fuzzysort.go(input, [option.label], {
      limit: 1,
      threshold: -10000, // tune as desired
    });
    return result.length > 0;
  };

  /**
   * 4) Handle creating a new player
   */
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

    // Add the new player to session
    onAddPlayer(normalized);

    // Immediately select the newly added player
    onChange(normalized);
  };

  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}

      <CreatableSelect
        // The currently selected value
        value={value ? { label: value, value: value } : null}
        // The session players as options (minus excluded)
        options={options}
        // Fuzzy filter
        filterOption={fuzzyFilterOption}
        // Called when user picks an existing option
        onChange={(selectedOption) => {
          if (!selectedOption) return;
          onChange(selectedOption.value);
        }}
        // Called when user types a new name and chooses to add it
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
