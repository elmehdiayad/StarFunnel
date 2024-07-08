import type { APIRoute } from "astro";
import { google } from "googleapis";

export const prerender = false;
let { GOOGLE_APPLICATION_CREDENTIALS_JSON } = import.meta.env;

const SPREADSHEET_ID = '16Q2rmYPJAez34M_FmrJdaLvu0PBYs3L5xFK-TllP8kE';
const SHEET_NAME = 'Sheet1';
const credentials = JSON.parse(GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}');


export const POST: APIRoute = async ({ request }) => {

  const { email, name, phone, quantity } = await request.json();

  // After sending the email, append data to Google Sheet
  try {
    const auth = new google.auth.GoogleAuth({

      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: "v4", auth: auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:E`, // Assuming you want to append to columns A to E
      valueInputOption: 'USER_ENTERED',
      requestBody: { // Use `requestBody` instead of `resource`
        values: [
          [new Date().toISOString(), name, email, phone, quantity],
        ],
      },
    });

    // Return success response
    return new Response(
      JSON.stringify({
        status: "ok",
        message: "Your message was sent successfully and added to our records!",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error appending to Google Sheet:', error);
    // Return error response
    return new Response(
      JSON.stringify({
        message: "error",
      }),
      { status: 500 }
    );
  }
};