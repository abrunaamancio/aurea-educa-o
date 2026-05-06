export interface PortfolioData {
  id: string
  template_id: string
  domain: string
  brandbook: {
    colors: string[]
    fonts: string[]
    logo_light_url: string | null
    logo_dark_url: string | null
    slogan: string | null
    voice_tone: string | null
    market_sector: string | null
  } | null
  hero_section: {
    photo_url: string | null
    background_url: string | null
    name: string | null
    surname: string | null
    cta_text: string | null
  } | null
  about_section: {
    bio_text: string | null
  } | null
  projects: {
    id: string
    title: string
    cover_image_url: string | null
    order: number
    active: boolean
  }[]
  cases_section: {
    active: boolean
    embed_type: "upload" | "link" | null
    file_url: string | null
    embed_url: string | null
  } | null
  footer_section: {
    email: string | null
    whatsapp: string | null
    linkedin_url: string | null
  } | null
}

export function buildCssVariables(brandbook: PortfolioData["brandbook"]): string {
  if (!brandbook) return ""

  const colors = brandbook.colors ?? []
  const [c1, c2, c3, c4, c5] = colors

  return `
    --color-1: ${c1 ?? "#111827"};
    --color-2: ${c2 ?? "#374151"};
    --color-3: ${c3 ?? "#6b7280"};
    --color-4: ${c4 ?? "#d1d5db"};
    --color-5: ${c5 ?? "#f9fafb"};
    --color-black: #000000;
    --color-white: #ffffff;
  `.trim()
}
