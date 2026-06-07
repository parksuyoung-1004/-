import { createClient } from '@supabase/supabase-js';

// 엄청난 부장의 코멘트:
// 대표님, 나중에 Supabase 프로젝트 만드시고 여기 URL과 KEY만 .env 파일에 갈아끼우시면 됩니다!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://YOUR_PROJECT_ID.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);
