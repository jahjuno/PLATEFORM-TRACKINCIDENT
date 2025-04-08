import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { Resend } from 'npm:resend@3.2.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

serve(async (req) => {
  try {
    const { incident_id, email, title, reminder_count } = await req.json()

    const updateUrl = `${Deno.env.get('PUBLIC_APP_URL')}/update-incident/${incident_id}`
    
    // Send reminder email
    await resend.emails.send({
      from: 'incidents@yourdomain.com',
      to: email,
      subject: `Rappel: Mise à jour requise pour l'incident - ${title}`,
      html: `
        <h1>Rappel de mise à jour d'incident</h1>
        <p>Bonjour,</p>
        <p>Nous attendons toujours les informations suivantes concernant l'incident "${title}" :</p>
        <ul>
          <li>Cause racine de l'incident</li>
          <li>Solution apportée</li>
        </ul>
        <p>C'est le ${reminder_count + 1}${reminder_count === 0 ? 'er' : 'ème'} rappel.</p>
        <p>
          <a href="${updateUrl}" style="background-color: #1E3A8A; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Mettre à jour l'incident
          </a>
        </p>
        <p>Merci de votre collaboration.</p>
      `
    })

    return new Response(
      JSON.stringify({ message: 'Reminder sent successfully' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})