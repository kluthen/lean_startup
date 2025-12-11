import { sql } from '../utils/db.js'

const SYMPTOMS_POOL = [
    { name: 'Headache', color: 'red' },
    { name: 'Bloating', color: 'orange' },
    { name: 'Fatigue', color: 'indigo' },
    { name: 'Anxiety', color: 'violet' },
    { name: 'Muscle Pain', color: 'red' },
    { name: 'Nausea', color: 'green' },
    { name: 'Insomnia', color: 'gray' },
    { name: 'Stomach Ache', color: 'yellow' }
]

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

async function seed() {
    console.log('Seeding symptoms...')

    // 1. Get Users
    const users = await sql`
        SELECT id, username FROM app_user 
        WHERE username IN ('FamilyManager', 'FitnessFreak', 'VeganCouple')
    `

    const userMap = users.reduce((acc: any, u: any) => {
        acc[u.username] = u.id
        return acc
    }, {})

    // 2. Define probabilities (chance per day to START a new symptom)
    const configs = [
        { username: 'FamilyManager', prob: 0.05 }, // Light
        { username: 'FitnessFreak', prob: 0.30 }, // Moderate
        { username: 'VeganCouple', prob: 0.90 }   // Heavy
    ]

    const endDate = new Date()
    const startDate = new Date()
    startDate.setFullYear(startDate.getFullYear() - 1)

    let totalInserted = 0

    for (const config of configs) {
        const userId = userMap[config.username]
        if (!userId) {
            console.warn(`User ${config.username} not found, skipping.`)
            continue
        }

        console.log(`Generating symptoms for ${config.username}...`)
        let currentDate = new Date(startDate)

        while (currentDate <= endDate) {
            if (Math.random() < config.prob) {
                // Create a symptom
                const sym = randomItem(SYMPTOMS_POOL)
                const duration = randomInt(1, 5) // 1-5 days
                const severity = randomInt(1, 10)

                const beginDate = new Date(currentDate)
                const endTimestamp = new Date(currentDate)
                endTimestamp.setDate(endTimestamp.getDate() + duration)

                // Ensure end date doesn't exceed "now" if we want closed symptoms.
                // Or maybe some are open? Let's close them all for history, except maybe very recent ones.
                const isOngoing = endTimestamp > endDate && Math.random() > 0.5
                const finalEndDate = isOngoing ? null : endTimestamp

                await sql`
                    INSERT INTO symptoms (
                        user_id, name, color, severity, begin_date, end_date, comments
                    ) VALUES (
                        ${userId}, 
                        ${sym.name}, 
                        ${sym.color}, 
                        ${severity}, 
                        ${beginDate}, 
                        ${finalEndDate},
                        ${isOngoing ? 'Still feeling it' : 'Recovered'}
                    )
                `
                totalInserted++
            }
            currentDate.setDate(currentDate.getDate() + 1)
        }
    }

    console.log(`Done. Inserted ${totalInserted} symptoms.`)
    await sql.end()
}

seed().catch(console.error)
