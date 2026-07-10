import type { PortfolioData } from "@/lib/portfolio"

interface ProjectsProps {
  projects: PortfolioData["projects"]
  brandbook: PortfolioData["brandbook"]
}

export function ProjectsSection({ projects, brandbook }: ProjectsProps) {
  const active = projects.filter((p) => p.active).sort((a, b) => a.order - b.order)
  if (!active.length) return null

  const accentColor = brandbook?.colors?.[0] ?? "#111827"

  return (
    <section id="projetos" className="px-8 py-24 lg:px-20">
      <div className="mx-auto max-w-5xl">
        <div
          className="mb-6 h-1 w-12 rounded"
          style={{ backgroundColor: accentColor }}
        />
        <h2 className="mb-12 text-sm font-semibold uppercase tracking-widest text-zinc-400">
          Projetos
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">
          {active.map((project) => (
            <div
              key={project.id}
              className="group relative overflow-hidden rounded-2xl aspect-video bg-zinc-100"
            >
              {project.cover_image_url && (
                <img
                  src={project.cover_image_url}
                  alt={project.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-xl font-bold leading-snug text-white">
                  {project.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
