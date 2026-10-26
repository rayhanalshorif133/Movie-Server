import Header from '@/components/admin/Header';
import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { getGoogleDriveImageUrl } from '@/utils/google/manage';
import { 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { 
  FcFilmReel, 
  FcStackOfPhotos, 
  FcGoogle, 
  FcDatabase, 
  FcClapperboard, 
  FcPieChart, 
  FcServices,
  FcPlus
} from 'react-icons/fc';
import { FaGamepad } from 'react-icons/fa6';
import { HiOutlineSparkles } from 'react-icons/hi2';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return {
    title: "Executive Dashboard | Admin Panel",
  };
}

export default async function Page() {
  const supabase = await createClient();

  const [
    { count: movieCount },
    { count: gameCount },
    { count: gmailCount },
    { count: usedGmailCount },
    { count: galleryCount },
    { data: recentMovies },
    { data: recentGames }
  ] = await Promise.all([
    supabase.from('movies').select('*', { count: 'exact', head: true }),
    supabase.from('games').select('*', { count: 'exact', head: true }),
    supabase.from('gmail_inventory').select('*', { count: 'exact', head: true }),
    supabase.from('gmails').select('*', { count: 'exact', head: true }),
    supabase.from('galleries').select('*', { count: 'exact', head: true }),
    supabase.from('movies').select('*').order('created_at', { ascending: false }).range(0, 4),
    supabase.from('games').select('*').order('created_at', { ascending: false }).range(0, 3)
  ]);

  const totalGmailCapacityGB = (gmailCount || 0) * 15;
  const usedGmailCapacityGB = (usedGmailCount || 0) * 15;
  const storagePercentage = totalGmailCapacityGB > 0 
    ? Math.min(100, Math.round((usedGmailCapacityGB / totalGmailCapacityGB) * 100)) 
    : 0;

  const kpis = [
    {
      label: 'Total Movies',
      value: movieCount ?? 0,
      subtext: 'Catalog assets',
      icon: <FcFilmReel className="text-2xl" />,
      bg: 'bg-indigo-50/80 border border-indigo-100',
      border: 'border-l-indigo-600',
      textColor: 'text-indigo-700',
      href: '/admin/movies'
    },
    {
      label: 'Games & Assets',
      value: gameCount ?? 0,
      subtext: 'Interactive library',
      icon: <FaGamepad className="text-2xl text-emerald-500" />,
      bg: 'bg-emerald-50/80 border border-emerald-100',
      border: 'border-l-emerald-600',
      textColor: 'text-emerald-700',
      href: '/admin/games'
    },
    {
      label: 'Gallery Assets',
      value: galleryCount ?? 0,
      subtext: 'Drive cloud assets',
      icon: <FcStackOfPhotos className="text-2xl" />,
      bg: 'bg-pink-50/80 border border-pink-100',
      border: 'border-l-pink-600',
      textColor: 'text-pink-700',
      href: '/admin/images'
    },
    {
      label: 'Active Gmails',
      value: `${usedGmailCount ?? 0} / ${gmailCount ?? 0}`,
      subtext: 'Storage nodes',
      icon: <FcGoogle className="text-2xl" />,
      bg: 'bg-rose-50/80 border border-rose-100',
      border: 'border-l-rose-600',
      textColor: 'text-rose-700',
      href: '/admin/gmails'
    },
    {
      label: 'Cloud Capacity',
      value: `${totalGmailCapacityGB} GB`,
      subtext: `${storagePercentage}% allocated`,
      icon: <FcDatabase className="text-2xl" />,
      bg: 'bg-amber-50/80 border border-amber-100',
      border: 'border-l-amber-600',
      textColor: 'text-amber-700',
      href: '/admin/gmails/inventory'
    },
  ];

  const quickActions = [
    {
      title: 'Add New Movie',
      desc: 'Publish movie or TV series with Drive file ID',
      href: '/admin/movies/manage',
      icon: <FcClapperboard className="text-2xl" />,
      color: 'bg-blue-50/60 hover:bg-blue-100/70 text-blue-700 border-blue-100'
    },
    {
      title: 'Upload Game Asset',
      desc: 'Add HTML5 games, APKs or PC asset packages',
      href: '/admin/games/manage',
      icon: <FaGamepad className="text-2xl text-emerald-500" />,
      color: 'bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-700 border-emerald-100'
    },
    {
      title: 'Drive Image Gallery',
      desc: 'Browse, preview, and batch-manage Drive photos',
      href: '/admin/images',
      icon: <FcStackOfPhotos className="text-2xl" />,
      color: 'bg-pink-50/60 hover:bg-pink-100/70 text-pink-700 border-pink-100'
    },
    {
      title: 'Gmail Inventory',
      desc: 'Monitor Google account quotas & tokens',
      href: '/admin/gmails/inventory',
      icon: <FcGoogle className="text-2xl" />,
      color: 'bg-rose-50/60 hover:bg-rose-100/70 text-rose-700 border-rose-100'
    },
  ];

  return (
    <>
      <Header title="Dashboard Overview" publicURL="/" pageTitle="Movies" />

        {/* Hero Welcome Banner in Light Theme */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 p-8 text-white shadow-xl shadow-blue-900/10 mb-8">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 -mb-10 w-48 h-48 rounded-full bg-indigo-500/20 blur-xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100 border border-white/20">
                <HiOutlineSparkles className="text-amber-300" />
                <span>MovieServer Management Suite v2.0</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                Admin Command Center
              </h1>
              <p className="text-blue-100/80 text-sm leading-relaxed">
                Seamlessly control all movies, game assets, Google Drive media, and Gmail storage clusters in one centralized console.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/admin/movies/manage"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-800 font-bold text-xs shadow-lg shadow-black/10 hover:bg-blue-50 transition-all active:scale-95 cursor-pointer"
              >
                <FcPlus className="text-base" />
                <span>Add New Movie</span>
              </Link>
              <Link
                href="/admin/images"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md text-white font-bold text-xs border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
              >
                <FcStackOfPhotos className="text-base" />
                <span>Drive Gallery</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Top 5 KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
          {kpis.map((kpi, idx) => (
            <Link
              key={idx}
              href={kpi.href}
              className={`bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border-l-4 ${kpi.border} flex flex-col justify-between group`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {kpi.label}
                </span>
                <div className={`p-2 rounded-xl ${kpi.bg} group-hover:scale-110 transition-transform`}>
                  {kpi.icon}
                </div>
              </div>

              <div className="mt-4">
                <h3 className={`text-2xl font-black tracking-tight ${kpi.textColor}`}>
                  {kpi.value}
                </h3>
                <p className="text-[11px] font-medium text-gray-400 mt-1 flex items-center gap-1">
                  <span>{kpi.subtext}</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-gray-500" />
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Main 2-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2/3): Recent Content Preview */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Movies Table Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-6 rounded-full bg-blue-600" />
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Recently Added Movies</h3>
                    <p className="text-xs text-gray-400">Latest media entries in your database</p>
                  </div>
                </div>

                <Link
                  href="/admin/movies"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                >
                  <span>View All Movies</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentMovies && recentMovies.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recentMovies.map((movie) => {
                    const posterUrl = getGoogleDriveImageUrl(movie.poster);
                    const formattedDate = movie.created_at
                      ? new Date(movie.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Recent';

                    return (
                      <div
                        key={movie.id}
                        className="p-4 hover:bg-gray-50/80 transition-colors flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={posterUrl}
                            alt={movie.title}
                            className="w-11 h-14 object-cover rounded-lg bg-gray-100 border border-gray-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 truncate">
                              {movie.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 uppercase">
                                {movie.type || 'Movie'}
                              </span>
                              {movie.size && (
                                <span className="text-[11px] text-gray-400 font-mono">
                                  {movie.size} MB
                                </span>
                              )}
                              <span className="text-[11px] text-gray-400 font-mono hidden sm:inline">
                                • {formattedDate}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/admin/movies/manage?id=${movie.id}`}
                            className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 transition-colors"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center text-gray-400 text-sm">
                  No movies found in the database.
                </div>
              )}
            </div>

            {/* Recent Game Assets Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-6 rounded-full bg-violet-600" />
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Recent Gaming Assets</h3>
                    <p className="text-xs text-gray-400">Latest game packages & assets</p>
                  </div>
                </div>

                <Link
                  href="/admin/games"
                  className="text-xs font-bold text-violet-600 hover:text-violet-800 flex items-center gap-1 hover:underline"
                >
                  <span>View All Games</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentGames && recentGames.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5">
                  {recentGames.map((game) => (
                    <div
                      key={game.id}
                      className="p-3.5 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50/20 transition-all flex items-center gap-3"
                    >
                      <img
                        src={getGoogleDriveImageUrl(game.poster)}
                        alt={game.title}
                        className="w-12 h-12 object-cover rounded-lg bg-gray-100 shrink-0 border border-gray-200"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-gray-900 truncate">
                          {game.title}
                        </h4>
                        <span className="text-[10px] font-semibold text-violet-600 uppercase">
                          {game.type || 'Asset'}
                        </span>
                      </div>
                      <Link
                        href={`/admin/games/manage?id=${game.id}`}
                        className="p-2 text-gray-400 hover:text-violet-600"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400 text-xs">
                  No games registered yet.
                </div>
              )}
            </div>
          </div>

          {/* Right Column (1/3): Quick Actions & System Integrations */}
          <div className="space-y-6">
            {/* Quick Actions Panel */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-6">
              <h3 className="text-base font-bold text-gray-900 mb-1">Quick Actions</h3>
              <p className="text-xs text-gray-400 mb-5">Shortcuts to common administrative tasks</p>

              <div className="space-y-3">
                {quickActions.map((action, i) => (
                  <Link
                    key={i}
                    href={action.href}
                    className={`p-3.5 rounded-xl border flex items-start gap-3.5 transition-all group ${action.color}`}
                  >
                    <div className="p-2 rounded-lg bg-white shadow-xs shrink-0">
                      {action.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                        {action.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Cloud Infrastructure Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">System Integration</h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Google Sheet */}
                <div className="p-3 rounded-xl bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                      <FcDatabase className="text-base" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Google Sheet Database</p>
                      <p className="text-[10px] text-gray-400 font-mono">movie-server.xlsx</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">Synced</span>
                </div>

                {/* Google Drive */}
                <div className="p-3 rounded-xl bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                      <FcGoogle className="text-base" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Google Drive API</p>
                      <p className="text-[10px] text-gray-400 font-mono truncate max-w-[120px]">Folder 1vMGg-...</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">Active</span>
                </div>

                {/* Gmail Storage Quota Bar */}
                <div className="p-3.5 rounded-xl bg-gray-50 space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-gray-700">Gmail Pool Quota</span>
                    <span className="text-blue-700 font-mono">{usedGmailCapacityGB} / {totalGmailCapacityGB} GB</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${storagePercentage}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 text-right">
                    {storagePercentage}% storage allocated
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
    </>
  );
}
