import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { Resend } from 'npm:resend@3.2.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
const NOTIFICATION_EMAIL = Deno.env.get('NOTIFICATION_EMAIL')

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { record } = await req.json()

    // Only send notification for P0 incidents
    if (record.priority !== 'P0') {
      return new Response(JSON.stringify({ message: 'Not a P0 incident' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Send email notification
    await resend.emails.send({
      from: 'incidents@yourdomain.com',
      to: NOTIFICATION_EMAIL,
      subject: `⚠️ CRITIQUE: Nouvel incident P0 - ${record.title}`,
      html: `
        <h1>Incident Critique Détecté</h1>
        <p><strong>Titre:</strong> ${record.title}</p>
        <p><strong>Description:</strong> ${record.description}</p>
        <p><strong>Plateforme:</strong> ${record.platform}</p>
        <p><strong>Équipe Responsable:</strong> ${record.responsible_team}</p>
        <p><strong>Créé le:</strong> ${new Date(record.created_at).toLocaleString()}</p>
        <p style="color: red;"><strong>Action immédiate requise!</strong></p>
      `
    })

    return new Response(
      JSON.stringify({ message: 'Notification sent successfully' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})