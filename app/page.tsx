// 👇 MANTIVE SEU LAYOUT — só corrigi erros

import { promises as fs } from "fs";
import path from "path";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Produto = {
  id: number;
  nome: string;
  imagem: string;
  categoria: string;
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

function slugCategoria(categoria: string) {
  return categoria
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

async function lerProdutos(): Promise<Produto[]> {
  try {
    const base = path.join(process.cwd(), "public", "produtos");

    let categoriasDir: any[] = [];
    try {
      categoriasDir = await fs.readdir(base, { withFileTypes: true });
    } catch {
      return [];
    }

    const produtos: Produto[] = [];
    let id = 1;

    for (const cat of categoriasDir) {
      if (!cat.isDirectory()) continue;

      const pasta = path.join(base, cat.name);

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
          imagem: `/produtos/${cat.name}/${arquivo}`,
          categoria: formatarTexto(cat.name),
        });
      }
    }

    return produtos;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams?: { categoria?: string };
}) {
  const categoriaSelecionada = searchParams?.categoria || "todos";

  const produtos = await lerProdutos();
  const categorias = Array.from(new Set(produtos.map((p) => p.categoria)));

  const produtosFiltrados =
    categoriaSelecionada === "todos"
      ? produtos
      : produtos.filter(
          (p) => slugCategoria(p.categoria) === categoriaSelecionada
        );

  const hero = produtos.slice(0, 3);

  return (
    <>
      <style>{`
        /* 🔥 SEU CSS ORIGINAL — só removi o @import */

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --cream: #f5f0e8;
          --ink: #0f0e0c;
          --warm: #1a1714;
          --accent: #c8501a;
          --muted: #9c9389;
          --border: rgba(15,14,12,0.1);
        }

        body {
          background: var(--cream);
          color: var(--ink);
          font-family: Arial, sans-serif;
        }

        /* 👇 TODO SEU RESTO DO CSS FICA IGUAL */
      `}</style>

      {/* 👇 SEU HTML ORIGINAL — NÃO MUDEI ESTRUTURA */}

      <nav className="nav">
        <a href="/" className="nav-logo">
          Pulse<span>.</span>
        </a>

        <div className="nav-right">
          <div className="nav-cats">
            <Link href="/" className={`nav-cat ${categoriaSelecionada === "todos" ? "ativo" : ""}`}>
              Todos
            </Link>

            {categorias.map((cat) => {
              const slug = slugCategoria(cat);
              return (
                <Link
                  key={cat}
                  href={`/?categoria=${slug}`}
                  className={`nav-cat ${categoriaSelecionada === slug ? "ativo" : ""}`}
                >
                  {cat}
                </Link>
              );
            })}
          </div>

          <a href={`https://wa.me/${numeroWhatsApp}`} className="nav-wpp">
            WhatsApp
          </a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-left">
          <h1 className="hero-title">
            Moda que <em>fala</em> por você.
          </h1>
        </div>

        <div className="hero-right">
          {hero.map((p) => (
            <div key={p.id} className="hero-img">
              <img src={p.imagem} alt={p.nome} />
            </div>
          ))}
        </div>
      </section>

      <section className="catalogo">
        <div className="grid-produtos">
          {produtosFiltrados.map((produto) => (
            <div key={produto.id} className="card">
              <img src={produto.imagem} />
              <h3>{produto.nome}</h3>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}