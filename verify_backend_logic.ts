
import axios from 'axios';
import fs from 'fs';

const API_URL = 'http://localhost:3001/api';

const log = (msg: string, obj?: any) => {
    const out = msg + (obj ? ' ' + JSON.stringify(obj, null, 2) : '') + '\n';
    fs.appendFileSync('debug_output.txt', out);
    console.log(msg); // Keep some console output for progress
};

// Clear previous log
try { fs.unlinkSync('debug_output.txt'); } catch (e) { }

async function runTest() {
    try {
        log("1. Authenticating...");
        const email = `test.user.${Date.now()}@example.com`;
        const password = 'password123';

        let token = '';
        try {
            const reg = await axios.post(`${API_URL}/auth/register`, {
                name: 'Test User',
                email,
                password,
                role: 'RENTER'
            });
            token = reg.data.token;
        } catch (e) {
            log("Register failed, trying login...");
            const login = await axios.post(`${API_URL}/auth/login`, {
                email: 'test@example.com',
                password: 'password123'
            });
            token = login.data.token;
        }

        if (!token) throw new Error("Could not get token");
        log("Token obtained.");

        const headers = { Authorization: `Bearer ${token}` };

        log("2. Fetching Items...");
        const itemsRes = await axios.get(`${API_URL}/items`);
        const item = itemsRes.data[0];
        if (!item) throw new Error("No items found");
        log(`Testing with Item: ${item.id} (${item.title})`);

        log("3. Creating DRAFT Rental (Adding to Cart)...");
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date().toISOString().split('T')[0];

        try {
            await axios.post(`${API_URL}/rentals`, {
                itemId: item.id,
                startDate,
                endDate,
                totalPrice: 100,
                status: 'DRAFT'
            }, { headers });
            log("   Draft created successfully.");
        } catch (e: any) {
            log("   Draft creation note:", e.response?.data?.message || e.message);
        }

        log("4. Verifying Cart (GET /rentals/my-rentals)...");
        const myRentalsRes = await axios.get(`${API_URL}/rentals/my-rentals`, { headers });
        const drafts = myRentalsRes.data.filter((r: any) => r.status === 'DRAFT');
        log(`   Found ${drafts.length} DRAFT items in rentals.`);
        if (myRentalsRes.data.length > 0) {
            log("   SAMPLE RENTAL:", myRentalsRes.data[0]);
        }

        log("5. Creating BUSY Rental for Landing Page tag...");
        try {
            await axios.post(`${API_URL}/rentals`, {
                itemId: item.id,
                startDate,
                endDate,
                totalPrice: 100,
                status: 'CONFIRMED'
            }, { headers });
            log("   Confirmed rental created.");
        } catch (e: any) {
            log("   Rental creation note:", e.response?.data?.message || e.message);
        }

        log("6. Verifying Landing Page Status (GET /items)...");
        const itemsRefreshed = await axios.get(`${API_URL}/items`);
        const targetItem = itemsRefreshed.data.find((i: any) => i.id === item.id);

        log("   Item ID:", targetItem.id);
        log("   FULL ITEM OBJECT:", targetItem);

        if (targetItem.isRentedToday) log("   [PASS] isRentedToday found.");
        else log("   [FAIL] Property missing or false.");

    } catch (error: any) {
        log("CRITICAL TEST ERROR:", error.message);
        if (error.response) log("Response data:", error.response.data);
    }
}

runTest();
