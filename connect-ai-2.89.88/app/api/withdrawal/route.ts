import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const { amount, bankName, accountNumber } = await request.json();

    if (!amount || amount < 10000 || !bankName || !accountNumber) {
      return NextResponse.json({ error: '잘못된 입력입니다. (최소 10,000 P 이상)' }, { status: 400 });
    }

    // 1. 현재 잔액 확인
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('point_balance')
      .eq('id', session.user.id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: '사용자 정보를 불러올 수 없습니다.' }, { status: 404 });
    }

    if (user.point_balance < amount) {
      return NextResponse.json({ error: '출금 요청 금액이 잔액을 초과합니다.' }, { status: 400 });
    }

    // 2. withdrawals 테이블에 추가
    const { error: insertError } = await supabase
      .from('withdrawals')
      .insert([
        {
          user_id: session.user.id,
          amount: amount,
          bank_name: bankName,
          account_number: accountNumber,
          status: 'PENDING'
        }
      ]);

    if (insertError) {
      throw insertError;
    }

    // 3. 포인트 차감 (users 테이블)
    const { error: updateError } = await supabase
      .from('users')
      .update({ point_balance: user.point_balance - amount })
      .eq('id', session.user.id);

    if (updateError) {
      throw updateError;
    }

    // 4. 출금에 의한 포인트 변동 내역 기록 (마이너스 처리)
    await supabase
      .from('point_transactions')
      .insert([
        {
          user_id: session.user.id,
          amount: -amount,
          description: `출금 신청 (${bankName} ${accountNumber})`
        }
      ]);

    return NextResponse.json({ success: true, message: '출금 신청이 완료되었습니다.' });

  } catch (error: any) {
    console.error('출금 신청 에러:', error);
    return NextResponse.json({ error: '출금 처리 중 서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
