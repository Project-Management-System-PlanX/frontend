import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
	process.env.NEXT_PUBLIC_SUPABASE_URL || "https://itlwlcyqwdfutolmawgq.supabase.co";
const supabaseKey =
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0bHdsY3lxd2RmdXRvbG1hd2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNjY2MTQsImV4cCI6MjA4Nzk0MjYxNH0._Tlr3L7OUKF9U-TzATaJPVUXDxyHmfsohNc3GIOu9gs";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
	const { data, error } = await supabase.from("messages").select("*").limit(1);
	console.log("Anon select:", { data, error });
}
test();
