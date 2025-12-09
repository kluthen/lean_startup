# Implementation Plan - Meal Generator Application

Building upon the existing **Nuxt.js** and **Postgres** architecture found in the workspace.

## User Review Required
> [!NOTE]
> **Architecture**: I will use the existing Nuxt 4 project and Postgres database. The schema is already defined in `migrations/`. I will use `postgres` (js driver) for DB access (as seen in `server/utils/db.ts`).
> **UI Framework**: `package.json` includes `@nuxt/ui`, so I will utilize it for a premium, accessible design (Tailwind-based).

## Proposed Changes

### Backend (Nuxt Server Routes)
I will create API endpoints in `server/api/` to interact with the Postgres DB.
- **DTOs/Types**: Define TypeScript interfaces mirroring `plate_element`, `recipe`, `ingredient`, `food_attribute`.
- **`server/api/ingredients/`**: GET, POST, PUT, DELETE.
- **`server/api/recipes/`**: GET, POST, PUT, DELETE (handling relations like `recipe_ingredient`).
- **`server/api/generate/`**: POST. logic to accept constraints and return a meal plan.

### Core Logic (The "Brain")
Located in `server/utils/` or a dedicated service file.
1.  **Filter**: Exclude ingredients/recipes based on "Forbidden" (`--`) constraints.
2.  **Score**: Rank remaining items based on "Preferred" (`++`, `+`) constraints.
3.  **Compose**: Select one of each `plate_element` (Protein, Starch, Side, Sauce) to form a balanced plate.
    *   *Constraint*: Must match `recipe_plate_element` types.

### Frontend (Vue Pages)
- **`pages/index.vue`**:
    - **Form**: Sliders for constraints (Gluten, Lactose, Pregnant, etc.).
    - **Action**: "Generate Meal".
- **`pages/meal.vue`** (or component):
    - Display the 4 selected components.
    - Button to "Swap" an item (fetching alternatives).
    - **Shopping List**: Aggregate ingredients from selected recipes, flagging warnings.
- **`pages/admin/`**:
    - Tabs for Ingredients and Recipes.
    - Forms to populate the DB (for manual entry beyond seeds).

## Verification Plan

### Automated
- **Unit Logic**: Create a script `tests/generation.test.ts` to mock the DB and test the constraint filter (e.g. "Given GlutenIntolerant guest, ensure Pasta is excluded").

### Manual
1.  **Seed Data**: Ensure `seed_ingredients.sql` and `seed_recettes.sql` are loaded.
2.  **Scenario Test**:
    - Go to `/`.
    - Select "Guest 1: Pregnant" (filters raw meat/cheese).
    - Select "Guest 2: No Gluten".
    - Generate.
    - **Expect**: Cooked meats, rice/potatoes (no pasta), safe sauces.
    - **Check Shopping List**: Should list items clearly.
