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

bot.command('webapp', (ctx) => {
  try {
    const chatId = ctx.chat.id;
    
    // Base64エンコード処理の詳細なデバッグ
    console.log('Original Chat ID (before encoding):', chatId);
    console.log('Chat ID as string:', chatId.toString());
    
    const buffer = Buffer.from(chatId.toString());
    console.log('Buffer created:', buffer);
    
    const encodedGroupId = buffer.toString('base64');
    console.log('Encoded Group ID:', encodedGroupId);
    
    // デコード確認
    const decodedBuffer = Buffer.from(encodedGroupId, 'base64');
    const decodedGroupId = decodedBuffer.toString();
    console.log('Decoded Group ID (verification):', decodedGroupId);
    
    // URLの生成（本番環境では設定されたWebアプリURLを使用）
    const webappUrl = `${WEBAPP_URL}?startapp=${encodedGroupId}`;
    
    console.log('Full Webapp URL:', webappUrl);
    console.log('Chat Info:', {
      chatId: chatId,
      chatType: ctx.chat.type,
      encodedGroupId: encodedGroupId,
      decodedGroupId: decodedGroupId,
      webappUrl: webappUrl
    });
    
    ctx.reply('タスクボードを開く', {
      reply_markup: {
        inline_keyboard: [[
          { text: "Open App", url: webappUrl }
        ]]
      }
    });
    
    // 常にデバッグ情報を表示
    ctx.reply(`テスト用情報:\nグループID: ${chatId}\nエンコードされたID: ${encodedGroupId}\n\nデコード確認: ${decodedGroupId}\n\nWebアプリURL: ${webappUrl}`);
  } catch (error) {
    console.error('Error in webapp command:', error);
    ctx.reply('タスクボードの起動中にエラーが発生しました。');
  }
});

// デバッグ用：開発環境でのみメッセージログを出力
if (process.env.NODE_ENV !== 'production') {
  bot.on('message', (ctx: Context) => {
    if (ctx.chat) {
      console.log('Received message in chat:', {
        chatId: ctx.chat.id,
        chatType: ctx.chat.type,
        messageText: 'message' in ctx.update ? 
          ('text' in ctx.update.message ? ctx.update.message.text : '[非テキストメッセージ]') 
          : '[不明なメッセージ]'
      });
    }
  });
}

bot.launch().then(() => {
  console.log(`Bot is running in ${process.env.NODE_ENV || 'development'} mode...`);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 