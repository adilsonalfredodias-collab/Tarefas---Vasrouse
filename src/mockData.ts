import { Profile, HRData, Task, Notification, DailyReport } from "./types";
import { defaultAuthorizedProfiles, defaultAuthorizedTasks } from "./data/authorizedUsers";

export const initialProfiles: Profile[] = defaultAuthorizedProfiles;
export const initialHRData: Record<string, HRData> = {};
export const initialTasks: Task[] = defaultAuthorizedTasks;
export const initialNotifications: Notification[] = [];
export const initialDailyReports: DailyReport[] = [];


