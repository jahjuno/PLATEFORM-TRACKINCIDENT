<img src="https://capsule-render.vercel.app/api?type=waving&height=300&color=gradient&text=TRACK%20INCIDENT%20&fontAlign=50&fontAlignY=43&descAlignY=48&fontSize=40">

Test modification

Ce projet est une _**application web de gestion des incidents**_ conçue pour simplifier le processus d'enregistrement, de suivi et de résolution des incidents. 
L'application automatise la génération de rapports, les notifications par e-mail et le suivi des fichiers RCA, tout en fournissant un tableau de bord interactif pour le suivi des KPIs.

<img alt="Static Badge" src="https://img.shields.io/badge/track_incident-projet_omit-blue">

##test push kaja

# Guide Pas à Pas: Système de Gestion des Incidents

## 1. Prérequis
Avant de commencer, assurez-vous d'avoir:
- Node.js installé (version 16+)
- Un éditeur de code (VS Code recommandé)
- Un compte Supabase (gratuit)

## 2. Configuration de Supabase

### Étape 1: Créer un Projet Supabase
1. Allez sur [Supabase](https://supabase.com)
2. Cliquez sur "New Project"
3. Donnez un nom à votre projet
4. Notez votre mot de passe - vous en aurez besoin plus tard
5. Cliquez sur "Create new project"

### Étape 2: Configuration de la Base de Données
1. Dans votre projet Supabase, allez dans "SQL Editor"
2. Copiez et exécutez les fichiers de migration dans cet ordre:
   - `20250310114835_long_cliff.sql`
   - `20250312055311_rapid_moon.sql`
   - `20250313060456_sparkling_portal.sql`

### Étape 3: Obtenir les Clés API
1. Dans votre projet Supabase:
   - Allez dans "Settings" > "API"
   - Copiez "Project URL"
   - Copiez "anon/public" key

## 3. Configuration du Projet

### Étape 1: Configuration des Variables d'Environnement
1. Créez un fichier `.env` à la racine du projet
2. Ajoutez vos clés Supabase:
   ```
   VITE_SUPABASE_URL=votre_project_url
   VITE_SUPABASE_ANON_KEY=votre_anon_key
   ```

### Étape 2: Installation
1. Ouvrez un terminal
2. Installez les dépendances:
   ```bash
   npm install
   ```
3. Démarrez le serveur:
   ```bash
   npm run dev
   ```

## 4. Utilisation du Système

### Fonctionnalités Principales:

1. **Tableau de Bord** (`/`)
   - Vue d'ensemble des incidents
   - Statistiques en temps réel
   - Graphiques de performance

2. **Création d'Incident** (`/new-incident`)
   - Formulaire de création
   - Choix de priorité (P0 à P4)
   - Attribution d'équipe

3. **Gestion des Incidents**
   - Suivi du statut
   - Mise à jour des informations
   - Documentation des résolutions

### Guide des Priorités:
- P0: Impact critique - Action immédiate requise
- P1: Impact majeur - Résolution urgente
- P2: Impact modéré - Résolution sous 24h
- P3: Impact mineur - Résolution planifiée
- P4: Impact minimal - Basse priorité

### Statuts des Incidents:
- NEW: Incident créé
- IN_PROGRESS: En cours de résolution
- RESOLVED: Résolu
- CLOSED: Fermé et documenté

## 5. Structure des Fichiers

```
src/
├── components/         # Composants React
│   ├── Auth.tsx       # Authentification
│   ├── Dashboard.tsx  # Tableau de bord
│   └── IncidentForm.tsx # Formulaire d'incident
├── contexts/          # Contextes React
│   └── AuthContext.tsx # Gestion de l'auth
├── hooks/             # Hooks personnalisés
│   └── useIncidents.ts # Logique des incidents
├── lib/              # Utilitaires
│   └── supabase.ts   # Client Supabase
└── types/            # Types TypeScript
    └── incident.ts   # Types des incidents
```

## 6. Dépannage

### Problèmes Courants:

1. **Erreur de Connexion Supabase**
   - Vérifiez vos variables d'environnement
   - Assurez-vous que votre projet Supabase est actif

2. **Erreur lors de la Création d'Incident**
   - Vérifiez que tous les champs requis sont remplis
   - Confirmez que la connexion à Supabase est active

3. **Le Tableau de Bord ne se Met pas à Jour**
   - Rafraîchissez la page
   - Vérifiez votre connexion internet

## Support

Pour toute question supplémentaire, n'hésitez pas à:
1. Consulter la documentation Supabase
2. Vérifier les logs dans la console du navigateur
3. Ouvrir une issue sur GitHub
