const { GoogleSpreadsheet } = require('google-spreadsheet');

exports.handler = async function (event, context) {
    const docId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

    if (!docId || !clientEmail || !privateKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Server configuration error: Google credentials are missing.' }),
        };
    }

    const doc = new GoogleSpreadsheet(docId);

    try {
        await doc.useServiceAccountAuth({
            client_email: clientEmail,
            private_key: privateKey,
        });
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];

        if (event.httpMethod === 'GET') {
            const email = event.queryStringParameters.email;
            const fingerprint = event.queryStringParameters.fingerprint;

            if (!email && !fingerprint) {
                return { statusCode: 400, body: JSON.stringify({ message: 'Missing email or fingerprint parameter' }) };
            }

            const rows = await sheet.getRows();
            const exists = rows.some(row => row.email === email || row.fingerprint === fingerprint);

            return { statusCode: 200, body: JSON.stringify({ exists }) };

        } else if (event.httpMethod === 'POST') {
            const data = JSON.parse(event.body);
            await sheet.addRow(data);

            return { statusCode: 201, body: JSON.stringify({ message: 'Data added successfully!' }) };
        }

        return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };

    } catch (err) {
        console.error('Google Sheets function error:', err);
        return { statusCode: 500, body: JSON.stringify({ message: 'Server error', error: err.message }) };
    }
};
