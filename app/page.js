import Header from "@/components/public/Header";
import MovieManager from "@/components/public/movie/MovieManager";
import { createClient } from '@/utils/supabase/server';

export async function generateMetadata() {
  return {
    title: "Movies",
    description: "Watch latest movies online.", 
  };
}

export default async function Home() {
  const supabase = await createClient();
  const { data: initialMovies } = await supabase.from('movies').select('*');

  return (
    <div className="flex flex-col bg-slate-900 min-h-screen font-sans">
      <Header />
      <main className="grow max-w-7xl mx-auto px-4 py-10">
        <MovieManager initialMovies={initialMovies || []} />
      </main>
    </div>
  );
}