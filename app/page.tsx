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

    const categoriasDir = await fs.readdir(base, { withFileTypes: true });

    const produtos: Produto[] = [];
    let id = 1;

    for (const cat of categoriasDir) {
      if (!cat.isDirectory()) continue;

      const pasta = path.join(base, cat.name);
      const arquivos = await fs.readdir(pasta);

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
  } catch {
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
        * { box-sizing: border-box; margin:0; padding:0; }

        body {
          font-family: Arial, sans-serif;
          background: #f5f5f5;
          color: #111;
        }

        /* NAV */
        .nav {
          position: sticky;
          top:0;
          background:white;
          display:flex;
          justify-content:space-between;
          padding:15px 25px;
          border-bottom:1px solid #eee;
          z-index:10;
        }

        .nav a {
          text-decoration:none;
          color:#111;
          margin-right:10px;
          font-size:14px;
        }

        /* HERO */
        .hero {
          display:grid;
          grid-template-columns:1fr 1fr;
          height:60vh;
        }

        .hero-left {
          padding:40px;
          display:flex;
          flex-direction:column;
          justify-content:center;
        }

        .hero-left h1 {
          font-size:48px;
        }

        .hero-right {
          display:grid;
          grid-template-columns:1fr 1fr;
          grid-auto-rows:1fr;
        }

        .hero-img img {
          width:100%;
          height:100%;
          object-fit:cover;
        }

        /* CATALOGO */
        .catalogo {
          padding:40px;
        }

        .grid {
          display:grid;
          grid-template-columns:repeat(auto-fill,minmax(220px,1fr));
          gap:20px;
        }

        .card {
          background:white;
          border-radius:12px;
          overflow:hidden;
          box-shadow:0 4px 20px rgba(0,0,0,0.08);
          transition:0.2s;
        }

        .card:hover {
          transform:translateY(-5px);
        }

        .card img {
          width:100%;
          height:300px;
          object-fit:cover;
        }

        .card-body {
          padding:15px;
        }

        .card-body h3 {
          font-size:16px;
          margin-bottom:10px;
        }

        .btn {
          display:block;
          background:black;
          color:white;
          text-align:center;
          padding:10px;
          border-radius:8px;
          text-decoration:none;
          font-size:14px;
        }

        .btn:hover {
          background:#444;
        }

        @media(max-width:768px){
          .hero { grid-template-columns:1fr; height:auto; }
          .hero-right { height:200px; }
        }
      `}</style>

      {/* NAV */}
      <div className="nav">
        <strong>{nomeLoja}</strong>

        <div>
          <Link href="/">Todos</Link>
          {categorias.map((cat) => (
            <Link key={cat} href={`/?categoria=${slugCategoria(cat)}`}>
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <h1>Catálogo</h1>
          <p>Escolha e peça pelo WhatsApp</p>
        </div>

        <div className="hero-right">
          {hero.map((p) => (
            <div key={p.id} className="hero-img">
              <img src={p.imagem} />
            </div>
          ))}
        </div>
      </section>

      {/* CATALOGO */}
      <section className="catalogo">
        <div className="grid">
          {produtosFiltrados.map((produto) => (
            <div key={produto.id} className="card">
              <img src={produto.imagem} />
              <div className="card-body">
                <h3>{produto.nome}</h3>
                <a
                  className="btn"
                  href={`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
                    `Tenho interesse em ${produto.nome}`
                  )}`}
                >
                  Ver no WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}