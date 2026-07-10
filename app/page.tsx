import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-zinc-100 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-lg font-semibold text-zinc-900">Aurea Educação</span>
          <Link
            href="/login"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Acessar
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="mb-4 rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-500">
          Exclusivo para alunos da Aurea Educação
        </p>
        <h1 className="max-w-2xl text-5xl font-bold leading-tight tracking-tight text-zinc-900">
          Seu portfólio profissional em minutos
        </h1>
        <p className="mt-6 max-w-xl text-lg text-zinc-500">
          Ferramenta que transforma seu brandbook e currículo em um site
          profissional com domínio próprio — sem precisar saber de tecnologia.
        </p>

        <div className="mt-8">
          <Link
            href="/login"
            className="rounded-xl bg-zinc-900 px-8 py-3.5 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            Criar meu portfólio
          </Link>
        </div>

        <p className="mt-6 text-xs text-zinc-400">
          O único custo é o domínio: ~R$&nbsp;50–85/ano, registrado no seu nome.
        </p>

        <div className="mt-20 grid max-w-3xl gap-6 sm:grid-cols-3">
          {[
            { n: "01", title: "Brandbook", desc: "Envie seu material de identidade visual e nossa IA extrai cores, fontes e posicionamento." },
            { n: "02", title: "Conteúdo", desc: "Foto, bio gerada por IA a partir do seu currículo, projetos e contatos." },
            { n: "03", title: "Publica", desc: "Escolha o template, registre seu domínio e publique com um clique." },
          ].map((step) => (
            <div key={step.n} className="rounded-xl border border-zinc-100 bg-zinc-50 p-6 text-left">
              <span className="font-mono text-xs text-zinc-400">{step.n}</span>
              <h3 className="mt-2 font-semibold text-zinc-900">{step.title}</h3>
              <p className="mt-1 text-sm text-zinc-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-zinc-100 px-6 py-4 text-center text-xs text-zinc-400">
        Aurea Educação &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}
