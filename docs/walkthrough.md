# Meal Generator - Walkthrough

I have implemented the Meal Generator application using **Nuxt 4** and **PostgreSQL**. The application allows users to generate balanced meal plates based on dietary constraints and provides an Admin interface for managing ingredients and recipes.

## 1. Getting Started

The development server should be running on `http://localhost:3000` (or `3001` if port was busy).

### Features Implemented
- **Meal Generation**: Logic to compose plates (Protein, Starch, Side, Sauce) respecting "Forbidden" (`--`) and "Preferred" (`++`) constraints.
- **Admin Dashboard**: Manage Ingredients and Recipes.
- **Data Persistence**: Postgres database (seeded with initial data).

## 2. Core User Scenario: "Pregnant + Gluten-Free"

To verify the core requirement:

1.  **Navigate to Home Page** (`/`).
2.  **Configure Guest 1**:
    *   Click "Add Constraint".
    *   Select **"Gluten"** (under Composant).
    *   Set Weight to **"Forbidden (--)"**.
3.  **Configure Guest 2 (Optional)**:
    *   Click "Add Another Guest".
    *   Add constraint **"Viande"** (Origin) -> **"Forbidden"** (Vegetarian).
4.  **Generate**:
    *   Click **"Generate Meal"**.
5.  **Verify Results**:
    *   **Starch**: Should be Rice, Potatoes, or Quinoa (NOT Pasta/Boulgour).
    *   **Protein**: Should NOT be Meat (if Guest 2 set to No Meat).
    *   **Shopping List**: Should display correct quantities.

## 3. Administration

Access the admin panel at **`/admin`**.

- **Ingredients**: Add new ingredients (e.g., "Tofu"), delete existing ones.
- **Recipes**: Create recipes.
    - *Note*: When creating a recipe, you can link it to categories (Protein, etc.), Attributes (Tags), and Ingredients.

## 4. Technical Notes

- **Database**: Uses `postgres` driver. Connection string via `DATABASE_URL`.
- **API**: Located in `server/api/`. 
    - `POST /api/generate`: Core logic handler.
- **Types**: Shared models in `shared/types.ts`.
