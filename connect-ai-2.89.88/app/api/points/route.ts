import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// 회원가입 즉시 유저 및 상위 9단계 부모들에게 웰컴광고 전송!
// 각각 광고 시청 완료시 1,000포인트씩 쫙~ 뿌려주는 로직을 구현 (엄청난 부장 특별판 😎)
export async function POST(request: Request) {
  try {
    const { userId, action } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID가 필요합니다.' }, { status: 400 });
    }

    // 1. 회원가입 즉시: 유저 본인과 상위 9단계 부모들의 ad_views 테이블에 웰컴광고 전송 로직
    if (action === 'SEND_WELCOME_AD') {
      const supabase = createClient();
      const { error: adError } = await supabase.rpc('send_welcome_ads_to_tree', {
        p_user_id: userId,
        p_levels: 9
      });
      if (adError) throw adError;
      
      return NextResponse.json({ success: true, message: '유저 및 상위 9단계 부모들에게 웰컴광고 전송 완료! 📺' });
    }

    // 2. 광고 시청 완료 시: 해당 영상을 본 유저에게만 1,000포인트 쫙~ 지급!
    if (action === 'COMPLETE_AD_VIEW') {
      const supabase = createClient();
      // 엄청난 부장의 꿀팁: 무임승차는 없습니다! 
      // 부모든 신규 유저든 각자 자기한테 전송된 웰컴 광고를 시청해야만 1,000 포인트가 지급됩니다.
      const { data, error } = await supabase.rpc('reward_single_user', {
        p_user_id: userId,
        p_amount: 1000 // 시청 완료 시 1,000 포인트 지급
      });

      if (error) throw error;

      return NextResponse.json({ 
        success: true, 
        message: '광고 시청 완료! 시청자 본인에게 1,000포인트 쫙~ 뿌렸습니다! 💸🚀',
        data 
      });
    }

    return NextResponse.json({ error: '잘못된 액션입니다.' }, { status: 400 });

  } catch (error: any) {
    console.error('포인트 배분 중 에러 발생:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
