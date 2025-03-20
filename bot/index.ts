import { Telegraf } from 'telegraf';
import type { Context } from 'telegraf';
import * as dotenv from 'dotenv';

// 環境変数の読み込み
if (process.env.NODE_ENV !== 'production') {
  console.log('Loading development environment variables...');
  dotenv.config({ path: '.env.local' });
} else {
  console.log('Using production environment variables...');
  dotenv.config();
}

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const WEBAPP_URL = process.env.WEBAPP_URL || '';

// URLの環境設定
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV || 'development',
  WEBAPP_URL: WEBAPP_URL,
  BOT_TOKEN: BOT_TOKEN ? 'Set' : 'Not set'
});

const bot = new Telegraf(BOT_TOKEN);

// Basic commands
bot.command('start', (ctx) => {
  ctx.reply('Welcome! Use /help to see available commands.');
});

bot.command('help', (ctx) => {
  ctx.reply(
    'Available commands:\n' +
    '/start - Start the bot\n' +
    '/help - Show this help message\n' +
    '/webapp - Open the Task Board web app'
  );
});

bot.command('webapp', async (ctx) => {
  try {
    const chatId = ctx.chat.id;
    // グループIDをBase64でエンコード
    const encodedGroupId = Buffer.from(chatId.toString()).toString('base64');
    
    console.log('Chat ID:', chatId);
    console.log('Encoded Group ID:', encodedGroupId);
    console.log('WEBAPP_URL:', process.env.WEBAPP_URL);
    
    // チャットにデバッグ情報も表示
    ctx.reply(`デバッグ情報:
Chat ID: ${chatId}
Encoded Group ID: ${encodedGroupId}
WEBAPP_URL: ${process.env.WEBAPP_URL}`);
    
    // デバッグパラメータを追加
    const webappUrl = `${process.env.WEBAPP_URL}?startapp=${encodedGroupId}`;
    console.log('Full WebApp URL:', webappUrl);

    ctx.reply('タスクボードを開く', {
      reply_markup: {
        inline_keyboard: [[
          { text: "Open App", url: webappUrl }
        ]]
      }
    });
  } catch (error) {
    console.error('Error in webapp command:', error);
    ctx.reply('エラーが発生しました。もう一度お試しください。');
  }
});

// デバッグ用：常にメッセージログを出力
bot.on('message', (ctx: Context) => {
  if (ctx.chat) {
    console.log('Received message in chat:', {
      chatId: ctx.chat.id,
      chatType: ctx.chat.type,
      messageText: 'message' in ctx.update ? 
        ('text' in ctx.update.message ? ctx.update.message.text : '[非テキストメッセージ]') 
        : '[不明なメッセージ]'
    });
    
    // チャットにデバッグ情報を送信
    if ('message' in ctx.update && 'text' in ctx.update.message && ctx.update.message.text.includes('/debug')) {
      const chatInfo = `Chat ID: ${ctx.chat.id}\nChat Type: ${ctx.chat.type}`;
      ctx.reply(`デバッグ情報:\n${chatInfo}`);
    }
  }
});

bot.command('debug', (ctx) => {
  const chatId = ctx.chat.id;
  const encodedGroupId = Buffer.from(chatId.toString()).toString('base64');
  const webappUrl = `${process.env.WEBAPP_URL}?startapp=${encodedGroupId}&debug=true`;
  
  ctx.reply(`デバッグ情報:
Chat ID: ${chatId}
Encoded Group ID: ${encodedGroupId}
WEBAPP_URL: ${process.env.WEBAPP_URL}
Full WebApp URL: ${webappUrl}
NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});

bot.launch().then(() => {
  console.log(`Bot is running in ${process.env.NODE_ENV || 'development'} mode...`);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 