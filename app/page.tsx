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

function formatarTexto(texto: string) {
  return texto
    .replace(/\.[^/.]+$/, "")
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

async function buscarImagensRecursivamente(
  pastaAbsoluta: string,
  pastaRelativa: string,
  categoriaPrincipal: string,
  produtos: Produto[],
  contadorRef: { valor: number }
) {
  const itens = await fs.readdir(pastaAbsoluta, { withFileTypes: true });

  for (const item of itens) {
    const caminhoAbsoluto = path.join(pastaAbsoluta, item.name);
    const caminhoRelativo = `${pastaRelativa}/${item.name}`.replace(/\\/g, "/");

    if (item.isDirectory()) {
      await buscarImagensRecursivamente(
        caminhoAbsoluto,
        caminhoRelativo,
        categoriaPrincipal,
        produtos,
        contadorRef
      );
      continue;
    }

    if (!item.isFile()) continue;

    const extensaoValida = /\.(jpg|jpeg|png|webp)$/i.test(item.name);
    if (!extensaoValida) continue;

    produtos.push({
      id: contadorRef.valor,
      nome: formatarTexto(item.name),
      imagem: caminhoRelativo,
      categoria: formatarTexto(categoriaPrincipal),
      destaque: criarDestaque(contadorRef.valor),
    });

    contadorRef.valor += 1;
  }
}

async function lerProdutosDaPasta() {
  const pastaBase = path.join(process.cwd(), "public", "produtos");
  const produtos: Produto[] = [];
  const contadorRef = { valor: 1 };

  try {
    const categorias = await fs.readdir(pastaBase, { withFileTypes: true });

    for (const categoria of categorias) {
      if (!categoria.isDirectory()) continue;

      const caminhoCategoria = path.join(pastaBase, categoria.name);
      const pastaRelativa = `/produtos/${categoria.name}`;

      await buscarImagensRecursivamente(
        caminhoCategoria,
        pastaRelativa,
        categoria.name,
        produtos,
        contadorRef
      );
    }

    return produtos;
  } catch (erro) {
    console.error("Erro ao ler produtos:", erro);
    return [];
  }
}

export default async function Home() {
  const produtos = await lerProdutosDaPasta();
  const produtosDestaque = produtos.slice(0, 4);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_30%),linear-gradient(to_bottom,rgba(255,255,255,0.03),rgba(255,255,255,0))]" />

        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">
              Catálogo premium
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              {nomeLoja}
            </h1>
          </div>

          <a
            href={`https://wa.me/${numeroWhatsApp}`}
            className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur transition hover:bg-white hover:text-neutral-900"
          >
            Chamar no WhatsApp
          </a>
        </header>

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
              O catálogo lê automaticamente as fotos dentro da pasta de
              produtos, inclusive subpastas.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#catalogo"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:scale-[1.02]"
              >
                Ver catálogo
              </a>
              <a
                href={`https://wa.me/${numeroWhatsApp}`}
                className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Comprar agora
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {produtosDestaque.length > 0 ? (
              produtosDestaque.map((produto, index) => (
                <div
                  key={produto.id}
                  className={`${index === 1 ? "mt-10" : ""} ${
                    index === 2 ? "-mt-8" : ""
                  } overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/30`}
                >
                  <img
                    src={produto.imagem}
                    alt={produto.nome}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="col-span-2 rounded-[2rem] border border-dashed border-white/15 bg-white/[0.03] p-10 text-center text-white/60">
                Nenhuma imagem encontrada em public/produtos
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="catalogo" className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.25em] text-white/35">
            Seleção
          </p>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">
            Destaques do catálogo
          </h3>
        </div>

        {produtos.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/[0.03] p-10 text-center text-white/60">
            Nenhum produto encontrado em{" "}
            <span className="font-semibold text-white">public/produtos</span>.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {produtos.map((produto) => (
              <article
                key={produto.id}
                className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-2 hover:border-white/20 hover:bg-white/[0.06]"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900">
                  <img
                    src={produto.imagem}
                    alt={produto.nome}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                    {produto.categoria}
                  </div>

                  <div className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-900">
                    {produto.destaque}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>

                <div className="space-y-4 p-5">
                  <div className="space-y-2">
                    <h4 className="text-xl font-semibold">{produto.nome}</h4>
                    <p className="text-sm text-white/45">
                      Informe no WhatsApp o tamanho que você pretende.
                    </p>
                  </div>

                  <a
                    href={`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
                      `Olá! Tenho interesse em ${produto.nome}. Tamanho:`
                    )}`}
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-pink-300"
                  >
                    Escolher tamanho
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}