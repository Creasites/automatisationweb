# Creasites Frontend

Plateforme modulaire d’outils web avec monétisation MVP:
- essai gratuit 5 jours
- abonnement Stripe mensuel (4,99€/mois) ou annuel (49,90€/an, 2 mois offerts)
- blocage des pages et API outils après expiration de l’essai

## Démarrage

```bash
npm install
npm run dev
```

## Variables d’environnement

Créer `frontend/.env.local` à partir de `frontend/.env.example`.

Variables requises pour la monétisation:

- `SESSION_SECRET`: secret de signature des sessions (long et aléatoire)
- `STRIPE_SECRET_KEY`: clé privée Stripe
- `STRIPE_PRICE_MONTHLY_ID`: Price ID mensuel Stripe
- `STRIPE_PRICE_YEARLY_ID`: Price ID annuel Stripe
- `STRIPE_WEBHOOK_SECRET`: secret du webhook Stripe
- `SUPABASE_URL`: URL du projet Supabase (production)
- `SUPABASE_SERVICE_ROLE_KEY`: clé service role Supabase (production)

## Webhook Stripe

Endpoint webhook:

- `POST /api/billing/webhook`

En local (exemple Stripe CLI):

```bash
stripe listen --forward-to localhost:3000/api/billing/webhook
```

## Flux utilisateur MVP

1. Inscription/connexion sur `/connexion`
2. Essai automatique 5 jours
3. Accès aux outils (`/tools/*`, `/api/tools/*`) tant que trial actif
4. Si essai expiré: redirection vers `/tarifs`
5. Paiement Stripe depuis `/tarifs`
6. Confirmation de paiement sur `/facturation/succes` (activation immédiate)
7. Webhook Stripe reste recommandé pour la synchronisation continue (annulation/renouvellement)

## Stockage utilisateurs

Le projet utilise deux modes:

- Sans variables Supabase: stockage local `../data/users.json` (dev/local)
- Avec `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`: stockage PostgreSQL Supabase (production)

### Initialiser la table Supabase

Exécute le script SQL suivant dans l'éditeur SQL Supabase:

- `../backend/users/supabase-schema.sql`
