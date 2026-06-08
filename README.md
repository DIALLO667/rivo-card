# 💼 Rivo-Card - Plateforme de Cartes de Visite Digitales NFC

<div align="center">

![Rivo-Card Logo](https://img.shields.io/badge/Rivo-Card-Cartes%20NFC-D4AF37?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)

Plateforme professionnelle de gestion de cartes de visite digitales NFC avec panel administrateur luxueux et pages publiques au design glassmorphism.

[Fonctionnalités](#-fonctionnalités) • [Installation](#-installation) • [Technologies](#️-technologies) • [Documentation](#-documentation)

</div>

---

## ✨ Fonctionnalités

### 🎛️ Panel Administrateur (Mode Sombre Luxueux)

- **Authentification sécurisée** : Double système (JWT classique + Google OAuth)
- **Gestion complète des profils** : CRUD complet avec interface intuitive
- **Filtres intelligents** :
  - Tous les profils
  - Expire dans 30 jours (pour les abonnements annuels)
  - Profils archivés
- **Recherche en temps réel** : Par nom ou métier
- **Personnalisation avancée** :
  - Color pickers pour couleur primaire et secondaire
  - Upload d'images pour photo/logo
  - Tous les champs de contact (téléphone, WhatsApp, site web, adresse)
  - Réseaux sociaux (Instagram, Facebook, LinkedIn, TikTok, YouTube)
- **Gestion d'abonnements** :
  - Abonnements annuels automatiques
  - Badges visuels pour profils expirant bientôt
  - Boutons WhatsApp de renouvellement automatique
- **Archivage intelligent** : Les profils archivés redirigent vers une page "Service Suspendu"

### 🌐 Pages Profils Publiques (Mobile-First)

- **Design Glassmorphism** : Effet de verre transparent moderne et élégant
- **Gradient personnalisable** : Couleurs définies par l'administrateur
- **Animations fluides** : Framer Motion pour des transitions professionnelles
- **Boutons interactifs** :
  - 📞 Appeler directement (tel:)
  - 💬 WhatsApp (wa.me)
  - 🌐 Site Web
  - 📍 Localisation (Google Maps)
  - 💾 **Téléchargement vCard** (.vcf pour enregistrer dans les contacts)
- **Réseaux sociaux** : Boutons colorés avec gradients (Instagram, Facebook, LinkedIn, TikTok, YouTube)
- **URLs uniques** : Format `nom-code8caracteres` généré automatiquement
- **Performance optimale** : Temps de chargement < 3 secondes

---

## 🛠️ Technologies

### Backend
- **FastAPI** - Framework web Python moderne et rapide
- **MongoDB** - Base de données NoSQL
- **Motor** - Driver MongoDB asynchrone
- **HTTPx** - Client HTTP pour intégration OAuth
- **Python 3.11+**

### Frontend
- **React 19** - Bibliothèque UI
- **React Router** - Navigation
- **Tailwind CSS** - Framework CSS utilitaire
- **Shadcn/UI** - Composants UI modernes
- **Framer Motion** - Animations
- **Axios** - Client HTTP
- **Sonner** - Notifications toast
- **Lucide React** - Icônes

### Authentification
- **JWT** - Authentification classique
- **Google OAuth** - Via Emergent integrations
- **HttpOnly Cookies** - Stockage sécurisé des sessions (7 jours)

---

## 📋 Prérequis

- **Node.js** 18 ou supérieur
- **Python** 3.11 ou supérieur
- **MongoDB** 6 ou supérieur
- **Yarn** (gestionnaire de paquets)

---

## 🚀 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/votre-username/rivo-card.git
cd rivo-card
```

### 2. Configuration Backend

```bash
cd backend

# Créer un environnement virtuel
python -m venv .venv
source .venv/bin/activate  # Sur Windows: .venv\\Scripts\\activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos propres valeurs
```

**backend/.env** :
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=rivo_database
CORS_ORIGINS=http://localhost:3000,https://card-nfc.vercel.app/
```

### 3. Configuration Frontend

```bash
cd ../frontend

# Installer les dépendances
yarn install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos propres valeurs
```

**frontend/.env** :
```env
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=3000
ENABLE_HEALTH_CHECK=false
```

### 4. Lancer MongoDB

```bash
# Via Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Ou via installation locale
mongod --dbpath /chemin/vers/data
```

### 5. Démarrer l'application

**Terminal 1 - Backend** :
```bash
cd backend
source .venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 2 - Frontend** :
```bash
cd frontend
yarn start
```

L'application sera accessible sur **http://localhost:3000**

---

## 📁 Structure du Projet

```
rivo-card/
├── backend/
│   ├── server.py              # Application FastAPI principale
│   ├── requirements.txt       # Dépendances Python
│   ├── .env.example          # Template variables d'environnement
│   └── uploads/              # Dossier pour les images uploadées
│
├── frontend/
│   ├── src/
│   │   ├── pages/            # Pages React
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ProfileForm.jsx
│   │   │   ├── PublicProfile.jsx
│   │   │   └── SuspendedService.jsx
│   │   ├── components/       # Composants réutilisables
│   │   │   ├── ui/          # Composants Shadcn/UI
│   │   │   └── ProtectedRoute.jsx
│   │   ├── App.js           # Routeur principal
│   │   ├── App.css
│   │   └── index.css
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env.example
│
├── .gitignore
├── README.md
└── DEPLOYMENT_GITHUB.md
```

---

## 🎨 Guide de Style

### Couleurs Rivo-Card

- **Or principal** : `#D4AF37`
- **Or clair** : `#EEDC9A`
- **Or foncé** : `#8A7E55`
- **Noir surface** : `#121212`
- **Noir fond** : `#050505`

### Typographie

- **Admin** : Manrope (sans-serif)
- **Headings** : Playfair Display (serif)
- **Public profiles** : Outfit (sans-serif)

---

## 🔐 Sécurité

- ✅ Authentification JWT avec sessions sécurisées
- ✅ Cookies HttpOnly, Secure, SameSite=None
- ✅ Validation des entrées utilisateur
- ✅ Protection CORS configurée
- ✅ Hachage des mots de passe (SHA-256)
- ✅ Sessions expirables (7 jours)

---

## 📊 API Endpoints

### Authentification
```
POST   /api/auth/register       # Inscription
POST   /api/auth/login          # Connexion JWT
POST   /api/auth/session        # Échange session OAuth
GET    /api/auth/me             # Utilisateur actuel
POST   /api/auth/logout         # Déconnexion
```

### Profils
```
GET    /api/profiles                    # Liste profils (avec filtres)
POST   /api/profiles                    # Créer profil
GET    /api/profiles/:id                # Détails profil
PUT    /api/profiles/:id                # Modifier profil
PATCH  /api/profiles/:id/archive        # Archiver/Désarchiver
GET    /api/profiles/public/:link       # Profil public
GET    /api/profiles/:id/vcard          # Télécharger vCard
```

### Upload
```
POST   /api/upload              # Upload image
GET    /api/uploads/:file_id    # Récupérer image
```

---

## 🧪 Tests

### Backend
```bash
cd backend
pytest
```

### Frontend
```bash
cd frontend
yarn test
```

---

## 🚢 Déploiement

### Variables d'environnement de production

**Backend** :
```env
MONGO_URL=mongodb://prod-server:27017
DB_NAME=rivo_production
CORS_ORIGINS=https://card-nfc.vercel.app/
```

**Frontend** :
```env
REACT_APP_BACKEND_URL=https://api.votre-domaine.com
```

### Build de production

```bash
# Frontend
cd frontend
yarn build
# Les fichiers seront dans frontend/build/

# Backend : pas de build nécessaire
```

### Serveurs recommandés

- **Backend** : Uvicorn avec Gunicorn (workers multiples)
- **Frontend** : Nginx ou serveur statique
- **MongoDB** : MongoDB Atlas ou serveur dédié

---

## 📝 Changelog

### Version 1.0.0 (2026-02-03)
- ✅ Panel admin avec authentification double
- ✅ Gestion profils CRUD complète
- ✅ Filtres intelligents et recherche
- ✅ Pages publiques glassmorphism
- ✅ Téléchargement vCard
- ✅ Logique abonnements annuels
- ✅ WhatsApp renouvellement automatique

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## 📄 Licence

Propriétaire - Rivo-Card © 2026. Tous droits réservés.

---

## 📞 Support

Pour toute question ou support :
-- **Email** : contact@rivo-card.com
-- **Site Web** : https://rivo-card.com

---

<div align="center">

**Développé avec ❤️ pour Rivo-Card**

![Made with FastAPI](https://img.shields.io/badge/Made%20with-FastAPI-009688?style=flat-square&logo=fastapi)
![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat-square&logo=react)
![Styled with Tailwind](https://img.shields.io/badge/Styled%20with-Tailwind-38B2AC?style=flat-square&logo=tailwind-css)

</div>