# Specification

## Contexte

Nous construisons une application qui permettra aux utilisateurs de créer leur repas en fonction des contraintes alimentaire de chacun. 
* on limite l'aspect gestion utilisateur, et on se concentre sur la génération d'assiette. 
* on va considéré dans un premier temps que l'assiete est composé des elements suivants: 
    * proteine
    * feculent
    * accompagnement
    * sauce 
* l'utilisateur va fournir toute les contraintes qu'il veux qui soient respectées: 
    * les contraintes sont pondérées: je veux absoluement, je prefere, je ne prefere pas, je ne veux absolument pas. 
    * associé a un element: 
        * ingredient (par exemple: sel, oeuf, ...)
        * origine (par exemple: porc, poisson, viande, etc...)
        * composant (par exemple: lactose, ... )
        * fonctionnel (par exemple: épices, ...)
        * préparation ( par exemple: lait cru )
* les recettes en base seront dédié a chacun des elements de l'assiette
* les ingredients qui la composent devront:
  * être suffisament exhaustif pour pouvoir être recherché via les critères utilisateurs. 
  * pouvoir être interchangeable avec une liste d'autres ingredients similaire quand acceptable.
* certaines recettes sont des compositions de plusieurs recettes (par exemple: une sauce peut être sur une base de sauce blanche avec une recette complementaire)

## Use case minimal

### Utilisateur 

Un utilisateur veux créer un repas pour le lendemain soir, où il y aura plusieurs personnes présentes dont une femme enceinte, une personne allergique au gluten. Il veux pourtant que le repas soit agréable et identique pour tous. 

Il se connecte a l'application, entre les préférences de chacun, et compose l'assiette avec les suggestions faites par l'application, et peux faire varier certains elements selon les gouts. Il en récupère une liste de course annotée avec les choses sur lequel il y a des contraintes. (par exemple, bien rappelé de controlé l'absence de gluten, ou de lait cru)
Il récupère aussi les recettes pour chaque elements de l'assiette. 

### Administrateur

Il doit y avoir une vue administrateur dédié pour remplir la base de donnée d'ingrédients, de recettes et de leur attributs associés. 

## Structure du site 

* page d'accueil
  * formulaire de selection des contraintes (positives comme négatives)
    * pour chaque contrainte, on a un slider (++ + - --)
    * l'utilisateur peux etiquetté la contrainte a un invité pour son repas (a titre informatif)
    * Le formulaire validé: 
      * le site calcule les options possibles pour remplir l'assiette et propose ensuite de choisir des options parmis les 4 elements majeur de l'assiette: proteine, feculent, accompagnement, sauce
      * Pour chaque element, le site propose les options, et permet a l'utilisateur d'en choisir. Eventuellement si des ingredients sont interchangeables, le site les propose.
      * L'utilisateur fait sa selection (choix de la recette et des variations)
        * le site genère une liste de course adaptée avec la nomenclature des ingredients et contrainte associée aux invités. 
        * le site genère les recettes pour chaque element de l'assiette
* un accès a la liste des recettes, permettant CRUD
* un accès a la liste des ingredients, permettant CRUD






