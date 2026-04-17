import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  // Get all sales where status is pending
  const { data, error } = await supabase
    .from('sales')
    .select('*, sale_items(*)')
    .eq('status', 'pendiente')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  
  const formattedData = data.map(sale => ({
    ...sale,
    items: sale.sale_items
  }));
  return NextResponse.json(formattedData);
}
