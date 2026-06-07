import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = createClient()
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && session?.user) {
      // 신규 유저인지 확인
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', session.user.id)
        .single()

      if (!existingUser) {
        // 회원 코드는 USER-yymmdd-랜덤6자리
        const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '')
        const randomStr = Math.floor(100000 + Math.random() * 900000)
        const memberCode = `USER-${dateStr}-${randomStr}`

        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: session.user.id,
              email: session.user.email,
              member_code: memberCode,
              point_balance: 0
            }
          ])

        if (!insertError) {
          // 회원가입 완료 후 웰컴 광고 RPC 호출
          await supabase.rpc('send_welcome_ads_to_tree', {
            p_user_id: session.user.id,
            p_levels: 9
          })
        }
      }
    }
  }

  // 로그인 성공 후 대시보드로 이동
  return NextResponse.redirect(`${origin}/dashboard`)
}
