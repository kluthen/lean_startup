-- Seed

INSERT INTO food_attribute (type, value) VALUES
-- Origines
('origine', 'legume'),
('origine', 'feculent'),
('origine', 'viande'),
('origine', 'poisson'),
('origine', 'fruit'),

-- Composants
('composant', 'gluten'),
('composant', 'lactose'),
('composant', 'proteine_animale'),
('composant', 'proteine_vegetale'),
('composant', 'fibre'),

-- Fonctionnels
('fonctionnel', 'legume_racine'),
('fonctionnel', 'cereal'),
('fonctionnel', 'fruit_frais');

INSERT INTO allergen (code, label) VALUES
('gluten', 'Gluten'),
('lactose', 'Lactose'),
('poisson', 'Poisson'),
('oeuf', 'Oeuf');

INSERT INTO ingredient (name) VALUES
('Carotte'),
('Brocoli'),
('Courgette'),
('Poivron'),
('Oignon'),
('Tomate'),
('Epinard');

INSERT INTO ingredient_attribute (ingredient_id, food_attribute_id)
SELECT i.id, fa.id
FROM ingredient i
JOIN food_attribute fa ON fa.type = 'origine' AND fa.value = 'legume'
WHERE i.name IN ('Carotte','Brocoli','Courgette','Poivron','Oignon','Tomate','Epinard');

INSERT INTO ingredient (name) VALUES
('Riz blanc'),
('Pates de ble'),
('Pommes de terre'),
('Quinoa'),
('Boulgour');

-- Origine féculent
INSERT INTO ingredient_attribute (ingredient_id, food_attribute_id)
SELECT i.id, fa.id
FROM ingredient i
JOIN food_attribute fa ON fa.type = 'origine' AND fa.value = 'feculent'
WHERE i.name IN ('Riz blanc','Pates de ble','Pommes de terre','Quinoa','Boulgour');

-- Composant gluten
INSERT INTO ingredient_attribute (ingredient_id, food_attribute_id)
SELECT i.id, fa.id
FROM ingredient i
JOIN food_attribute fa ON fa.type = 'composant' AND fa.value = 'gluten'
WHERE i.name IN ('Pates de ble','Boulgour');

INSERT INTO ingredient (name) VALUES
('Poulet'),
('Boeuf'),
('Porc');

-- Origine viande
INSERT INTO ingredient_attribute (ingredient_id, food_attribute_id)
SELECT i.id, fa.id
FROM ingredient i
JOIN food_attribute fa ON fa.type = 'origine' AND fa.value = 'viande'
WHERE i.name IN ('Poulet','Boeuf','Porc');

-- Protéine animale
INSERT INTO ingredient_attribute (ingredient_id, food_attribute_id)
SELECT i.id, fa.id
FROM ingredient i
JOIN food_attribute fa ON fa.type = 'composant' AND fa.value = 'proteine_animale'
WHERE i.name IN ('Poulet','Boeuf','Porc');


INSERT INTO ingredient (name) VALUES
('Saumon'),
('Cabillaud'),
('Thon');

-- Origine poisson
INSERT INTO ingredient_attribute (ingredient_id, food_attribute_id)
SELECT i.id, fa.id
FROM ingredient i
JOIN food_attribute fa ON fa.type = 'origine' AND fa.value = 'poisson'
WHERE i.name IN ('Saumon','Cabillaud','Thon');

-- Protéine animale
INSERT INTO ingredient_attribute (ingredient_id, food_attribute_id)
SELECT i.id, fa.id
FROM ingredient i
JOIN food_attribute fa ON fa.type = 'composant' AND fa.value = 'proteine_animale'
WHERE i.name IN ('Saumon','Cabillaud','Thon');

-- Allergène poisson
INSERT INTO ingredient_allergen (ingredient_id, allergen_id)
SELECT i.id, a.id
FROM ingredient i
JOIN allergen a ON a.code = 'poisson'
WHERE i.name IN ('Saumon','Cabillaud','Thon');

INSERT INTO ingredient (name) VALUES
('Pomme'),
('Banane'),
('Orange'),
('Fraise'),
('Poire');

INSERT INTO ingredient_attribute (ingredient_id, food_attribute_id)
SELECT i.id, fa.id
FROM ingredient i
JOIN food_attribute fa ON fa.type = 'origine' AND fa.value = 'fruit'
WHERE i.name IN ('Pomme','Banane','Orange','Fraise','Poire');

INSERT INTO ingredient_equivalence_group (name) VALUES
-- Légumes
('legume_vert'),
('legume_racine'),
('legume_cuisine'),

-- Féculents
('feculent_cereal'),
('feculent_tubercule'),

-- Protéines animales
('viande_blanche'),
('viande_rouge'),
('poisson_maigre'),
('poisson_gras'),

-- Fruits
('fruit_cru');

-- Légumes verts
INSERT INTO ingredient_equivalence (ingredient_id, equivalence_group_id)
SELECT i.id, g.id
FROM ingredient i
JOIN ingredient_equivalence_group g ON g.name = 'legume_vert'
WHERE i.name IN ('Brocoli','Epinard','Courgette');

-- Légumes racines
INSERT INTO ingredient_equivalence (ingredient_id, equivalence_group_id)
SELECT i.id, g.id
FROM ingredient i
JOIN ingredient_equivalence_group g ON g.name = 'legume_racine'
WHERE i.name IN ('Carotte','Oignon');

-- Légumes cuisinés polyvalents
INSERT INTO ingredient_equivalence (ingredient_id, equivalence_group_id)
SELECT i.id, g.id
FROM ingredient i
JOIN ingredient_equivalence_group g ON g.name = 'legume_cuisine'
WHERE i.name IN ('Tomate','Poivron','Courgette','Oignon');

-- Céréales
INSERT INTO ingredient_equivalence (ingredient_id, equivalence_group_id)
SELECT i.id, g.id
FROM ingredient i
JOIN ingredient_equivalence_group g ON g.name = 'feculent_cereal'
WHERE i.name IN ('Riz blanc','Pates de ble','Boulgour','Quinoa');

-- Tubercules
INSERT INTO ingredient_equivalence (ingredient_id, equivalence_group_id)
SELECT i.id, g.id
FROM ingredient i
JOIN ingredient_equivalence_group g ON g.name = 'feculent_tubercule'
WHERE i.name IN ('Pommes de terre');

-- Viandes blanches
INSERT INTO ingredient_equivalence (ingredient_id, equivalence_group_id)
SELECT i.id, g.id
FROM ingredient i
JOIN ingredient_equivalence_group g ON g.name = 'viande_blanche'
WHERE i.name IN ('Poulet');

-- Viandes rouges
INSERT INTO ingredient_equivalence (ingredient_id, equivalence_group_id)
SELECT i.id, g.id
FROM ingredient i
JOIN ingredient_equivalence_group g ON g.name = 'viande_rouge'
WHERE i.name IN ('Boeuf','Porc');

-- Poissons maigres
INSERT INTO ingredient_equivalence (ingredient_id, equivalence_group_id)
SELECT i.id, g.id
FROM ingredient i
JOIN ingredient_equivalence_group g ON g.name = 'poisson_maigre'
WHERE i.name IN ('Cabillaud');

-- Poissons gras
INSERT INTO ingredient_equivalence (ingredient_id, equivalence_group_id)
SELECT i.id, g.id
FROM ingredient i
JOIN ingredient_equivalence_group g ON g.name = 'poisson_gras'
WHERE i.name IN ('Saumon','Thon');

INSERT INTO ingredient_equivalence (ingredient_id, equivalence_group_id)
SELECT i.id, g.id
FROM ingredient i
JOIN ingredient_equivalence_group g ON g.name = 'fruit_cru'
WHERE i.name IN ('Pomme','Banane','Orange','Fraise','Poire');
