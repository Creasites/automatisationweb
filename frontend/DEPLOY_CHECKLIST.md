# Checklist mise en ligne Creasites

## 1) Préparer Supabase (obligatoire)
1. Créer un projet Supabase
2. Ouvrir SQL Editor
3. Exécuter le script `../backend/users/supabase-schema.sql`
4. Copier:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## 2) Préparer Stripe Live
1. Passer Stripe en mode production
2. Créer le produit + 2 prix:
   - Mensuel 4,99€
   - Annuel 49,90€
3. Copier:
   - `STRIPE_SECRET_KEY` (live)
   - `STRIPE_PRICE_MONTHLY_ID` (live)
   - `STRIPE_PRICE_YEARLY_ID` (live)

## 3) Déployer sur Vercel
1. Importer le repo
2. Root directory: `frontend`
3. Ajouter les variables d'environnement:
   - `SESSION_SECRET`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_MONTHLY_ID`
   - `STRIPE_PRICE_YEARLY_ID`
   - `STRIPE_WEBHOOK_SECRET` (temporairement vide au début)
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Déployer

## 4) Configurer le webhook Stripe live
1. Stripe > Developers > Webhooks > Add endpoint
2. Endpoint: `https://TON-DOMAINE/api/billing/webhook`
3. Events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copier `Signing secret` (`whsec_...`)
5. Remplacer `STRIPE_WEBHOOK_SECRET` sur Vercel
6. Redéployer

## 5) Test final
1. Créer un compte utilisateur
2. Souscrire mensuel
3. Vérifier accès aux outils
4. Vérifier dans Stripe: client + abonnement
5. Tester annuel
