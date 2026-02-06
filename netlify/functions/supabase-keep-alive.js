import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export const handler = async () => {
  try {
    await supabase.from("profiles").select("id").limit(1);

    return {
      statusCode: 200,
      body: JSON.stringify({ status: "supabase alive" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

