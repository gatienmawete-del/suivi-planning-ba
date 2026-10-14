#!/usr/bin/env node
/**
 * Crée les utilisateurs initiaux dans Supabase via l'API admin.
 *
 * Prérequis:
 *   - Avoir exécuté la migration 001_initial_schema.sql dans le projet Supabase
 *   - Avoir configuré .env.local avec:
 *       NEXT_PUBLIC_SUPABASE_URL
 *       SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   node scripts/seed-users.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Charger .env.local manuellement
try {
  const env = readFileSync(join(__dirname, "..", ".env.local"), "utf-8");
  for (const line of env.split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  // ignore
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis dans .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Admins par défaut
const ADMINS = new Set(["Audrey MABIALA", "Karhyt Mboungou"]);

// Mot de passe temporaire par défaut (à changer à la 1ère connexion)
const DEFAULT_PASSWORD = "ChangeMe123!";

function slugify(s) {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "")
    .toLowerCase();
}

function emailOf(name) {
  return slugify(name) + "@ba-tracker.local";
}

async function main() {
  // Lire users-data.json (committé) ou data.json (généré)
  let dataPath = join(__dirname, "users-data.json");
  try {
    readFileSync(dataPath);
  } catch {
    dataPath = join(__dirname, "data.json");
  }
  const data = JSON.parse(readFileSync(dataPath, "utf-8"));
  const users = data.users;

  console.log(`\n🚀 Création de ${Object.keys(users).length} utilisateurs...\n`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const [fullName, info] of Object.entries(users)) {
    const email = emailOf(fullName);
    const role = ADMINS.has(fullName) ? "admin" : "ba";
    const serviceLine = info.service_line || "BA";

    try {
      // Vérifier si l'user existe déjà
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existing) {
        console.log(`  ⏭  ${fullName}  (déjà présent)`);
        skipped++;
        continue;
      }

      const { data: createdUser, error } = await supabase.auth.admin.createUser({
        email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: fullName, role, service_line: serviceLine },
      });

      if (error) throw error;

      // Forcer rôle + service_line (le trigger a mis des valeurs par défaut)
      await supabase
        .from("profiles")
        .update({ full_name: fullName, role, service_line: serviceLine })
        .eq("id", createdUser.user.id);

      console.log(`  ✅ ${fullName}  (${role})  ${email}`);
      created++;
    } catch (e) {
      console.error(`  ❌ ${fullName}: ${e.message ?? e}`);
      errors++;
    }
  }

  console.log(`\n📊 Résumé : ${created} créés · ${skipped} déjà existants · ${errors} erreurs`);
  console.log(`\n🔑 Mot de passe par défaut : ${DEFAULT_PASSWORD}`);
  console.log(`   (Chaque utilisateur devra le changer à sa première connexion)\n`);
  console.log(`➡  Admin par défaut :`);
  for (const name of ADMINS) {
    if (users[name]) console.log(`   • ${name}  →  ${emailOf(name)}`);
  }
  console.log();
}

main().catch((e) => {
  console.error("💥 Erreur fatale:", e);
  process.exit(1);
});
