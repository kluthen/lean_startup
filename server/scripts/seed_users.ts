import { sql } from '../utils/db.js'
import bcrypt from 'bcryptjs'

// Helper to get attribute ID by type and value
async function getAttributeId(type: string, value: string) {
    const [attr] = await sql`SELECT id FROM food_attribute WHERE type = ${type} AND value = ${value}`
    return attr?.id
}

async function seed() {
    console.log('Seeding users...')

    // 1. Family Manager
    // Password: password123
    const hash1 = await bcrypt.hash('password123', 10)
    const [user1] = await sql`
        INSERT INTO app_user (username, password_hash)
        VALUES ('FamilyManager', ${hash1})
        RETURNING id
    `
    // Profiles
    // Me: No specific constraints
    await sql`
        INSERT INTO profile (user_id, name, type, constraints)
        VALUES (${user1.id}, 'Me', 'me', '{}'::jsonb)
    `
    // Partner: Gluten intolerance? (We have 'composant:gluten')
    const glutenId = await getAttributeId('composant', 'gluten')
    if (glutenId) {
        await sql`
            INSERT INTO profile (user_id, name, type, constraints)
            VALUES (${user1.id}, 'Partner', 'family', ${sql.json({ [glutenId]: 0 })})
        `
    }
    // Kid: Dislikes "legume_vert" (Vegetables)
    const greenVegId = await getAttributeId('origine', 'legume') // or 'legume_vert' group? 
    // Wait, constraints are on attributes? Yes.
    // Let's use 'origine:legume' as dislike.
    const vegId = await getAttributeId('origine', 'legume')
    if (vegId) {
        await sql`
            INSERT INTO profile (user_id, name, type, constraints)
            VALUES (${user1.id}, 'Kid', 'family', ${sql.json({ [vegId]: 0 })}) 
        `
    }

    // 2. Fitness Freak
    // Password: gymlife
    const hash2 = await bcrypt.hash('gymlife', 10)
    const [user2] = await sql`
        INSERT INTO app_user (username, password_hash)
        VALUES ('FitnessFreak', ${hash2})
        RETURNING id
    `
    // Me: Prefer Protein (composant:proteine_animale)
    const proteinId = await getAttributeId('composant', 'proteine_animale')
    if (proteinId) {
        await sql`
            INSERT INTO profile (user_id, name, type, constraints)
            VALUES (${user2.id}, 'Me', 'me', ${sql.json({ [proteinId]: 3 })}) -- ++ preference
        `
    }

    // 3. Vegan Couple
    // Password: goplants
    const hash3 = await bcrypt.hash('goplants', 10)
    const [user3] = await sql`
        INSERT INTO app_user (username, password_hash)
        VALUES ('VeganCouple', ${hash3})
        RETURNING id
    `
    // Me: No animal protein
    const animalProteinId = await getAttributeId('composant', 'proteine_animale')
    // Also Origin:Viande, Origin:Poisson
    const meatId = await getAttributeId('origine', 'viande')
    const fishId = await getAttributeId('origine', 'poisson')

    const veganConstraints: any = {}
    if (animalProteinId) veganConstraints[animalProteinId] = 0 // Interdit
    if (meatId) veganConstraints[meatId] = 0
    if (fishId) veganConstraints[fishId] = 0

    await sql`
        INSERT INTO profile (user_id, name, type, constraints)
        VALUES (${user3.id}, 'Me', 'me', ${sql.json(veganConstraints)})
    `
    await sql`
        INSERT INTO profile (user_id, name, type, constraints)
        VALUES (${user3.id}, 'Partner', 'family', ${sql.json(veganConstraints)})
    `

    console.log('Done.')
    await sql.end()
}

seed().catch(console.error)
