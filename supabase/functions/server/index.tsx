import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-7c33a2a7/health", (c) => {
  return c.json({ status: "ok" });
});

// Keepalive endpoint - writes and deletes a dummy value to keep Supabase active
app.post("/make-server-7c33a2a7/keepalive", async (c) => {
  try {
    const keepaliveKey = `keepalive_${Date.now()}`;
    const keepaliveData = { timestamp: new Date().toISOString() };

    console.log('Keepalive: Writing dummy data');
    await kv.set(keepaliveKey, keepaliveData);

    console.log('Keepalive: Deleting dummy data');
    await kv.del(keepaliveKey);

    return c.json({
      success: true,
      message: 'Keepalive ping successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('Keepalive error:', errorMessage);
    return c.json({
      error: 'Keepalive ping failed',
      details: errorMessage
    }, 500);
  }
});

// Discord reminder endpoint - sends a reminder message to Discord
app.post("/make-server-7c33a2a7/discord-reminder", async (c) => {
  try {
    const webhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL');

    if (!webhookUrl) {
      console.log('Discord webhook URL not configured');
      return c.json({
        error: 'Discord webhook URL not configured in environment variables'
      }, 500);
    }

    const message = {
      content: "🏃‍♂️ **Activity Tracker Reminder!** 🏋️‍♀️\n\nIt's been 6 days! Time to check in on your fitness goals and log your activities. Keep up the great work! 💪",
      embeds: [{
        title: "Activity Tracker",
        description: "Don't forget to track your gym and cardio activities today!",
        color: 0x5865F2, // Discord blurple color
        timestamp: new Date().toISOString()
      }]
    };

    console.log('Sending Discord reminder message');
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Discord webhook error:', response.status, errorText);
      return c.json({
        error: 'Failed to send Discord message',
        details: errorText
      }, 500);
    }

    console.log('Discord reminder sent successfully');
    return c.json({
      success: true,
      message: 'Discord reminder sent',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('Discord reminder error:', errorMessage);
    return c.json({
      error: 'Failed to send Discord reminder',
      details: errorMessage
    }, 500);
  }
});

// Telegram reminder endpoint - sends a reminder message to Telegram
app.post("/make-server-7c33a2a7/telegram-reminder", async (c) => {
  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID');

    if (!botToken || !chatId) {
      console.log('Telegram credentials not configured');
      return c.json({
        error: 'Telegram bot token or chat ID not configured'
      }, 500);
    }

    const message = `🏃‍♂️ *Activity Tracker Reminder!* 🏋️‍♀️

It's been 6 days! Time to check in on your fitness goals and log your activities. Keep up the great work! 💪`;

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    console.log('Sending Telegram reminder message');
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Telegram API error:', response.status, errorText);
      return c.json({
        error: 'Failed to send Telegram message',
        details: errorText
      }, 500);
    }

    console.log('Telegram reminder sent successfully');
    return c.json({
      success: true,
      message: 'Telegram reminder sent',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('Telegram reminder error:', errorMessage);
    return c.json({
      error: 'Failed to send Telegram reminder',
      details: errorMessage
    }, 500);
  }
});

// Get activity data
app.get("/make-server-7c33a2a7/activity", async (c) => {
  try {
    // Debug: Check environment variables
    const hasUrl = !!Deno.env.get("SUPABASE_URL");
    const hasKey = !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    console.log('Environment check - URL exists:', hasUrl, 'Key exists:', hasKey);

    const activityKey = `activity_data`;

    console.log('Attempting to get activity data with key:', activityKey);
    const data = await kv.get(activityKey);
    console.log('Retrieved data:', data);

    if (!data) {
      console.log('No data found, returning defaults');
      return c.json({
        goal: 50,
        gymCount: 0,
        cardioCount: 0
      });
    }

    return c.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.log('Error fetching activity data:', errorMessage, errorStack);
    return c.json({
      error: 'Failed to fetch activity data',
      details: errorMessage
    }, 500);
  }
});

// Save activity data
app.post("/make-server-7c33a2a7/activity", async (c) => {
  try {
    const body = await c.req.json();
    const { goal, gymCount, cardioCount } = body;

    const activityKey = `activity_data`;

    // Get previous data to detect changes
    const previousData = await kv.get(activityKey);
    const previousGym = previousData?.gymCount || 0;
    const previousCardio = previousData?.cardioCount || 0;

    const data = {
      goal,
      gymCount,
      cardioCount,
      updatedAt: new Date().toISOString()
    };

    await kv.set(activityKey, data);

    // Send notifications if activity increased
    const gymIncreased = gymCount > previousGym;
    const cardioIncreased = cardioCount > previousCardio;

    if (gymIncreased || cardioIncreased) {
      const totalCount = gymCount + cardioCount;
      const progress = goal > 0 ? Math.min(Math.round((totalCount / goal) * 100), 100) : 0;
      const isComplete = totalCount >= goal;

      let activityType = '';
      let emoji = '';
      if (gymIncreased && cardioIncreased) {
        activityType = 'Gym & Cardio';
        emoji = '🏋️‍♀️❤️';
      } else if (gymIncreased) {
        activityType = 'Gym';
        emoji = '🏋️‍♀️';
      } else {
        activityType = 'Cardio';
        emoji = '❤️';
      }

      // Send Discord notification
      const webhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL');
      if (webhookUrl) {
        const discordMessage = {
          content: isComplete ? "🎉 **Goal Complete!** 🎉" : null,
          embeds: [{
            title: `${emoji} New ${activityType} Activity Logged!`,
            description: isComplete
              ? `Congratulations! You've reached your daily goal of ${goal} activities!`
              : `Keep up the great work!`,
            color: isComplete ? 0x57F287 : 0x5865F2,
            fields: [
              {
                name: "🏋️ Gym",
                value: `${gymCount}`,
                inline: true
              },
              {
                name: "❤️ Cardio",
                value: `${cardioCount}`,
                inline: true
              },
              {
                name: "📊 Progress",
                value: `${totalCount}/${goal} (${progress}%)`,
                inline: true
              }
            ],
            timestamp: new Date().toISOString()
          }]
        };

        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(discordMessage),
        }).catch(err => console.log('Discord notification error:', err));
      }

      // Send Telegram notification
      const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
      const chatId = Deno.env.get('TELEGRAM_CHAT_ID');
      if (botToken && chatId) {
        const header = isComplete ? '🎉 *Goal Complete!* 🎉' : `${emoji} *New ${activityType} Activity Logged!*`;
        const description = isComplete
          ? `Congratulations! You've reached your daily goal of ${goal} activities!`
          : 'Keep up the great work!';

        const telegramMessage = `${header}

${description}

🏋️ Gym: ${gymCount}
❤️ Cardio: ${cardioCount}
📊 Progress: ${totalCount}/${goal} (${progress}%)`;

        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: telegramMessage,
            parse_mode: 'Markdown'
          }),
        }).catch(err => console.log('Telegram notification error:', err));
      }
    }

    return c.json({ success: true, data });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.log('Error saving activity data:', errorMessage, errorStack);
    return c.json({
      error: 'Failed to save activity data',
      details: errorMessage
    }, 500);
  }
});

Deno.serve(app.fetch);