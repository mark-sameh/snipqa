import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// SQL to run once in Supabase before using this route:
//
// CREATE TABLE site_stats (
//   id TEXT PRIMARY KEY DEFAULT 'global',
//   visits INTEGER DEFAULT 0
// );
//
// INSERT INTO site_stats (id, visits) VALUES ('global', 0);

// POST /api/track-visit
// Increments the global visit counter by 1. Silent — no response body needed.
export async function POST(_req: NextRequest) {
  const { data: existing } = await supabase
    .from('site_stats')
    .select('visits')
    .eq('id', 'global')
    .single();

  const next = (existing?.visits ?? 0) + 1;

  await supabase
    .from('site_stats')
    .upsert({ id: 'global', visits: next }, { onConflict: 'id' });

  return NextResponse.json({ ok: true });
}

// GET /api/track-visit
// Returns the current visit count — for future dashboard/admin use.
export async function GET(_req: NextRequest) {
  const { data, error } = await supabase
    .from('site_stats')
    .select('visits')
    .eq('id', 'global')
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ visits: data?.visits ?? 0 });
}
