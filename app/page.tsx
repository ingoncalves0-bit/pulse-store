import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

type Produto = {
  id: number;
  nome: string;
  imagem: string;
  categoria: string;
};

function formatarNome(nome: string) {
  return nome
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

async function lerProdutos() {
  const base = path.join(process.cwd(), "public", "produtos");
  const categorias = await fs.readdir(base);

  let produtos: Produto[] = [];
  let id = 1;

  for (const categoria of categorias) {
    const pasta = path.join(base, categoria);
    const arquivos = await fs.readdir(pasta);

    for (const arquivo of arquivos) {
      if (!/\.(jpg|jpeg|png|webp)$/i.test(arquivo)) continue;

      produtos.push({
        id: id++,
        nome: formatarNome(arquivo),
        imagem: `/produtos/${categoria}/${arquivo}`,
        categoria: categoria,
      });
    }
  }

  return produtos;
}

export default async function Page() {
  const produtos = await lerProdutos();

  return (
    <div style={{ padding: 20 }}>
      <h1>Catálogo</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {produtos.map((p) => (
          <div key={p.id}>
            <img src={p.imagem} style={{ width: "100%" }} />
            <h3>{p.nome}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}