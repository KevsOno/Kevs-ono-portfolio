const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  const { name, email } = JSON.parse(event.body);

  if (!email || !name) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing name or email' }),
    };
  }

  const brevoApiKey = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_LIST_ID);

  console.log("DEBUG: Brevo API Key present?", !!brevoApiKey);
  console.log("DEBUG: List ID:", listId);

  if (!brevoApiKey || !listId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server configuration error: Missing Brevo API key or List ID." }),
    };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify({
        email: email,
        attributes: { FIRSTNAME: name },
        listIds: [listId],
        updateEnabled: true,
      }),
    });

    let result = {};
    try {
      result = await response.json(); // Try to parse, but safely
    } catch (e) {
      console.log("No JSON returned (likely 204 No Content)");
    }

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ message: result.message || 'Brevo API error' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: '🎉 Thanks! You’re on the list (or already subscribed).' }),
    };
  } catch (err) {
    console.error("BREVO ERROR:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error', error: err.message || 'Unknown error' }),
    };
  }
};
