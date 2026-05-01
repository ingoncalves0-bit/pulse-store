import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

type Produto = {
  id: number;
  nome: string;
  imagem: string;
  categoria: string;
  preco: string;
};

function formatarNome(nome: string) {
  return nome
    .replace(/\.[^/.]+$/, "")
    .replace(/-\d+$/, "") // remove preço do final
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function extrairPreco(nome: string) {
  const match = nome.match(/-(\d+)\./);
  return match ? match[1] : "0";
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
      if (!/\.(jpg|png|webp)$/i.test(arquivo)) continue;

      produtos.push({
        id: id++,
        nome: formatarNome(arquivo),
        preco: extrairPreco(arquivo),
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
            <p>R$ {p.preco}</p>
          </div>
        ))}
      </div>
    </div>
  );
}