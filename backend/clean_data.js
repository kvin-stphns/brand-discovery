const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
const { Product } = require('./models/productModel');

async function cleanData() {
    if (!process.env.MONGODB_URI) {
        console.error('No MONGODB_URI');
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);

    // Delete 429/Error pages
    const res1 = await Product.deleteMany({
        $or: [
            { title: { $regex: '429', $options: 'i' } },
            { title: { $regex: 'Too Many Requests', $options: 'i' } },
            { title: { $regex: 'Access Denied', $options: 'i' } },
            { title: { $regex: 'Just a moment', $options: 'i' } }
        ]
    });
    console.log(`Deleted ${res1.deletedCount} error page products.`);

    // Delete products with bloated titles (containing '{' or very long)
    const res2 = await Product.deleteMany({
        $or: [
            { title: { $regex: '{' } },
            { title: { $regex: 'var\\(' } }
        ]
    });
    console.log(`Deleted ${res2.deletedCount} products with garbage titles.`);

    process.exit(0);
}

cleanData();
