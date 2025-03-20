export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  start_param?: string;
  added_to_attachment_menu?: boolean;
  allows_write_to_pm?: boolean;
}

export interface UserData extends TelegramUser {
  createdAt: Date;
  lastLogin: Date;
  groups: string[];
} 