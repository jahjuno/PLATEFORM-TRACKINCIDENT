import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { SMTPClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const client = new SMTPClient({
      connection: {
        hostname: Deno.env.get("SMTP_HOSTNAME") || "",
        port: parseInt(Deno.env.get("SMTP_PORT") || "587"),
        tls: true,
        auth: {
          username: Deno.env.get("SMTP_USERNAME") || "",
          password: Deno.env.get("SMTP_PASSWORD") || "",
        },
      },
    });

    const { incident, recipients } = await req.json();

    const emailContent = `
      <h1>Nouvel incident: ${incident.title}</h1>
      <p><strong>Numéro de ticket:</strong> ${incident.ticket_number}</p>
      <p><strong>Description:</strong> ${incident.description}</p>
      <p><strong>Plateforme:</strong> ${incident.platform}</p>
      <p><strong>Business impacté:</strong> ${incident.impacted_business}</p>
      <p><strong>Priorité:</strong> ${incident.priority}</p>
      <p><strong>Statut:</strong> ${incident.status}</p>
      <p><strong>Équipe responsable:</strong> ${incident.responsible_team}</p>
      
      <h2>Informations temporelles</h2>
      <p><strong>Date et heure de début:</strong> ${incident.incident_start_time}</p>
      <p><strong>Date et heure de fin:</strong> ${incident.incident_end_time || 'En cours'}</p>
      <p><strong>Durée:</strong> ${incident.duration || 'En cours'}</p>
    `;

    await client.send({
      from: Deno.env.get("SMTP_FROM") || "incidents@yourdomain.com",
      to: recipients,
      subject: `Incident ${incident.priority}: ${incident.title}`,
      content: "text/html",
      html: emailContent,
    });

    await client.close();

    return new Response(
      JSON.stringify({ message: "Email envoyé avec succès" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});