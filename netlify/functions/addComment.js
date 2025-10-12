// /netlify/functions/addComment.js

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

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    try {
        const { postId, name, email, text } = JSON.parse(event.body);

        if (!postId || !name || !email || !text) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Missing required fields' }) };
        }
        
        const db = await connectToDatabase();
        const collection = db.collection('comments'); 

        const result = await collection.insertOne({
            postId, 
            name,
            email, 
            text,
            createdAt: new Date(),
            isApproved: false 
        });
        
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: 'Comment added successfully', 
                id: result.insertedId 
            }),
        };

    } catch (error) {
        console.error('Add Comment Error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to add comment', error: error.message }),
        };
    }
};
