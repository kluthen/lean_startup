export type FoodAttributeType = 'ingredient' | 'origine' | 'composant' | 'fonctionnel' | 'preparation';

export interface PlateElement {
    id: string;
    code: string;
    label: string;
}

export interface FoodAttribute {
    id: string;
    type: FoodAttributeType;
    value: string;
}

export interface Ingredient {
    id: string;
    name: string;
    attributes?: FoodAttribute[]; // Joined
}

export interface Recipe {
    id: string;
    name: string;
    description?: string;
    attributes?: FoodAttribute[]; // Joined
    ingredients?: RecipeIngredient[];
}

export interface RecipeIngredient {
    recipeId: string;
    ingredientId: string;
    quantity?: number;
    unit?: string;
    optional: boolean;
    preparation?: string;
    // Joined details
    ingredient?: Ingredient;
}

export interface Allergen {
    id: string;
    code: string;
    label: string;
}
