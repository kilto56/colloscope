# Colloscope Tool MP2I API

Petite API REST pour consulter les groupes, les plannings et les informations de colle du colloscope MP2I.

## API en ligne

L'API est déployée sur Render et accessible ici :

```text
https://colloscope-mwso.onrender.com/
```

Par exemple :

```bash
curl https://colloscope-mwso.onrender.com/
```

## Endpoints

Toutes les réponses sont au format JSON.

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/` | Vérifie que l'API est disponible |
| `GET` | `/eleve/:nom/:prenom` | Renvoie le planning d'un élève |
| `GET` | `/groupe/:num` | Renvoie les élèves d'un groupe |
| `GET` | `/semaine/:num` | Renvoie le planning de tous les groupes pour une semaine |
| `GET` | `/code/:code` | Renvoie les informations d'un code de colle |
| `GET` | `/search` | Recherche des créneaux avec plusieurs filtres |

### Vérifier l'état de l'API

```bash
curl https://colloscope-mwso.onrender.com/
```

Réponse :

```json
{ "success": "Colloscope Tool MP2I API V1" }
```

### Rechercher un élève

Les paramètres `nom` et `prenom` doivent correspondre exactement aux données enregistrées.

```bash
curl https://colloscope-mwso.onrender.com/eleve/Dupont/Jean
```

La réponse contient le numéro du groupe et le planning organisé par semaine :

```json
[
  "1",
  {
    "semaine1": [
      {
        "matiere": "Maths",
        "code": "M01"
      }
    ]
  }
]
```

### Consulter un groupe

```bash
curl https://colloscope-mwso.onrender.com/groupe/1
```

La réponse est un tableau d'élèves du groupe.

### Consulter une semaine

Le numéro de semaine doit être compris entre `1` et `14`.

```bash
curl https://colloscope-mwso.onrender.com/semaine/3
```

La réponse est organisée par groupe (`groupe1`, `groupe2`, etc.).

### Consulter un code de colle

```bash
curl https://colloscope-mwso.onrender.com/code/M01
```

La réponse contient le code, la matière et les informations du créneau, par exemple le professeur et la salle.

### Effectuer une recherche

Les filtres de `/search` sont optionnels et peuvent être combinés. Une recherche sans filtre renvoie tous les créneaux.

| Paramètre | Description |
| --- | --- |
| `eleveQuery` | Recherche partielle sur le nom et le prénom d'un élève |
| `numGroupe` | Numéro exact du groupe |
| `profQuery` | Recherche partielle sur le nom du professeur |
| `salleQuery` | Recherche partielle sur la salle |
| `semaine` | Numéro exact de semaine |
| `code` | Code exact du créneau |

Exemples :

```bash
# Tous les créneaux du groupe 2 pendant la semaine 4
curl "https://colloscope-mwso.onrender.com/search?numGroupe=2&semaine=4"

# Tous les créneaux d'une salle
curl "https://colloscope-mwso.onrender.com/search?salleQuery=F204"

# Recherche combinée par élève et par professeur
curl "https://colloscope-mwso.onrender.com/search?eleveQuery=Jean%20Dupont&profQuery=Martin"
```

Chaque résultat de `/search` contient notamment `numGroupe`, `semaine`, `matiere`, `code`, ainsi que les informations du créneau.

## Erreurs

Les erreurs sont renvoyées en JSON avec un code HTTP `404` :

```json
{ "error": "Eleve non trouvé(e)" }
```

Les messages possibles concernent notamment un élève, un groupe, une semaine ou un code inexistant.

## Données

L'API charge ses données depuis :

- `groupes.json` : élèves et groupes ;
- `programmes.json` : planning par groupe et par semaine ;
- `creneaux.json` : codes, matières et informations des créneaux.

Après modification de ces fichiers, redémarrer le serveur pour recharger les données.