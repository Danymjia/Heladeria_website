import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');

    // Fechas de referencia
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Si hay parámetros de fecha personalizados, calculamos específicamente para ellos
    let minDate = startOfMonth; // Por defecto traemos data de al menos el mes para calcular hoy, semana, mes.
    
    if (startParam) {
      const customStart = new Date(startParam);
      if (customStart < minDate) minDate = customStart;
    }

    // Traer todas las ventas válidas (cualquier estado) desde la fecha mínima
    const { data: sales, error } = await supabase
      .from('sales')
      .select('*, sale_items(*)')
      .in('status', ['pendiente', 'entregado'])
      .gte('created_at', minDate.toISOString());

    if (error) {
       return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const processSales = (filteredSales: any[]) => {
      let revenue = 0;
      let totalSales = filteredSales.length;
      let productCounts: Record<string, number> = {};
      let flavorCounts: Record<string, number> = {};

      filteredSales.forEach(sale => {
        revenue += Number(sale.total) || 0;
        
        if (sale.sale_items) {
          sale.sale_items.forEach((item: any) => {
            // Conta productos
            productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
            // Configurar sabores
            if (item.flavor) {
                const flavors = item.flavor.split(',').map((f: string) => f.trim());
                flavors.forEach((f: string) => {
                   if (f) flavorCounts[f] = (flavorCounts[f] || 0) + item.quantity;
                });
            }
          });
        }
      });

      // Ordenar y tomar TOP 5
      const topProducts = Object.entries(productCounts)
        .map(([name, qty]) => ({ name, total_quantity: qty }))
        .sort((a, b) => b.total_quantity - a.total_quantity)
        .slice(0, 5);

      const topFlavors = Object.entries(flavorCounts)
        .map(([name, qty]) => ({ name, times_sold: qty }))
        .sort((a, b) => b.times_sold - a.times_sold)
        .slice(0, 5);

      return {
        revenue,
        sales: totalSales,
        topProduct: topProducts[0]?.name || "N/A",
        popularProducts: topProducts,
        popularFlavors: topFlavors
      };
    };

    // Procesar todos los grupos predeterminados
    const todaySales = sales.filter(s => new Date(s.created_at) >= startOfToday);
    const weekSales = sales.filter(s => new Date(s.created_at) >= startOfWeek);
    const monthSales = sales.filter(s => new Date(s.created_at) >= startOfMonth);

    let customData = null;
    if (startParam && endParam) {
      const startD = new Date(startParam);
      const endD = new Date(endParam);
      endD.setHours(23, 59, 59, 999);
      const customSales = sales.filter(s => {
        const d = new Date(s.created_at);
        return d >= startD && d <= endD;
      });
      customData = processSales(customSales);
    }

    return NextResponse.json({
      today: processSales(todaySales),
      week: processSales(weekSales),
      month: processSales(monthSales),
      custom: customData
    });

  } catch (err: any) {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}
