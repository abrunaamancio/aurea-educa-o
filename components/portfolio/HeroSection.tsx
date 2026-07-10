import type { PortfolioData } from "@/lib/portfolio"

interface HeroProps {
  hero: PortfolioData["hero_section"]
  brandbook: PortfolioData["brandbook"]
  template: string
}

export function HeroSection({ hero, brandbook, template }: HeroProps) {
  const fullName = [hero?.name, hero?.surname].filter(Boolean).join(" ")
  const slogan = brandbook?.slogan ?? ""
  const cta = hero?.cta_text ?? "Ver projetos"
  const primaryColor = brandbook?.colors?.[0] ?? "#111827"

  if (template === "editorial") {
    return (
      <section className="relative min-h-screen overflow-hidden" id="hero">
        {hero?.photo_url && (
          <img
            src={hero.photo_url}
            alt={fullName}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="relative flex min-h-screen flex-col justify-center px-8 lg:px-16">
          <div className="max-w-xl">
            <h1 className="text-5xl font-bold leading-tight text-white lg:text-7xl">
              {fullName}
            </h1>
            {slogan && (
              <p className="mt-4 text-xl text-white/80">{slogan}</p>
            )}
            <a
              href="#projetos"
              className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-black hover:bg-white/90"
            >
              {cta}
            </a>
          </div>
        </div>
      </section>
    )
  }

  if (template === "corporate") {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center px-8 py-20 text-center" id="hero">
        {hero?.photo_url && (
          <img
            src={hero.photo_url}
            alt={fullName}
            className="mb-6 h-24 w-24 rounded-full object-cover border-4 border-white shadow-md"
          />
        )}
        <h1 className="text-4xl font-bold text-zinc-900 lg:text-5xl">{fullName}</h1>
        {slogan && (
          <p className="mt-3 max-w-lg text-lg text-zinc-500">{slogan}</p>
        )}
        <a
          href="#projetos"
          className="mt-8 inline-block rounded-lg px-8 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: primaryColor }}
        >
          {cta}
        </a>
      </section>
    )
  }

  if (template === "asymmetric") {
    return (
      <section className="flex min-h-screen" id="hero">
        <div className="w-1/3 shrink-0 relative overflow-hidden">
          {hero?.photo_url ? (
            <img
              src={hero.photo_url}
              alt={fullName}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full" style={{ backgroundColor: primaryColor }} />
          )}
        </div>
        <div className="flex flex-1 flex-col justify-center px-12 lg:px-20">
          <h1 className="text-5xl font-bold leading-tight text-zinc-900 lg:text-7xl">
            {fullName}
          </h1>
          {slogan && (
            <p className="mt-4 text-lg text-zinc-500">{slogan}</p>
          )}
          <a
            href="#projetos"
            className="mt-8 inline-block w-fit rounded-lg px-8 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {cta}
          </a>
        </div>
      </section>
    )
  }

  if (template === "geometric") {
    return (
      <section className="flex min-h-screen items-center px-8 lg:px-20" id="hero">
        <div className="flex-1">
          <h1 className="text-5xl font-bold leading-tight text-zinc-900 lg:text-7xl">
            {fullName}
          </h1>
          {slogan && (
            <p className="mt-4 text-xl text-zinc-500">{slogan}</p>
          )}
          <a
            href="#projetos"
            className="mt-8 inline-block rounded-lg px-8 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {cta}
          </a>
        </div>
        {hero?.photo_url && (
          <div className="ml-12 shrink-0">
            <div
              className="h-72 w-72 overflow-hidden"
              style={{
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              }}
            >
              <img
                src={hero.photo_url}
                alt={fullName}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}
      </section>
    )
  }

  // Default: minimal (split layout)
  return (
    <section className="flex min-h-screen items-center px-8 lg:px-20" id="hero">
      <div className="flex-1">
        <h1 className="text-5xl font-bold leading-tight text-zinc-900 lg:text-7xl">
          {hero?.name}
          <br />
          {hero?.surname}
        </h1>
        {slogan && (
          <p className="mt-4 text-xl text-zinc-500">{slogan}</p>
        )}
        <a
          href="#projetos"
          className="mt-8 inline-block rounded-lg px-8 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: primaryColor }}
        >
          {cta}
        </a>
      </div>
      {hero?.photo_url && (
        <div className="ml-12 shrink-0">
          <img
            src={hero.photo_url}
            alt={fullName}
            className="h-64 w-64 rounded-full object-cover border-4 border-zinc-100 shadow-xl"
          />
        </div>
      )}
    </section>
  )
}
