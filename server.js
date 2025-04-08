import express from 'express';
import { supabase } from './src/supabaseClient.js'; // Updated import

const app = express();
const port = 3000;

// Middlewarve to parse JSON
app.use(express.json());

// Example route to fetch data from Supabase
app.get('/data', async (req, res) => {
    try {
        const { data, error } = await supabase.from('deposit').select('*');
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
