import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// SQL to add the copies column if you haven't already:
//
// ALTER TABLE snippet_votes ADD COLUMN IF NOT EXISTS copies INTEGER DEFAULT 0;

// GET /api/votes/[snippetId]
// Returns likes, dislikes, and copies for a snippet.
export async function GET(
  _req: NextRequest,
  { params }: { params: { snippetId: string } }
) {
  const { data, error } = await supabase
    .from('snippet_votes')
    .select('likes, dislikes, copies')
    .eq('snippet_id', params.snippetId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = row not found — fine, just means no activity yet
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    likes:    data?.likes    ?? 0,
    dislikes: data?.dislikes ?? 0,
    copies:   data?.copies   ?? 0,
  });
}

// POST /api/votes/[snippetId]
// Body: { type: 'like' | 'dislike', action: 'add' | 'remove' }
//    OR { action: 'copy' }  — increments the copies counter
export async function POST(
  req: NextRequest,
  { params }: { params: { snippetId: string } }
) {
  const body = await req.json() as
    | { action: 'copy' }
    | { type: 'like' | 'dislike'; action: 'add' | 'remove' };

  const snippetId = params.snippetId;

  const { data: existing } = await supabase
    .from('snippet_votes')
    .select('likes, dislikes, copies')
    .eq('snippet_id', snippetId)
    .single();

  const current = existing ?? { likes: 0, dislikes: 0, copies: 0 };

  let updated: { snippet_id: string; likes: number; dislikes: number; copies: number };

  if (body.action === 'copy') {
    // Just bump the copy counter — votes unchanged
    updated = {
      snippet_id: snippetId,
      likes:    current.likes,
      dislikes: current.dislikes,
      copies:   (current.copies ?? 0) + 1,
    };
  } else {
    const delta = body.action === 'add' ? 1 : -1;
    updated = {
      snippet_id: snippetId,
      likes:    body.type === 'like'    ? Math.max(0, current.likes    + delta) : current.likes,
      dislikes: body.type === 'dislike' ? Math.max(0, current.dislikes + delta) : current.dislikes,
      copies:   current.copies ?? 0,
    };
  }

  const { error } = await supabase
    .from('snippet_votes')
    .upsert(updated, { onConflict: 'snippet_id' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    likes:    updated.likes,
    dislikes: updated.dislikes,
    copies:   updated.copies,
  });
}
