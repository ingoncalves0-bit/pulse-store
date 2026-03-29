import { promises as fs } from "fs";
import path from "path";

type Produto = {
  id: number;
  nome: string;
  imagem: string;
  categoria: string;
  destaque: string;
};

const numeroWhatsApp = "5551981710738";
const nomeLoja = "Pulse Store";

function formatarNomeArquivo(nomeArquivo: string) {
  const semExtensao = nomeArquivo.replace(/\.[^/.]+$/, "");

  return semExtensao
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(" ");
}

function formatarCategoria(nomePasta: string) {
  return nomePasta
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(" ");
}

function criarDestaque(index: number) {
  const destaques = [
    "Disponível",
    "Em catálogo",
    "Consulte tamanhos",
    "Peça em destaque",
  ];

  return destaques[index % destaques.length];
}

async function lerProdutosDaPasta() {
  const pastaBase = path.join(process.cwd(), "public", "produtos");
  const produtos: Produto[] = [];

  try {
    const categorias = await fs.readdir(pastaBase, { withFileTypes: true });
    let contador = 1;

    for (const categoria of categorias) {
      if (!categoria.isDirectory()) continue;

      const nomeCategoria = formatarCategoria(categoria.name);
      const caminhoCategoria = path.join(pastaBase, categoria.name);
      const arquivos = await fs.readdir(caminhoCategoria, { withFileTypes: true });

      for (const arquivo of arquivos) {
        if (!arquivo.isFile()) continue;

        const extensaoValida = /\.(jpg|jpeg|png|webp)$/i.test(arquivo.name);
        if (!extensaoValida) continue;

        produtos.push({
          id: contador++,
          nome: formatarNomeArquivo(arquivo.name),
          imagem: `/produtos/${categoria.name}/${arquivo.name}`,
          categoria: nomeCategoria,
          destaque: criarDestaque(contador),
        });
      }
    }

    return produtos;
  } catch {
    return [];
  }
}

export default async function Home() {
  const produtos = await lerProdutosDaPasta();

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_30%),linear-gradient(to_bottom,rgba(255,255,255,0.03),rgba(255,255,255,0))]" />

        {/* HEADER */}
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          
          {/* LOGO + NOME */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Pulse Store"
              className="h-10 w-10 object-contain"
            />

            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/40">
                Catálogo premium
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                {nomeLoja}
              </h1>
            </div>
          </div>

          {/* BOTÃO WHATS */}
          <a
            href={`https://wa.me/${numeroWhatsApp}`}
            target="_blank"
            className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur transition hover:bg-white hover:text-neutral-900"
          >
            Chamar no WhatsApp
          </a>
        </header>

        {/* HERO */}
        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-400/20 bg-pink-500/10 px-4 py-2 text-xs font-medium text-pink-200">
              <span className="h-2 w-2 rounded-full bg-pink-400" />
              Peças selecionadas da {nomeLoja}
            </div>

            <h2 className="mt-6 max-w-3xl text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
              Escolha sua peça e informe o tamanho no WhatsApp.
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/65 md:text-lg">
              O catálogo lê automaticamente as fotos dentro da pasta de produtos.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#catalogo"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-900"
              >
                Ver catálogo
              </a>

              <a
                href={`https://wa.me/${numeroWhatsApp}`}
                target="_blank"
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white"
              >
                Comprar agora
              </a>
            </div>
          </div>

          {/* IMAGENS DESTAQUE */}
          <div className="grid grid-cols-2 gap-4">
            {produtos.slice(0, 4).map((produto, index) => (
              <div
                key={produto.id}
                className={`${index === 1 ? "mt-10" : ""} ${index === 2 ? "-mt-8" : ""} overflow-hidden rounded-[2rem]`}
              >
                <img
                  src={produto.imagem}
                  alt={produto.nome}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATÁLOGO */}
      <section id="catalogo" className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-8">
          <h3 className="text-3xl font-semibold md:text-5xl">
            Catálogo
          </h3>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {produtos.map((produto) => (
            <article key={produto.id} className="rounded-[2rem] bg-white/[0.04]">
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={produto.imagem}
                  alt={produto.nome}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-5">
                <h4 className="text-xl font-semibold">{produto.nome}</h4>

                <a
                  href={`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
                    `Olá! Tenho interesse em ${produto.nome}`
                  )}`}
                  target="_blank"
                  className="mt-3 block rounded-xl bg-white px-4 py-3 text-center text-black"
                >
                  Comprar
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}