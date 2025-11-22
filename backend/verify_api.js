// const fetch = require('node-fetch'); // Native fetch in Node 18+

async function verifyApi() {
    const baseUrl = 'http://localhost:3001'; // Backend is on 3001
    // Wait for server to start
    await new Promise(r => setTimeout(r, 2000));

    console.log('Testing Men filter...');
    try {
        const resMen = await fetch(`${baseUrl}/api/products?gender=Men&limit=10`);
        const dataMen = await resMen.json();
        console.log(`Men Items: ${dataMen.items?.length}`);
        const menErrors = dataMen.items?.filter(i => i.gender !== 'Men');
        if (menErrors?.length) console.log('Error: Found non-Men items in Men filter:', menErrors.map(i => i.title));
        else console.log('Men filter PASS');
    } catch (e) { console.log('Men filter failed:', e.message); }

    console.log('Testing Women filter...');
    try {
        const resWomen = await fetch(`${baseUrl}/api/products?gender=Women&limit=10`);
        const dataWomen = await resWomen.json();
        console.log(`Women Items: ${dataWomen.items?.length}`);
        const womenErrors = dataWomen.items?.filter(i => i.gender !== 'Women');
        if (womenErrors?.length) console.log('Error: Found non-Women items in Women filter:', womenErrors.map(i => i.title));
        else console.log('Women filter PASS');
    } catch (e) { console.log('Women filter failed:', e.message); }
}

verifyApi();
