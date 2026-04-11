import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/votes/[snippetId]
// Returns the current global like/dislike counts for a snippet.
export async function GET(
  _req: NextRequest,
  { params }: { params: { snippetId: string } }
) {
  const { data, error } = await supabase
    .from('snippet_votes')
    .select('likes, dislikes')
    .eq('snippet_id', params.snippetId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = row not found — that's fine, just means no votes yet
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    likes: data?.likes ?? 0,
    dislikes: data?.dislikes ?? 0,
  });
}

// POST /api/votes/[snippetId]
// Body: { type: 'like' | 'dislike', action: 'add' | 'remove' }
// Upserts the row and increments or decrements the relevant counter.
export async function POST(
  req: NextRequest,
  { params }: { params: { snippetId: string } }
) {
  const { type, action } = await req.json() as {
    type: 'like' | 'dislike';
    action: 'add' | 'remove';
  };

  const delta = action === 'add' ? 1 : -1;
  const snippetId = params.snippetId;

  // Fetch the current row so we can compute the new value.
  // RPC/increment functions aren't available without custom DB functions,
  // so we read then write — acceptable for low-concurrency vote counts.
  const { data: existing } = await supabase
    .from('snippet_votes')
    .select('likes, dislikes')
    .eq('snippet_id', snippetId)
    .single();

  const current = existing ?? { likes: 0, dislikes: 0 };
  const updated = {
    snippet_id: snippetId,
    likes:    type === 'like'    ? Math.max(0, current.likes    + delta) : current.likes,
    dislikes: type === 'dislike' ? Math.max(0, current.dislikes + delta) : current.dislikes,
  };

  const { error } = await supabase
    .from('snippet_votes')
    .upsert(updated, { onConflict: 'snippet_id' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ likes: updated.likes, dislikes: updated.dislikes });
}
