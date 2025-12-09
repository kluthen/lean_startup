-- mise en place de la structure de base de l'application
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE plate_element (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL
);

CREATE TABLE recipe (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE recipe_plate_element (
    recipe_id UUID NOT NULL REFERENCES recipe(id) ON DELETE CASCADE,
    plate_element_id UUID NOT NULL REFERENCES plate_element(id) ON DELETE CASCADE,
    PRIMARY KEY (recipe_id, plate_element_id)
);

CREATE TABLE ingredient (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE recipe_ingredient (
    recipe_id UUID NOT NULL REFERENCES recipe(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredient(id),
    quantity NUMERIC,
    unit TEXT,
    optional BOOLEAN NOT NULL DEFAULT FALSE,
    preparation TEXT,
    PRIMARY KEY (recipe_id, ingredient_id)
);

CREATE TABLE ingredient_equivalence_group (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL
);

CREATE TABLE ingredient_equivalence (
    ingredient_id UUID NOT NULL REFERENCES ingredient(id) ON DELETE CASCADE,
    equivalence_group_id UUID NOT NULL REFERENCES ingredient_equivalence_group(id) ON DELETE CASCADE,
    PRIMARY KEY (ingredient_id, equivalence_group_id)
);

CREATE TYPE food_attribute_type AS ENUM (
    'ingredient',
    'origine',
    'composant',
    'fonctionnel',
    'preparation'
);

CREATE TABLE food_attribute (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type food_attribute_type NOT NULL,
    value TEXT NOT NULL,
    UNIQUE (type, value)
);

CREATE TABLE ingredient_attribute (
    ingredient_id UUID NOT NULL REFERENCES ingredient(id) ON DELETE CASCADE,
    food_attribute_id UUID NOT NULL REFERENCES food_attribute(id) ON DELETE CASCADE,
    PRIMARY KEY (ingredient_id, food_attribute_id)
);

CREATE TABLE recipe_attribute (
    recipe_id UUID NOT NULL REFERENCES recipe(id) ON DELETE CASCADE,
    food_attribute_id UUID NOT NULL REFERENCES food_attribute(id) ON DELETE CASCADE,
    PRIMARY KEY (recipe_id, food_attribute_id)
);

CREATE TABLE allergen (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL
);

CREATE TABLE ingredient_allergen (
    ingredient_id UUID NOT NULL REFERENCES ingredient(id) ON DELETE CASCADE,
    allergen_id UUID NOT NULL REFERENCES allergen(id) ON DELETE CASCADE,
    PRIMARY KEY (ingredient_id, allergen_id)
);

CREATE TABLE recipe_allergen (
    recipe_id UUID NOT NULL REFERENCES recipe(id) ON DELETE CASCADE,
    allergen_id UUID NOT NULL REFERENCES allergen(id) ON DELETE CASCADE,
    PRIMARY KEY (recipe_id, allergen_id)
);

CREATE TABLE recipe_composition (
    parent_recipe_id UUID NOT NULL REFERENCES recipe(id) ON DELETE CASCADE,
    child_recipe_id UUID NOT NULL REFERENCES recipe(id) ON DELETE CASCADE,
    PRIMARY KEY (parent_recipe_id, child_recipe_id),
    CHECK (parent_recipe_id <> child_recipe_id)
);

CREATE INDEX idx_food_attribute_type ON food_attribute(type);
CREATE INDEX idx_food_attribute_value ON food_attribute(value);

CREATE INDEX idx_ingredient_attribute_attr ON ingredient_attribute(food_attribute_id);
CREATE INDEX idx_recipe_attribute_attr ON recipe_attribute(food_attribute_id);

CREATE INDEX idx_ingredient_allergen_allergen ON ingredient_allergen(allergen_id);
CREATE INDEX idx_recipe_allergen_allergen ON recipe_allergen(allergen_id);
