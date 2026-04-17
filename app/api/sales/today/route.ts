import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Get today's sales (all statuses)
export async function GET() {
  // Build today's date range in UTC
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

  const { data, error } = await supabase
    .from('sales')
    .select('*, sale_items(*)')
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  
  const formattedData = data.map(sale => ({
    ...sale,
    items: sale.sale_items
  }));
  return NextResponse.json(formattedData);
}

// Finish day: does NOT delete from DB — UI clears locally
export async function DELETE() {
  // Data is preserved in Supabase for historical records.
  // The frontend clears its local state after calling this.
  return NextResponse.json({ deletedCount: 0 });
}
