import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

let auth;
let calendar;

try {
    const credFile = process.env.GOOGLE_SERVICE_ACCOUNT_FILE
        ? path.resolve(process.env.GOOGLE_SERVICE_ACCOUNT_FILE)
        : path.join(__dirname, '..', 'google-service-account.json');

    if (fs.existsSync(credFile)) {
        auth = new google.auth.GoogleAuth({ keyFile: credFile, scopes: SCOPES });
    } else {
        console.warn('[Google Calendar] No credentials found. Calendar integration disabled.');
    }

    if (auth) calendar = google.calendar({ version: 'v3', auth });
} catch (err) {
    console.error('[Google Calendar] Failed to initialize client:', err.message);
}

export async function fetchGoogleCalendarEvents(calendarId, timeMin, timeMax) {
    if (!calendar) return [];

    try {
        const response = await calendar.events.list({
            calendarId: calendarId,
            timeMin: timeMin,
            timeMax: timeMax,
            maxResults: 250,
            singleEvents: true,
            orderBy: 'startTime',
        });
        return response.data.items || [];
    } catch (error) {
        console.error(`[Google Calendar] Error fetching events for ${calendarId}:`, error.message);
        return [];
    }
}

export async function listCalendars() {
    if (!calendar) return [];
    try {
        const response = await calendar.calendarList.list();
        return response.data.items || [];
    } catch (error) {
        console.error('[Google Calendar] Error listing calendars:', error.message);
        return [];
    }
}
