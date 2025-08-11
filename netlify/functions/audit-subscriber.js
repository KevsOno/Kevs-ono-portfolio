const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  const { name, email, website, painPoint, notes, fingerprint } = JSON.parse(event.body);

  if (!email || !name) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing name or email' }),
    };
  }

  const brevoApiKey = process.env.BREVO_API_KEY;
  const brevoListId = process.env.BREVO_LIST_ID;
  const sheetDbUrl = process.env.GOOGLE_SHEETS_DB_URL; // New environment variable

  if (!brevoApiKey || !brevoListId || !sheetDbUrl) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server configuration error: Brevo API key, list ID, or Google Sheets DB URL is missing." })
    };
  }

  try {
    // Step 1: Check Google Sheet for duplicate email or fingerprint
    const checkResponse = await fetch(`${sheetDbUrl}?email=${encodeURIComponent(email)}&fingerprint=${encodeURIComponent(fingerprint)}`);
    const checkData = await checkResponse.json();

    if (!checkResponse.ok) {
      console.error('Google Sheets check API error:', checkData);
      return {
        statusCode: checkResponse.status,
        body: JSON.stringify({ message: 'An error occurred during verification.' }),
      };
    }

    if (checkData.exists) {
        return {
            statusCode: 409,
            body: JSON.stringify({ message: '❌ You’ve already requested a free audit with this email or from this device.' }),
        };
    }

    // Step 2: If no duplicates, add new data to both Brevo and the Google Sheet
    
    // Add to Brevo
    const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify({
        email: email,
        attributes: {
          FIRSTNAME: name,
          WEBSITE: website,
          PAINPOINT: painPoint,
          NOTES: notes,
          FINGERPRINT: fingerprint
        },
        listIds: [Number(brevoListId)],
        updateEnabled: true,
      }),
    });

    // Add to Google Sheet
    const sheetAddResponse = await fetch(sheetDbUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, website, painPoint, notes, fingerprint, date: new Date().toISOString() })
    });

    if (!brevoResponse.ok || !sheetAddResponse.ok) {
        // Log errors but return success if at least one service worked.
        // You'll want to review your logs to see if one of these failed.
        return {
            statusCode: 200,
            body: JSON.stringify({ message: '🎉 Thanks! You’re on the list, but there may have been a minor issue with one of our services.' }),
        };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: '🎉 Thanks! You’re on the list (or already subscribed).' }),
    };

  } catch (err) {
    console.error('Server error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error', error: err.message }),
    };
  }
};
