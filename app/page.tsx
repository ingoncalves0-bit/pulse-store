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
    console.error("Erro ao ler produtos:", e);
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
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --cream: #f5f0e8;
          --ink: #0f0e0c;
          --accent: #c8501a;
          --muted: #9c9389;
          --border: rgba(15,14,12,0.1);
        }

        body {
          background: var(--cream);
          color: var(--ink);
          font-family: Arial, sans-serif;
        }

        .nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          display: flex;
          justify-content: space-between;
          padding: 20px;
          background: var(--cream);
          border-bottom: 1px solid var(--border);
        }

        .hero {
          padding-top: 80px;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .hero-left {
          padding: 40px;
        }

        .hero-title {
          font-size: 48px;
          margin-bottom: 20px;
        }

        .hero-right {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .hero-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .catalogo {
          padding: 40px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }

        .card img {
          width: 100%;
          height: 300px;
          object-fit: cover;
        }

        .card {
          border: 1px solid var(--border);
          padding: 10px;
        }
      `}</style>

      <nav className="nav">
        <h2>{nomeLoja}</h2>
        <a href={`https://wa.me/${numeroWhatsApp}`}>WhatsApp</a>
      </nav>

      <section className="hero">
        <div className="hero-left">
          <h1 className="hero-title">Catálogo</h1>
          <p>Escolha sua peça e peça no WhatsApp</p>
        </div>

        <div className="hero-right">
          {hero.map((p) => (
            <div key={p.id} className="hero-img">
              <img src={p.imagem} />
            </div>
          ))}
        </div>
      </section>

      <section className="catalogo">
        <div style={{ marginBottom: 20 }}>
          <Link href="/">Todos</Link>{" "}
          {categorias.map((cat) => (
            <Link key={cat} href={`/?categoria=${slugCategoria(cat)}`}>
              {cat}
            </Link>
          ))}
        </div>

        <div className="grid">
          {produtosFiltrados.map((produto) => (
            <div key={produto.id} className="card">
              <img src={produto.imagem} />
              <h3>{produto.nome}</h3>
              <a
                href={`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
                  `Olá! Tenho interesse em ${produto.nome}`
                )}`}
              >
                Comprar
              </a>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}