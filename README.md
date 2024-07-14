
# Projet de Gestion d'Inventaire

## Prérequis

Assurez-vous d'avoir les outils suivants installés sur votre machine :

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Ruby](https://www.ruby-lang.org/en/documentation/installation/)
- [Node.js](https://nodejs.org/en/download/)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)

## Installation

Clonez le repository et installez les dépendances pour le backend et le frontend.

```bash
git clone <URL_DU_REPO>
cd <NOM_DU_REPO>
```

### Backend

1. Naviguez dans le dossier du backend et installez les dépendances.

```bash
bundle install
```

2. Configurez la base de données.

```bash
rails db:create
rails db:migrate
rails db:seed
```

3. Démarrez le serveur backend.

```bash
docker-compose up --build
```

Le backend sera accessible sur `http://localhost:3000`.

### Frontend

1. Naviguez dans le dossier du frontend et installez les dépendances.

```bash
cd frontend
npm install
```

2. Démarrez le serveur Angular.

```bash
ng serve
```

Le frontend sera accessible sur `http://localhost:4200`.


3. Démarrez le serveur WebSocket.

```bash
websocketd --port=8080 ./inventory.rb
```


## Utilisation

1. Ouvrez votre navigateur et accédez à `http://localhost:4200` pour voir l'application frontend.
2. Le backend est accessible via l'URL `http://localhost:3000`.

## Commandes Utiles

### Backend

- **Démarrer le serveur** : `docker-compose up --build`
- **Arrêter le serveur** : `docker-compose down`
- **Accéder à la console Rails** : `docker-compose run web rails console`

### Frontend

- **Démarrer le serveur Angular** : `ng serve`
- **Compiler l'application pour la production** : `ng build --prod`
- **Exécuter les tests unitaires** : `ng test`
- **Exécuter les tests end-to-end** : `ng e2e`

## Développement

Pour le développement, vous pouvez lancer le backend et le frontend simultanément et accéder à l'application via `http://localhost:4200`.

Assurez-vous que les changements dans le code backend sont reflétés en redémarrant le serveur si nécessaire.

