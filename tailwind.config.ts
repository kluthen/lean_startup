import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
    safelist: [
        {
            pattern: /(border|text|bg)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|gray)-(400|500|600)/
        }
    ]
}
