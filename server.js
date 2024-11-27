const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'crmproject@2024',
    database: 'crmdatabase' // Enclose in backticks to handle space
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL!');
});

// ====== Account Routes ======

// Add a new account
app.post('/api/accounts', (req, res) => {
    const {
        accountName,     // Mandatory
        accountOwner,    // Optional
        contactName,     // Optional
        phoneNumber,     // Optional
        emailAddress,    // Mandatory
        companyAddress,  // Optional
        createdDate,     // Optional
    } = req.body;

    // Log the incoming data for debugging
    console.log('Received data for account:', req.body);

    // Check for mandatory fields
    if (!accountName || !emailAddress) {
        res.status(400).json({ message: 'Account Name and Email Address are required.' });
        return;
    }

    // Query for inserting data into the `account` table
    const query = `
        INSERT INTO \`account\` (account_name, account_owner, contact_name, phone_number, email_address, company_address, created_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        accountName,      // Mandatory
        accountOwner || null,
        contactName || null,
        phoneNumber || null,
        emailAddress,     // Mandatory
        companyAddress || null,
        createdDate || null,
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting account:', err);
            res.status(500).json({ message: 'Error creating account', error: err.message });
            return;
        }
        res.status(201).json({ message: 'Account created successfully', result });
    });
});

// getting data from database for search functionality 
app.get('/accounts/search', (req, res) => {
    const searchQuery = req.query.query;

    if (!searchQuery) {
        return res.status(400).json({ message: 'Search query is required.' });
    }

    const query = `
        SELECT * 
        FROM account 
        WHERE account_name LIKE ? 
        LIMIT 10
    `;
    const values = [`%${searchQuery}%`];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error searching accounts:', err);
            return res.status(500).json({ message: 'Error fetching accounts.', error: err.message });
        }

        res.status(200).json({ results });
    });
});


// Get account details by ID
app.get('/accounts/:id', (req, res) => {
    const accountId = req.params.id;

    const query = 'SELECT * FROM account WHERE account_id = ?';
    db.query(query, [accountId], (err, results) => {
        if (err) {
            console.error('Error fetching account details:', err);
            res.status(500).json({ message: 'Error fetching account details', error: err.message });
        } else if (results.length === 0) {
            res.status(404).json({ message: 'Account not found' });
        } else {
            res.status(200).json(results[0]);
        }
    });
});

// --- account.html all accounts display ---
app.get('/accounts', (req, res) => {
    const query = `
        SELECT 
            account_id, 
            account_name, 
            account_owner, 
            contact_name, 
            email_address, 
            phone_number, 
            company_address, 
            DATE_FORMAT(created_date, '%Y-%m-%d') as created_date
        FROM account
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching accounts:', err.message);
            res.status(500).json({ message: 'Error fetching accounts', error: err.message });
            return;
        }
        res.json(results);
    });
});

// -----account_detail.html -----

app.put('/accounts/:id', (req, res) => {
    const { id } = req.params;
    const { account_name, account_owner, contact_name, email_address, phone_number, created_date, company_address } = req.body;

    if (!id || id === 'null') {
        return res.status(400).json({ message: 'Invalid account ID.' });
    }

    const query = `
        UPDATE account
        SET 
            account_name = ?, 
            account_owner = ?, 
            contact_name = ?, 
            email_address = ?, 
            phone_number = ?, 
            created_date = ?, 
            company_address = ?
        WHERE account_id = ?
    `;

    db.query(query, [account_name, account_owner, contact_name, email_address, phone_number, created_date, company_address, id], (err, results) => {
        if (err) {
            console.error('Error updating account:', err.message);
            return res.status(500).json({ message: 'Error updating account', error: err.message });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Account not found.' });
        }

        res.json({ message: 'Account updated successfully.' });
    });
});



// ====== Contact Routes ======

// Add a new contact
app.post('/contacts', (req, res) => {
    const {
        contactName,
        title,
        accountName,
        contactOwner,
        phoneNumber,
        emailAddress,
        companyAddress,
        comments,
        createdDate,
    } = req.body;

    // Log incoming data for debugging
    console.log('Received data for contact:', req.body);

    // Insert query
    const query = `
        INSERT INTO \`contact\` (contact_name, title, account_name, contact_owner, phone_number, email_address, company_address, comments, created_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        contactName,
        title,
        accountName,
        contactOwner,
        phoneNumber,
        emailAddress,
        companyAddress,
        comments,
        createdDate,
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting contact:', err);
            res.status(500).json({ message: 'Error creating contact', error: err.message });
            return;
        }
        res.status(201).json({ message: 'Contact created successfully', result });
    });
});
// getting data from database for search functionality 
app.get('/contacts/search', (req, res) => {
    const searchQuery = req.query.query;

    if (!searchQuery) {
        return res.status(400).json({ message: 'Search query is required.' });
    }

    const query = `
        SELECT * 
        FROM contact 
        WHERE contact_name LIKE ? 
        LIMIT 10
    `;
    const values = [`%${searchQuery}%`];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error searching contacts:', err);
            return res.status(500).json({ message: 'Error fetching contacts.', error: err.message });
        }

        res.status(200).json({ results });
    });
});

// ====== Opportunity Routes ======

app.post('/opportunities', (req, res) => {
  const {
    opportunityName,
    opportunityStage,
    createdDate,
    accountName,
    contact,
    opportunityOwner,
    comments,
  } = req.body;

  const query = `
    INSERT INTO opportunity (opportunity_name, opportunity_stage, created_date, account_name, contact_name, opportunity_owner, comments)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [opportunityName, opportunityStage, createdDate, accountName, contact, opportunityOwner, comments];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting opportunity:', err);
      res.status(500).json({ message: 'Error creating opportunity', error: err.message });
      return;
    }
    res.status(201).json({ message: 'Opportunity created successfully', result });
  });
});

// Backend Route: Search Opportunities
app.get('/opportunities/search', (req, res) => {
    const { query } = req.query; // Extract search query from request

    const sqlQuery = `
        SELECT opportunity_name, opportunity_stage, opportunity_owner, created_date, account_name, comments
        FROM opportunity
        WHERE opportunity_name LIKE ? 
        LIMIT 10
    `;
    const values = [`%${query}%`];

    db.query(sqlQuery, values, (err, results) => {
        if (err) {
            console.error('Error searching opportunities:', err);
            res.status(500).json({ message: 'Error searching opportunities', error: err.message });
            return;
        }
        res.status(200).json({ message: 'Search results fetched successfully', results });
    });
});


// ====== Lead Routes ======

// Add a new lead
app.post('/leads', (req, res) => {
    const {
        leadName,
        accountName,
        contactName,
        leadOwner,
        phoneNumber,
        companyName,
        title,
        emailAddress,
        createdDate,
    } = req.body;

    // Log the incoming data for debugging
    console.log('Received data:', req.body);

    // Update the query with backticks around the table name `lead`
    const query = `
        INSERT INTO \`lead\` (lead_name, account_name, contact_name, lead_owner, phone_number, company_name, title, email_address, created_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        leadName,
        accountName,
        contactName,
        leadOwner,
        phoneNumber,
        companyName,
        title,
        emailAddress,
        createdDate,
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting lead:', err);
            res.status(500).json({ message: 'Error creating lead', error: err.message });
            return;
        }
        res.status(201).json({ message: 'Lead created successfully', result });
    });
});

app.get('/leads/search', (req, res) => {
    const searchQuery = req.query.query;

    if (!searchQuery) {
        return res.status(400).json({ message: 'Search query is required.' });
    }

    const query = `
        SELECT * 
        FROM \`lead\` 
        WHERE lead_name LIKE ? 
        LIMIT 10
    `;
    const values = [`%${searchQuery}%`];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error searching leads:', err);
            return res.status(500).json({ message: 'Error fetching leads.', error: err.message });
        }

        res.status(200).json({ results });
    });
});



// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

