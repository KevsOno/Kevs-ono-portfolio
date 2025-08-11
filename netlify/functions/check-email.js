const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const email = event.queryStringParameters.email;

  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing email query parameter" }),
    };
  }

  const brevoApiKey = process.env.BREVO_API_KEY;

  if (!brevoApiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server configuration error: Brevo API key is missing." })
    };
  }

  try {
    const response = await fetch(`https://api.brevo.com/v3/contacts?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'api-key': brevoApiKey,
      },
    });

    const data = await response.json();

    if (!response.ok) {
        // If the contact doesn't exist, the API returns a 404
        if (response.status === 404) {
            return {
                statusCode: 200,
                body: JSON.stringify({ exists: false })
            };
        } else {
            console.error("Brevo API error:", data);
            return {
                statusCode: response.status,
                body: JSON.stringify({ message: data.message || 'Brevo API error' }),
            };
        }
    }

    // If the contact exists, Brevo returns a 200 with the contact data.
    return {
      statusCode: 200,
      body: JSON.stringify({ exists: true }),
    };

  } catch (err) {
    console.error("Server error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error', error: err.message }),
    };
  }
};
