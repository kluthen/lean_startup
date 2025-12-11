# TODO

## Issues

### Critical

* [x] pages/meal.vue: it never selects a protein for the meal.
* [x] pages/meal.vue: each recipe (menu item) should be expandable to show more details (all ingredients and their preparation)
* [x] pages/meal.vue: it doesn't provide a selection of each menu's item (it only shows the first one ?) 
* [x] pages/meal.vue: Some ingredients of each menu items can be switched with other equivalent ingredients that match the constraints.
* [x] pages/meal.vue: no constraints are displayed there. There must be a section that details the constraints. 
* [x] pages/meal.vue: constraints are displayed as "guest x: constraint --" without any indication of the attribute name.
* [x] pages/meal.vue: constraints are not followed
* [x] pages/ingredients.vue: error: Columns require an id when using a non-string header 

### Important

* [x] pages/admin.vue: sometimes, the page while correctly displayed, isn't filled with appropriate date (no recipes, no ingredients). I need to reload the page (ctrl+r) for them to appear.
* [x] pages/recipes.vue: when creating a new recipe: clicking on any components triggers the poping up of a modal with nothing in it.
* [x] pages/recipes.vue: recipes aren't editable. 
* [x] pages/ingredients.vue: expects ingredients not to be editable as well...
* [x] pages/index.vue: allow to rename guests

### Trivial

* [x] pages/index.vue: constraint's slider color display issue (only green when ++, doesn't show any other color, like red when --). Text is correctly displayed and colored. 

## v0.0.5 Production

* [ ] Review prod deployement procedure: at the moment, it's a git clone, a build and a npm run dev ... While not ideal, it work-ish (had to install psql and load migrations manually.)
* [ ] Add migration management (simplistic): + migration table, check migrations files on hand and see if they have been added to the database. If not, run them.
* [ ] See how to run everything in prod (as opposed to using npm run dev) 
* [ ] Use coolify to deploy the app
* [x] ensure the whole app is in french (some elements are in english, and even ill named even in english.)
* [x] Componentify the app (meal.vue is a mess)

## v0.0.6 User Profile management

* [ ] add a user logic (still allow full anonymous access)
* [ ] Database change: add user table, add a profile table (user_id, password_hash, name, type(me, familly, friend, freeform string),and a json constraints column). A user may have multiples profiles, with at least one that is himself. The constraint will be stored as is in json and will be directly appliable to the current constraint logic.
* [ ] auth strategy must be as simple as possible for now, cookie based, with a session table and a session storage made available. (the option bcryptjs with cookies based session seems fine to me)
* [ ] Profile constraints should be editable, and follow current constraints logic and display is provided in index page right now
* [ ] add a profile page: manage constraints for user, manage familly and friends and their constraints. 
    * [ ] when a user is logged in, the index page should preselect himself as participant to the meal, and allow to add familly members and friends as well. 
    * [ ] while constraints are preloaded, they should be editable (locally, not in the database) and some can be added on the fly (like I want to eat strawberries today)
* [ ] add a login page
* [ ] add a register page
* [ ] add a logout button
* [ ] add a login button
* [ ] add a register button
* [ ] add a user menu in the top right
* [ ] when user is not logged in, the index page should still allow to generate menu, only with guest, as it is right now. 


## v0.1

