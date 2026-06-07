-- ==========================================
-- RewardClick MVP Database Schema (Supabase)
-- Created by AI 개발부장 엄청난 😎
-- ==========================================

-- 1. 유저 정보 테이블 (바이너리 트리 구조 포함)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT auth.uid(), -- Supabase Auth 연동
  email TEXT NOT NULL UNIQUE,
  member_code TEXT UNIQUE NOT NULL, -- USER-240508-143000 형태
  point_balance INTEGER DEFAULT 0 NOT NULL,
  
  -- 바이너리 트리 관리를 위한 필드
  parent_id UUID REFERENCES public.users(id),
  left_child_id UUID REFERENCES public.users(id),
  right_child_id UUID REFERENCES public.users(id),
  tree_depth INTEGER DEFAULT 0 NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 광고 시청 내역 테이블
CREATE TABLE public.ad_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  source_user_id UUID REFERENCES public.users(id) NOT NULL, -- 누구의 가입으로 인해 생긴 광고인지 (자신 포함)
  status TEXT DEFAULT 'STARTED' NOT NULL, -- 'STARTED', 'COMPLETED'
  reward_amount INTEGER DEFAULT 1000 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 3. 포인트 거래 내역 테이블
CREATE TABLE public.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  amount INTEGER NOT NULL, -- 1000 포인트 단위 (플러스 또는 마이너스)
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. 출금 신청 내역 테이블 (수동 정산용)
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  amount INTEGER NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' NOT NULL, -- 'PENDING', 'COMPLETED', 'REJECTED'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- 엄청난 부장의 핵심 비즈니스 로직 (RPC 함수들)
-- ==========================================

-- A. 웰컴 광고 시청 완료 시 본인에게 1,000P 지급하는 함수
CREATE OR REPLACE FUNCTION reward_single_user(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  -- 1. 유저 포인트 증가
  UPDATE public.users 
  SET point_balance = point_balance + p_amount 
  WHERE id = p_user_id;

  -- 2. 포인트 지급 내역 기록
  INSERT INTO public.point_transactions (user_id, amount, description)
  VALUES (p_user_id, p_amount, '웰컴 광고 시청 완료 보상 (무임승차 방지 완료!)');
  
  -- 3. 해당 유저의 켜져있는 광고 상태 업데이트
  UPDATE public.ad_views
  SET status = 'COMPLETED', completed_at = now()
  WHERE user_id = p_user_id AND status = 'STARTED';
END;
$$ LANGUAGE plpgsql;


-- B. 신규 가입 시, 본인 및 상위 9단계 부모들에게 웰컴 광고(STARTED) 할당
CREATE OR REPLACE FUNCTION send_welcome_ads_to_tree(p_user_id UUID, p_levels INTEGER)
RETURNS VOID AS $$
DECLARE
  current_parent UUID;
  current_level INTEGER := 1;
BEGIN
  -- 1. 신규 유저 본인에게 광고 할당
  INSERT INTO public.ad_views (user_id, source_user_id, status)
  VALUES (p_user_id, p_user_id, 'STARTED');

  -- 2. 상위 9단계 부모 찾아서 광고 할당
  SELECT parent_id INTO current_parent FROM public.users WHERE id = p_user_id;
  
  WHILE current_parent IS NOT NULL AND current_level <= p_levels LOOP
    INSERT INTO public.ad_views (user_id, source_user_id, status)
    VALUES (current_parent, p_user_id, 'STARTED');
    
    SELECT parent_id INTO current_parent FROM public.users WHERE id = current_parent;
    current_level := current_level + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
