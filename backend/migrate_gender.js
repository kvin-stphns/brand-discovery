const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
const { Product } = require('./models/productModel');

async function migrate() {
    if (!process.env.MONGODB_URI) {
        console.error('No MONGODB_URI');
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);

    const products = await Product.find({ gender: { $exists: false } });
    console.log(`Found ${products.length} products without gender.`);

    let updated = 0;
    for (const p of products) {
        let gender = 'Unisex';
        const url = p.canonicalUrl || '';
        if (url.includes('/men/') || url.includes('-men-')) gender = 'Men';
        else if (url.includes('/women/') || url.includes('-women-')) gender = 'Women';

        // Fallback to category check if URL is ambiguous
        if (gender === 'Unisex' && p.category && p.category.length) {
            const cats = p.category.map(c => c.toLowerCase());
            if (cats.includes('men') || cats.includes('mens')) gender = 'Men';
            else if (cats.includes('women') || cats.includes('womens')) gender = 'Women';
        }

        // p.gender = gender;
        // await p.save();
        await Product.updateOne({ _id: p._id }, { $set: { gender: gender } });
        updated++;
        if (updated % 10 === 0) console.log(`Updated ${updated}...`);
    }

    console.log(`Migration complete. Updated ${updated} products.`);
    process.exit(0);
}

migrate();
