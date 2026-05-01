import Link from "next/link";
import { produtos } from "./produtos";

const numeroWhatsApp = "5551981710738";
const nomeLoja = "Pulse Store";

function slugCategoria(categoria: string) {
  return categoria.toLowerCase().replace(/\s+/g, "-");
}

type HomeProps = {
  searchParams?: {
    categoria?: string;
  };
};

export default function Home({ searchParams }: HomeProps) {
  const categoriaSelecionada = searchParams?.categoria || "todos";

  const categorias = Array.from(new Set(produtos.map((p) => p.categoria)));

  const produtosFiltrados =
    categoriaSelecionada === "todos"
      ? produtos
      : produtos.filter(
          (produto) =>
            slugCategoria(produto.categoria) === categoriaSelecionada
        );

  const produtosDestaque =
    categoriaSelecionada === "todos"
      ? produtos.slice(0, 4)
      : produtosFiltrados.slice(0, 4);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <header className="flex justify-between p-6">
        <h1 className="text-2xl font-bold">{nomeLoja}</h1>

        <a
          href={`https://wa.me/${numeroWhatsApp}`}
          className="border px-4 py-2 rounded-lg"
        >
          WhatsApp
        </a>
      </header>

      <section className="grid grid-cols-2 gap-4 p-6">
        {produtosDestaque.map((produto) => (
          <img
            key={produto.id}
            src={produto.imagem}
            className="rounded-xl object-cover h-48 w-full"
          />
        ))}
      </section>

      <section className="p-6">
        <div className="flex gap-2 flex-wrap mb-6">
          <Link href="/" className="bg-white text-black px-3 py-1 rounded">
            Todos
          </Link>

          {categorias.map((categoria) => {
            const slug = slugCategoria(categoria);

            return (
              <Link
                key={categoria}
                href={`/?categoria=${slug}`}
                className="border px-3 py-1 rounded"
              >
                {categoria}
              </Link>
            );
          })}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {produtosFiltrados.map((produto) => (
            <div key={produto.id} className="bg-white/5 rounded-xl overflow-hidden">
              <img
                src={produto.imagem}
                className="w-full h-56 object-cover"
              />

              <div className="p-3">
                <h2 className="font-semibold">{produto.nome}</h2>

                <p className="text-green-400 font-bold">
                  R$ {produto.preco}
                </p>

                <a
                  href={`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
                    `Olá! Tenho interesse em ${produto.nome}`
                  )}`}
                  className="block mt-2 bg-white text-black text-center py-2 rounded"
                >
                  Ver no WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}