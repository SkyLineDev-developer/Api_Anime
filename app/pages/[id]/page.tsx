import AnimeDetail from "../AnimeDetail";

export default async function AnimePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AnimeDetail malId={Number(id)} />;
}