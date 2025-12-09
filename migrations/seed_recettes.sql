INSERT INTO plate_element (code, label) VALUES
('protein', 'Protéine'),
('feculent', 'Féculent'),
('accompagnement', 'Accompagnement'),
('sauce', 'Sauce');

INSERT INTO recipe (name, description) VALUES
('Poulet grille', 'Blanc de poulet simplement grille'),
('Boeuf poele', 'Boeuf poele nature'),
('Saumon grille', 'Filet de saumon grille'),
('Cabillaud vapeur', 'Cabillaud cuit a la vapeur');

INSERT INTO recipe_plate_element (recipe_id, plate_element_id)
SELECT r.id, pe.id
FROM recipe r
JOIN plate_element pe ON pe.code = 'protein'
WHERE r.name IN (
  'Poulet grille',
  'Boeuf poele',
  'Saumon grille',
  'Cabillaud vapeur'
);


INSERT INTO recipe_ingredient (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 150, 'g'
FROM recipe r
JOIN ingredient i ON (
    (r.name = 'Poulet grille' AND i.name = 'Poulet')
 OR (r.name = 'Boeuf poele' AND i.name = 'Boeuf')
 OR (r.name = 'Saumon grille' AND i.name = 'Saumon')
 OR (r.name = 'Cabillaud vapeur' AND i.name = 'Cabillaud')
);


INSERT INTO recipe (name, description) VALUES
('Riz blanc nature', 'Riz blanc cuit a l eau'),
('Pates nature', 'Pates de ble nature'),
('Pommes de terre vapeur', 'Pommes de terre cuites vapeur'),
('Quinoa nature', 'Quinoa simplement cuit');


INSERT INTO recipe_plate_element (recipe_id, plate_element_id)
SELECT r.id, pe.id
FROM recipe r
JOIN plate_element pe ON pe.code = 'feculent'
WHERE r.name IN (
  'Riz blanc nature',
  'Pates nature',
  'Pommes de terre vapeur',
  'Quinoa nature'
);

INSERT INTO recipe_ingredient (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 150, 'g'
FROM recipe r
JOIN ingredient i ON (
    (r.name = 'Riz blanc nature' AND i.name = 'Riz blanc')
 OR (r.name = 'Pates nature' AND i.name = 'Pates de ble')
 OR (r.name = 'Pommes de terre vapeur' AND i.name = 'Pommes de terre')
 OR (r.name = 'Quinoa nature' AND i.name = 'Quinoa')
);

INSERT INTO recipe (name, description) VALUES
('Legumes verts vapeur', 'Melange de legumes verts cuits vapeur'),
('Poelee de legumes', 'Legumes poeles simplement'),
('Carottes vapeur', 'Carottes cuites vapeur');

INSERT INTO recipe_plate_element (recipe_id, plate_element_id)
SELECT r.id, pe.id
FROM recipe r
JOIN plate_element pe ON pe.code = 'accompagnement'
WHERE r.name IN (
  'Legumes verts vapeur',
  'Poelee de legumes',
  'Carottes vapeur'
);

-- Légumes verts vapeur
INSERT INTO recipe_ingredient (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 100, 'g'
FROM recipe r
JOIN ingredient i ON i.name IN ('Brocoli','Epinard','Courgette')
WHERE r.name = 'Legumes verts vapeur';

-- Poêlée de légumes
INSERT INTO recipe_ingredient (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 80, 'g'
FROM recipe r
JOIN ingredient i ON i.name IN ('Courgette','Poivron','Oignon','Tomate')
WHERE r.name = 'Poelee de legumes';

-- Carottes vapeur
INSERT INTO recipe_ingredient (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 150, 'g'
FROM recipe r
JOIN ingredient i ON i.name = 'Carotte'
WHERE r.name = 'Carottes vapeur';

INSERT INTO recipe (name, description) VALUES
('Sauce tomate simple', 'Sauce tomate nature'),
('Sauce legumes', 'Sauce legere a base de legumes');

INSERT INTO recipe_plate_element (recipe_id, plate_element_id)
SELECT r.id, pe.id
FROM recipe r
JOIN plate_element pe ON pe.code = 'sauce'
WHERE r.name IN (
  'Sauce tomate simple',
  'Sauce legumes'
);

-- Sauce tomate
INSERT INTO recipe_ingredient (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 100, 'g'
FROM recipe r
JOIN ingredient i ON i.name = 'Tomate'
WHERE r.name = 'Sauce tomate simple';

-- Sauce légumes
INSERT INTO recipe_ingredient (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 50, 'g'
FROM recipe r
JOIN ingredient i ON i.name IN ('Tomate','Oignon','Poivron')
WHERE r.name = 'Sauce legumes';
