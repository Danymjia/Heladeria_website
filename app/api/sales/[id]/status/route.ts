import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(req: Request, context: any) {
  try {
    const { id } = context.params;
    const body = await req.json();
    
    // update status to 'delivered' generally
    const { data: sale, error } = await supabase
      .from('sales')
      .update({ status: body.status || 'entregado' })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    
    return NextResponse.json(sale);
  } catch (err: any) {
    return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
  }
}
