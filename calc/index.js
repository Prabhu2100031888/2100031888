const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;

let accessToken = ""; 

const windowSize = 10;
let windowNumbers = [];

const identities = {
    'p': 'primes',
    'f': 'fibo',
    'e': 'even',
    'r': 'rand'
};

function calculateAverage(numbers) {
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length || 0;
}

app.use(express.json());

async function fetchAccessToken() {
    const credentials = {
            "companyName": "KLUNIVERSITY",
            "clientID": "d5871ea0-7c7a-4d8c-87aa-b3b6152c23be",
            "clientSecret": "sTMVAYgoHHzVAUCR",
            "ownerName": "BADARALA KOTI SATYA PRABHUDEV",
            "ownerEmail": "2100031888cseh@gmail.com",
            "rollNo": "2100031888"
    };

    try {
        const response = await axios.post('http://20.244.56.144/test/auth', credentials);
        return response.data.access_token;
    } catch (error) {
        console.error("Error fetching access token:", error.message);
        throw new Error("Failed to fetch token");
    }
}

async function initializeServer() {
    try {
        accessToken = await fetchAccessToken();
        console.log("Access token fetched successfully.");
    } catch (error) {
        console.error("Error initializing server:", error.message);
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

initializeServer();

app.get('/numbers/:numberid', async (req, res) => {
    const shortIdentifier = req.params.numberid;
    const fullIdentifier = identities[shortIdentifier];

    if (!fullIdentifier) {
        return res.status(400).json({ error: "Invalid request" });
    }

    try {
        const response = await axios.get(`http://20.244.56.144/test/${fullIdentifier}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const numbers = response.data.numbers || [];
        const uniqueNumbers = [...new Set(numbers)];

        if (windowNumbers.length >= windowSize) {
            windowNumbers.shift(); 
        }
        windowNumbers = [...windowNumbers, ...uniqueNumbers];

        const average = calculateAverage(windowNumbers);

        const responseData = {
            numbers: uniqueNumbers,
            windowPrevState: [...windowNumbers.slice(0, -uniqueNumbers.length)],
            windowCurrState: [...windowNumbers],
            avg: average.toFixed(2)
        };

        res.json(responseData);
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});
