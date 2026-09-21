import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cegvsefwoyzvfbmaupcn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_MurDwySLu2e0muk8zlyMJQ_J7NnsvuL";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);