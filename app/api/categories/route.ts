import { getAnonClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { errorResponse, ok } from '@/lib/http';
import { requireAdmin } from '@/lib/auth/guards';
import { categoryCreateSchema } from '@/lib/validation/schemas';
import type { SignalCategory, SignalSubcategory } from '@/lib/types/db';

export const dynamic = 'force-dynamic';

/** Public: list categories with their nested subcategories. */
export async function GET() {
  try {
    const supabase = getAnonClient();

    const [{ data: categories, error: catErr }, { data: subs, error: subErr }] =
      await Promise.all([
        supabase
          .from('signal_categories')
          .select('*')
          .order('sort_order', { ascending: true }),
        supabase
          .from('signal_subcategories')
          .select('*')
          .order('sort_order', { ascending: true }),
      ]);

    if (catErr) throw catErr;
    if (subErr) throw subErr;

    const byCategory = new Map<string, SignalSubcategory[]>();
    for (const sub of (subs ?? []) as SignalSubcategory[]) {
      const list = byCategory.get(sub.category_id) ?? [];
      list.push(sub);
      byCategory.set(sub.category_id, list);
    }

    const result = ((categories ?? []) as SignalCategory[]).map((cat) => ({
      ...cat,
      subcategories: byCategory.get(cat.id) ?? [],
    }));

    return ok({ categories: result });
  } catch (e) {
    return errorResponse(e);
  }
}

/**
 * Admin: create a category, or a subcategory when `category_id` is provided.
 */
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = categoryCreateSchema.parse(await request.json());
    const supabase = getAdminClient();

    if (body.category_id) {
      const { data, error } = await supabase
        .from('signal_subcategories')
        .insert({
          category_id: body.category_id,
          name: body.name,
          slug: body.slug,
          sort_order: body.sort_order,
        })
        .select('*')
        .single();
      if (error) throw error;
      return ok({ subcategory: data }, { status: 201 });
    }

    const { data, error } = await supabase
      .from('signal_categories')
      .insert({ name: body.name, slug: body.slug, sort_order: body.sort_order })
      .select('*')
      .single();
    if (error) throw error;
    return ok({ category: data }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
