import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
	process.env.NEXT_PUBLIC_SUPABASE_URL || "https://itlwlcyqwdfutolmawgq.supabase.co";
const supabaseKey =
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0bHdsY3lxd2RmdXRvbG1hd2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNjY2MTQsImV4cCI6MjA4Nzk0MjYxNH0._Tlr3L7OUKF9U-TzATaJPVUXDxyHmfsohNc3GIOu9gs";
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Subscribing to realtime messages...");
const _channel = supabase
	.channel("room:test")
	.on("postgres_changes", { event: "*", schema: "public", table: "messages" }, (payload) => {
		console.log("Realtime event received! Payload:", payload);
	})
	.subscribe((status, err) => {
		console.log("Subscription status:", status);
		if (err) console.error(err);
	});
