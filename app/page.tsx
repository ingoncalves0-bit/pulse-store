import { promises as fs } from "fs";
import path from "path";
import Link from "next/link";

export const dynamic = "force-dynamic";

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
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
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

async function lerProdutos() {
  try {
    const base = path.join(process.cwd(), "public", "produtos");
    const categoriasDir = await fs.readdir(base, { withFileTypes: true });

    let produtos: Produto[] = [];
    let id = 1;

    for (const cat of categoriasDir) {
      if (!cat.isDirectory()) continue;

      const categoria = cat.name;
      const pasta = path.join(base, categoria);

      let arquivos: string[] = [];
      try {
        arquivos = await fs.readdir(pasta);
      } catch {
        continue;
      }

      for (const arquivo of arquivos) {
        if (!/\.(jpg|jpeg|png|webp)$/i.test(arquivo)) continue;

        produtos.push({
          id: id++,
          nome: formatarTexto(arquivo),
          imagem: `/produtos/${categoria}/${arquivo}`,
          categoria: formatarTexto(categoria),
          destaque: criarDestaque(id),
        });
      }
    }

    return produtos;
  } catch (e) {
    console.error(e);
    return [];
  }
}

function slugCategoria(categoria: string) {
  return categoria.toLowerCase().replace(/\s+/g, "-");
}

export default async function Home({ searchParams }: any) {
  const categoriaSelecionada = searchParams?.categoria || "todos";

  const produtos = await lerProdutos();
  const categorias = Array.from(new Set(produtos.map((p) => p.categoria)));

  const produtosFiltrados =
    categoriaSelecionada === "todos"
      ? produtos
      : produtos.filter(
          (p) => slugCategoria(p.categoria) === categoriaSelecionada
        );

  const produtosDestaque = produtos.slice(0, 4);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <header className="flex justify-between px-6 py-6">
        <h1 className="text-3xl font-semibold">{nomeLoja}</h1>

        <a
          href={`https://wa.me/${numeroWhatsApp}`}
          className="border px-4 py-2 rounded-full"
        >
          WhatsApp
        </a>
      </header>

      <section className="grid grid-cols-2 gap-4 px-6">
        {produtosDestaque.map((p) => (
          <img
            key={p.id}
            src={p.imagem}
            className="rounded-2xl object-cover h-48 w-full"
          />
        ))}
      </section>

      <section className="px-6 py-10">
        <div className="flex flex-wrap gap-3 mb-6">
          <Link href="/" className="bg-white text-black px-4 py-2 rounded-full">
            Todos
          </Link>

          {categorias.map((categoria) => {
            const slug = slugCategoria(categoria);
            return (
              <Link
                key={categoria}
                href={`/?categoria=${slug}`}
                className="border px-4 py-2 rounded-full"
              >
                {categoria}
              </Link>
            );
          })}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {produtosFiltrados.map((produto) => (
            <article key={produto.id} className="bg-white/5 rounded-2xl overflow-hidden">
              <img
                src={produto.imagem}
                className="w-full h-64 object-cover"
              />

              <div className="p-4">
                <h4 className="text-lg font-semibold">{produto.nome}</h4>

                <a
                  href={`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
                    `Olá! Tenho interesse em ${produto.nome}`
                  )}`}
                  className="block mt-3 bg-white text-black text-center py-2 rounded-xl"
                >
                  Ver no WhatsApp
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}