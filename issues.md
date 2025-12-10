# Issues

## Critical

* [x] pages/meal.vue: it never selects a protein for the meal.
* [x] pages/meal.vue: each recipe (menu item) should be expandable to show more details (all ingredients and their preparation)
* [x] pages/meal.vue: it doesn't provide a selection of each menu's item (it only shows the first one ?) 
* [ ] pages/meal.vue: Some ingredients of each menu items can be switched with other equivalent ingredients that match the constraints.
* [x] pages/meal.vue: no constraints are displayed there. There must be a section that details the constraints. 
* [x] pages/meal.vue: constraints are displayed as "guest x: constraint --" without any indication of the attribute name.
* [x] pages/meal.vue: constraints are not followed
* [x] pages/ingredients.vue: error: Columns require an id when using a non-string header 

## Important

* [ ] pages/admin.vue: sometimes, the page while correctly displayed, isn't filled with appropriate date (no recipes, no ingredients). I need to reload the page (ctrl+r) for them to appear.
* [ ] pages/recipes.vue: when creating a new recipe: clicking on any components triggers the poping up of a modal with nothing in it.
* [ ] pages/recipes.vue: there is no preparation field on the recipe ingredient. 
    * [ ] might be good to move the preparation from ingredient toward a true table affixed to the recipe (so that a recipe may have multiple preparation steps)
    * [ ] preparation steps must contains: link to ingredient(s), a text, a duration (in minutes).
* [ ] pages/recipes.vue: recipes aren't editable. 
* [ ] pages/ingredients.vue: expects ingredients not to be editable as well...
* [ ] pages/index.vue: allow to rename guests

## Trivial

* [ ] pages/index.vue: constraint's slider color display issue (only green when ++, doesn't show any other color, like red when --). Text is correctly displayed and colored. 

## Wishlist

