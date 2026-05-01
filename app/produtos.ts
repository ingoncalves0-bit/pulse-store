export type Produto = {
  id: number;
  nome: string;
  imagem: string;
  categoria: string;
  destaque: string;
  preco: string;
};

export const produtos: Produto[] = [
  {
    id: 1,
    nome: "Inter Miami",
    imagem: "/produtos/times/inter-miami-120.jpg",
    categoria: "Times",
    destaque: "Disponível",
    preco: "120"
  },
  {
    id: 2,
    nome: "Moletom Nike",
    imagem: "/produtos/moletom-nike-129.jpg",
    categoria: "Moletons",
    destaque: "Novo",
    preco: "129"
  }
];