
import axios from 'axios';
import fs from 'fs';

const API_URL = 'http://localhost:3001/api';

async function checkCart() {
    try {
        console.log("Logging in as Ana...");
        const login = await axios.post(`${API_URL}/auth/login`, {
            email: 'ana@gmail.com',
            password: '123456'
        });
        const token = login.data.token;
        const headers = { Authorization: `Bearer ${token}` };

        console.log("Fetching My Rentals...");
        const res = await axios.get(`${API_URL}/rentals/my-rentals`, { headers });

        console.log(`Total Rentals Found: ${res.data.length}`);
        res.data.forEach((r: any, i: number) => {
            console.log(`[${i}] Item: ${r.itemTitle}, Status: ${r.status}, ID: ${r.id}`);
        });

        const drafts = res.data.filter((r: any) => r.status === 'DRAFT');
        console.log(`--- DRAFTS IN CART: ${drafts.length} ---`);

    } catch (error: any) {
        console.error("Error:", error.message);
        if (error.response) console.error("Data:", error.response.data);
    }
}

checkCart();
