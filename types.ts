// Shared TypeScript interfaces for the Edible Plant Finder app

export interface PlantSuggestion {
  name: string;
  probability: number;
  details?: {
    common_names?: string[];
    edible_parts?: string[];
    toxicity?: string;
  };
}

export interface PlantIdentificationResult {
  classification: {
    suggestions: PlantSuggestion[];
  };
}
