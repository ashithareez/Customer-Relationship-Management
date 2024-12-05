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

// Get contact details by ID
app.get('/contacts/:id', (req, res) => {
    const contactId = req.params.id;

    const query = 'SELECT * FROM contact WHERE contact_id = ?';
    db.query(query, [contactId], (err, results) => {
        if (err) {
            console.error('Error fetching contact details:', err);
            res.status(500).json({ message: 'Error fetching contact details', error: err.message });
        } else if (results.length === 0) {
            res.status(404).json({ message: 'Contact not found' });
        } else {
            res.status(200).json(results[0]);
        }
    });
});

// --- contact.html all contacts display ---
app.get('/contacts', (req, res) => {
    const query = `
        SELECT 
            contact_id, 
            contact_name,
            account_name, 
            contact_owner, 
            title, 
            email_address, 
            phone_number, 
            company_address, 
            comments,
            DATE_FORMAT(created_date, '%Y-%m-%d') as created_date
        FROM contact
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching contacts:', err.message);
            res.status(500).json({ message: 'Error fetching contacts', error: err.message });
            return;
        }
        res.json(results);
    });
});

// -----contact_detail.html -----

app.put('/contacts/:id', (req, res) => {
    const { id } = req.params;
    const { contact_name, account_name, contact_owner, title, email_address, phone_number, created_date, company_address, comments } = req.body;

    if (!id || id === 'null') {
        return res.status(400).json({ message: 'Invalid contact ID.' });
    }

    const query = `
        UPDATE contact
        SET 
            contact_name = ?,
            account_name = ?, 
            contact_owner = ?, 
            title = ?, 
            email_address = ?, 
            phone_number = ?, 
            created_date = ?, 
            company_address = ?,
            comments = ?
        WHERE contact_id = ?
    `;

    db.query(query, [contact_name, account_name, contact_owner, title, email_address, phone_number, created_date, company_address, comments, id], (err, results) => {
        if (err) {
            console.error('Error updating contact:', err.message);
            return res.status(500).json({ message: 'Error updating contact', error: err.message });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Contact not found.' });
        }

        res.json({ message: 'Contact updated successfully.' });
    });
});


// ====== Opportunity Routes ======

app.post('/opportunities', (req, res) => {
  const {
    opportunityName,
    opportunityStage,
    opportunityOwner,
    accountName,
    contactName,
    comments,
    createdDate,
  } = req.body;

  // Log the incoming data for debugging
  console.log('Received data for opportunity:', req.body);

  const query = `
    INSERT INTO \`opportunity\` (opportunity_name, opportunity_stage, opportunity_owner, account_name, contact_name, comments, created_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [opportunityName, opportunityStage, opportunityOwner, accountName, contactName, comments, createdDate];

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

// Get opportunity details by ID
app.get('/opportunities/:id', (req, res) => {
    const opportunityId = req.params.id;
    console.log('Fetching opportunity with ID:', opportunityId);

    const query = 'SELECT * FROM opportunity WHERE opportunity_id = ?';
    db.query(query, [opportunityId], (err, results) => {
        if (err) {
            console.error('Error fetching opportunity details:', err);
            res.status(500).json({ message: 'Error fetching opportunity details', error: err.message });
            return;
        }
        
        if (results.length === 0) {
            console.log('No opportunity found with ID:', opportunityId);
            res.status(404).json({ message: 'Opportunity not found' });
            return;
        }
        
        console.log('Found opportunity:', results[0]);
        res.status(200).json(results[0]);
    });
});

// --- opportunity.html all opportunity display ---
app.get('/opportunities', (req, res) => {
    const query = `
        SELECT 
            opportunity_id, 
            opportunity_name, 
            opportunity_stage,
            opportunity_owner, 
            account_name,
            contact_name, 
            comments, 
            DATE_FORMAT(created_date, '%Y-%m-%d') as created_date
        FROM opportunity
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching opportunities:', err.message);
            res.status(500).json({ message: 'Error fetching opportunities', error: err.message });
            return;
        }
        res.json(results);
    });
});

// -----opportunity_detail.html -----

app.put('/opportunities/:id', (req, res) => {
    const { id } = req.params;
    const { 
        opportunity_name, 
        opportunity_stage, 
        opportunity_owner, 
        account_name, 
        contact_name, 
        created_date, 
        comments 
    } = req.body;

    // Format the date to YYYY-MM-DD
    const formattedDate = new Date(created_date).toISOString().split('T')[0];

    const query = `
        UPDATE opportunity
        SET 
            opportunity_name = ?, 
            opportunity_stage = ?,
            opportunity_owner = ?,
            account_name = ?, 
            contact_name = ?, 
            created_date = ?,
            comments = ?
        WHERE opportunity_id = ?
    `;

    const values = [
        opportunity_name, 
        opportunity_stage, 
        opportunity_owner, 
        account_name, 
        contact_name, 
        formattedDate,  // Use the formatted date
        comments, 
        id
    ];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error updating opportunity:', err);
            return res.status(500).json({ 
                message: 'Error updating opportunity', 
                error: err.message 
            });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Opportunity not found.' });
        }

        res.json({ message: 'Opportunity updated successfully.' });
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

// Get lead details by ID
app.get('/leads/:id', (req, res) => {
    const leadId = req.params.id;

    const query = 'SELECT * FROM `lead` WHERE lead_id = ?';
    db.query(query, [leadId], (err, results) => {
        if (err) {
            console.error('Error fetching lead details:', err);
            res.status(500).json({ message: 'Error fetching lead details', error: err.message });
        } else if (results.length === 0) {
            res.status(404).json({ message: 'Lead not found' });
        } else {
            res.status(200).json(results[0]);
        }
    });
});

// --- Leads.html all leads display ---
app.get('/leads', (req, res) => {
    const query = `
        SELECT 
            \`lead_id\`, 
            \`lead_name\`,
            \`account_name\`, 
            \`lead_owner\`, 
            \`contact_name\`, 
            \`email_address\`, 
            \`phone_number\`, 
            \`company_name\`, 
            \`title\`,
            DATE_FORMAT(\`created_date\`, '%Y-%m-%d') as created_date
        FROM \`lead\`
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching leads:', err.message);
            res.status(500).json({ message: 'Error fetching leads', error: err.message });
            return;
        }
        console.log('Leads fetched successfully:', results); // Add this log
        res.json(results);
    });
});

// -----lead_detail.html -----

app.put('/leads/:id', (req, res) => {
    const { id } = req.params;
    const { 
        lead_name, 
        account_name, 
        company_name,
        lead_owner,
        title,
        email_address,
        phone_number,
        contact_name,
        created_date 
    } = req.body;

    console.log('Received date:', created_date); // Debug log

    // Updated the table name from 'leads' to 'lead' and added backticks
    const query = `
        UPDATE \`lead\` 
        SET 
            lead_name = ?,
            account_name = ?,
            company_name = ?,
            lead_owner = ?,
            title = ?,
            email_address = ?,
            phone_number = ?,
            contact_name = ?,
            created_date = STR_TO_DATE(?, '%Y-%m-%d')
        WHERE lead_id = ?
    `;

    const values = [
        lead_name,
        account_name,
        company_name,
        lead_owner,
        title,
        email_address,
        phone_number,
        contact_name,
        created_date,
        id
    ];

    console.log('Query values:', values); // Debug log

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error updating lead:', err);
            return res.status(500).json({ 
                message: 'Error updating lead', 
                error: err.message 
            });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Lead not found.' });
        }

        res.json({ message: 'Lead updated successfully.' });
    });
});

// Add login route
app.post('/login', (req, res) => {
    const { email_address, password } = req.body;

    if (!email_address || !password) {
        return res.status(400).json({ message: 'Email address and password are required.' });
    }

    // Query the database for the user
    const query = 'SELECT * FROM users WHERE email_address = ?';
    db.query(query, [email_address], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ message: 'Error during authentication', error: err.message });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Compare the provided password with the hashed password in the database
        const user = results[0];
        bcrypt.compare(password, user.password, (err, match) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).json({ message: 'Error during authentication', error: err.message });
            }

            if (match) {
                res.status(200).json({ message: 'Login successful', user_id: user.user_id, email_address: user.email_address });
            } else {
                res.status(401).json({ message: 'Invalid credentials.' });
            }
        });
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

function viewContact(contactId) {
  window.location.href = `contact_detail.html?contactId=${contactId}`;
}

