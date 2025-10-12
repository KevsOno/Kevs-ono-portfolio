// /netlify/functions/getComments.js

const { MongoClient } = require('mongodb'); 
const uri = process.env.MONGO_URI; 
const client = new MongoClient(uri, { 
    serverSelectionTimeoutMS: 5000, 
    maxPoolSize: 1 
}); 
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        console.log('Using cached database connection.');
        return cachedDb;
    }
    await client.connect();
    // Database name confirmed by the user as 'your_database_name'
    cachedDb = client.db('your_database_name'); 
    console.log('New database connection established.');
    return cachedDb;
}

exports.handler = async function (event, context) {
    context.callbackWaitsForEmptyEventLoop = false; 

    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    const postId = event.queryStringParameters.postId;

    if (!postId) {
        return { statusCode: 400, body: JSON.stringify({ message: 'Missing postId query parameter' }) };
    }

    try {
        const db = await connectToDatabase();
        const collection = db.collection('comments');

        const comments = await collection
            .find({ 
                postId: postId,
                isApproved: true 
            })
            .sort({ createdAt: -1 }) 
            .project({ email: 0 }) 
            .toArray();

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(comments),
        };

    } catch (error) {
        console.error('Get Comments Error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to retrieve comments', error: error.message }),
        };
    }
};
