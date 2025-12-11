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

* [x] add a user logic (still allow full anonymous access)
* [x] Database change: add user table, add a profile table (user_id, password_hash, name, type(me, familly, friend, freeform string),and a json constraints column). A user may have multiples profiles, with at least one that is himself. The constraint will be stored as is in json and will be directly appliable to the current constraint logic.
* [x] auth strategy must be as simple as possible for now, cookie based, with a session table and a session storage made available. (the option bcryptjs with cookies based session seems fine to me)
* [x] Profile constraints should be editable, and follow current constraints logic and display is provided in index page right now
* [x] add a profile page: manage constraints for user, manage familly and friends and their constraints. 
    * [x] when a user is logged in, the index page should preselect himself as participant to the meal, and allow to add familly members and friends as well. 
    * [x] while constraints are preloaded, they should be editable (locally, not in the database) and some can be added on the fly (like I want to eat strawberries today)
* [x] add a login page
* [x] add a register page
* [x] add a logout button
* [x] add a login button
* [x] add a register button
* [x] add a user menu in the top right
* [x] when user is not logged in, the index page should still allow to generate menu, only with guest, as it is right now. 

## v0.0.7 Symptoms management

* [ ] add a symptoms table related to user: it must contains following informations: name (with a picker for previous symptoms), begin, last update and end date, severity (as a slider of 1-10), comments, color (to be used for display). if possible, checks if the name has already been used for this user, and if so find the same color as the previous one. 
* [ ] just give me the migration, i'll have it executed.
* [ ] add a symptoms page: manage symptoms for user, add new symptoms, mark running symptoms as ended, edit severity and comments, review symptoms history. 
* [ ] this page is only accessible when logged in. 
* [ ] Running symptoms are displayed in the index page, with a color bar matching the severity, with the option to mark it either as ended or as ongoing. If the symptom has been recently(< 30min) updated and not ended, consider it as ongoing (remove the form in this case)
* [ ] add a short hand symptom form in the index page when logged in. 
* [ ] add a link to the symptoms page in the user menu.

## v0.1

