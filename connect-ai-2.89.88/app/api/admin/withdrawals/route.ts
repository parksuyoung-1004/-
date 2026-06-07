import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Check if user is admin (hardcoded check for demo, can be improved)
const isAdmin = (email: string) => {
  return email === 'admin@rewardclick.com' || email === process.env.ADMIN_EMAIL;
};

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user || !isAdmin(session.user.email!)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Join with users table to get member_code
    const { data, error } = await supabase
      .from('withdrawals')
      .select(`
        id, amount, bank_name, account_number, status, created_at,
        users ( member_code, email )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user || !isAdmin(session.user.email!)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('withdrawals')
      .update({ 
        status, 
        processed_at: status === 'COMPLETED' ? new Date().toISOString() : null 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
