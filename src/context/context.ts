import { Context, Scenes } from 'telegraf';

// Определите структуру данных сессии
interface SessionData extends Scenes.SceneSessionData {
  foundBooks?: Array<{
    fileName: string;
    fileLink: string;
    fileId: string;
    scheduledDate?: Date;
  }>;
  awaitingScheduleDate?: boolean;
  currentFileId?: string;
  selectedDay?: string;
  selectedMonth?: string;
  selectedYear?: string;
  selectedHour?: string;
  selectedMinute?: string;
  uploadedFile?: boolean;
  postText?: string;
  fileId?: string;
  fileName?: string;
  fileLink: string;
  scheduledDate?: Date;
}

// Определите кастомный контекст, который расширяет Scenes.SceneContext
export interface CustomContext extends Scenes.SceneContext<SessionData> {
  session: Scenes.SceneSession<SessionData>; // Используйте SessionData в качестве типа данных сессии
}
