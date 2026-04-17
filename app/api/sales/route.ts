import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  // To get nested items, we do a join. Supabase uses the foreign key relationships.
  const { data, error } = await supabase.from('sales').select('*, sale_items(*)').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  
  // Format to match old structure if needed
  const formattedData = data.map(sale => ({
    ...sale,
    items: sale.sale_items
  }));
  return NextResponse.json(formattedData);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, paymentMethod } = body;
    
    // Calculate total
    const total = items ? items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) : 0;
    
    // Only insert known columns — never spread unknown fields
    const dbSaleData = {
      payment_method: paymentMethod || 'efectivo',
      status: 'pendiente',
      total
    };
    
    // Create the sale
    const { data: sale, error: saleError } = await supabase.from('sales').insert([dbSaleData]).select().single();
    if (saleError) {
      console.error('[sales POST] Error creating sale:', saleError);
      return NextResponse.json({ message: saleError.message, detail: saleError.details, hint: saleError.hint }, { status: 500 });
    }

    // Insert items
    if (items && items.length > 0) {
      const itemsToInsert = items.map((item: any) => ({
        sale_id: sale.id,
        product_id: item.id || item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
        flavor: item.flavor,
        with_cheese: item.withCheese,
        with_cream: item.withCream,
        selected_option: item.selectedOption,
        selected_topping: item.selectedTopping,
        selected_base: item.selectedBase,
        selected_perla: item.selectedPerla,
        num_sabores: item.numSabores
      }));

      console.log('[sales POST] Items to insert:', JSON.stringify(itemsToInsert, null, 2));

      const { error: itemsError } = await supabase.from('sale_items').insert(itemsToInsert);
      if (itemsError) {
        console.error('[sales POST] Error inserting items:', itemsError);
        return NextResponse.json({ message: itemsError.message, detail: itemsError.details, hint: itemsError.hint }, { status: 500 });
      }
    }

    return NextResponse.json({ ...sale, items });
  } catch (err: any) {
    console.error('[sales POST] Unexpected error:', err);
    return NextResponse.json({ message: err.message || 'Invalid data' }, { status: 400 });
  }
}
