import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(req: Request) {
  const body = await req.json()

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: "Supabase service-role key is not configured on the server." }),
      { status: 500 }
    )
  }

  const { email, name, role } = body

  const { data, error } = await supabaseAdmin.from("users").insert([{ email, name, role }])

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ user: data?.[0] }), { status: 200 })
}

export async function PUT(req: Request) {
  const body = await req.json()
  const { id, email, name, role } = body

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing user ID" }), { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .update({ email, name, role, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ user: data?.[0] }), { status: 200 })
}
