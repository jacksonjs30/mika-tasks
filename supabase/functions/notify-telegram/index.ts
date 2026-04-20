// Supabase Edge Function: notify-telegram
// Send notifications to Telegram when a task reminder is due.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

serve(async (req) => {
  // This function can be triggered by a Database Webhook or a Cron job
  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // 1. Get all tasks that have a reminder due but haven't been sent to Telegram yet
    // (You'll need a way to track if the Telegram notification was already sent, 
    // e.g., a 'telegram_sent' boolean column in tasks)
    const now = new Date().toISOString()
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*, profiles(telegram_id, notify_telegram)')
      .lte('remind_at', now)
      .eq('status', 'active') // only active tasks
      // .eq('telegram_notified', false) // hypothetical column

    if (error) throw error

    for (const task of (tasks || [])) {
      const profile = task.profiles
      if (profile?.notify_telegram && profile?.telegram_id && TELEGRAM_BOT_TOKEN) {
        const message = `🔔 *Напоминание*: ${task.title}\n\nПроект: ${task.project_id}\nСтатус: ${task.status}`
        
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: profile.telegram_id,
            text: message,
            parse_mode: 'Markdown'
          })
        })
        
        // Mark as notified in DB
        // await supabase.from('tasks').update({ telegram_notified: true }).eq('id', task.id)
      }
    }

    return new Response(JSON.stringify({ success: true, count: tasks?.length }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
