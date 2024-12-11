const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 8080;

app.use(express.json());
// Middleware
app.use(cors());
app.use(bodyParser.json());

// SQL Azure connection configuration
const config = {
    server: 'crmdatabaseproject.database.windows.net',
    database: 'crmdatabase',
    user: 'crmdatabaseproject',
    password: 'crmproject@2024',
    port: 1433,
    options: {
        encrypt: true,                // Required for Azure SQL
        trustServerCertificate: false // Ensures a secure connection
    }
};

// Connect to SQL Azure
sql.connect(config)
    .then(() => {
        console.log('Connected to SQL Azure!');
    })
    .catch(err => {
        console.error('Error connecting to SQL Azure:', err);
    });

    // ====== Login Route ======
app.post('/api/login', async (req, res) => {
    const { user_name, password } = req.body;

    // Validate input fields
    if (!user_name || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        // Query to check if the username and password exist in the database
        const query = `
            SELECT user_id, user_name, password
            FROM dbo.users
            WHERE user_name = @user_name
        `;
        
        const request = new sql.Request();
        request.input('user_name', sql.VarChar, user_name);

        const result = await request.query(query);

        // If no user found
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // User found, now check the password (you may want to hash it in a real application)
        const user = result.recordset[0];

        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Successful login
        res.status(200).json({ 
            message: 'Login successful',
            user: {
                user_id: user.user_id,
                user_name: user.user_name
            }
        });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Error during login', error: err.message });
    }
});
// ====== Account Routes ======

// Add a new account
app.post('/api/accounts', async (req, res) => {
    const {
        accountName,
        accountOwner,
        contactName,
        phoneNumber,
        emailAddress,
        companyAddress,
        createdDate,
    } = req.body;

    if (!accountName || !emailAddress) {
        return res.status(400).json({ message: 'Account Name and Email Address are required.' });
    }

    try {
        const query = `
            INSERT INTO dbo.account (account_name, account_owner, contact_name, phone_number, email_address, company_address, created_date)
            VALUES (@accountName, @accountOwner, @contactName, @phoneNumber, @emailAddress, @companyAddress, @createdDate)
        `;
        const request = new sql.Request();
        request.input('accountName', sql.VarChar, accountName);
        request.input('accountOwner', sql.VarChar, accountOwner || null);
        request.input('contactName', sql.VarChar, contactName || null);
        request.input('phoneNumber', sql.VarChar, phoneNumber || null);
        request.input('emailAddress', sql.VarChar, emailAddress);
        request.input('companyAddress', sql.VarChar, companyAddress || null);
        request.input('createdDate', sql.Date, createdDate || null);

        const result = await request.query(query);
        res.status(201).json({ message: 'Account created successfully', result });
    } catch (err) {
        console.error('Error inserting account:', err);
        res.status(500).json({ message: 'Error creating account', error: err.message });
    }
});

// Get all accounts
app.get('/accounts', async (req, res) => {
    try {
        const query = `
            SELECT 
                account_id, 
                account_name, 
                account_owner, 
                contact_name, 
                email_address, 
                phone_number, 
                company_address, 
                FORMAT(created_date, 'yyyy-MM-dd') as created_date
            FROM dbo.account
        `;
        const result = await sql.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching accounts:', err.message);
        res.status(500).json({ message: 'Error fetching accounts', error: err.message });
    }
});

// ====== account_detail.html ======

// Fetch all accounts
// Fetch account by ID
app.get('/accounts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `SELECT * FROM dbo.account WHERE account_id = @id`;
        const request = new sql.Request();
        request.input('id', sql.Int, id);

        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Account not found.' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error fetching account:', err);
        res.status(500).json({ message: 'Error fetching account', error: err.message });
    }
});



app.put('/accounts/:id', async (req, res) => {
    const { id } = req.params;
    const { account_name, account_owner, contact_name, email_address, phone_number, created_date, company_address } = req.body;

    if (!id || id === 'null') {
        return res.status(400).json({ message: 'Invalid account ID.' });
    }

    try {
        const query = `
            UPDATE dbo.account
            SET 
                account_name = @account_name,
                account_owner = @account_owner,
                contact_name = @contact_name,
                email_address = @email_address,
                phone_number = @phone_number,
                created_date = @created_date,
                company_address = @company_address
            WHERE account_id = @id
        `;

        const request = new sql.Request();
        request.input('account_name', sql.VarChar, account_name);
        request.input('account_owner', sql.VarChar, account_owner);
        request.input('contact_name', sql.VarChar, contact_name);
        request.input('email_address', sql.VarChar, email_address);
        request.input('phone_number', sql.VarChar, phone_number);
        request.input('created_date', sql.Date, created_date);
        request.input('company_address', sql.VarChar, company_address);
        request.input('id', sql.Int, id);

        const result = await request.query(query);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Account not found.' });
        }

        res.json({ message: 'Account updated successfully.' });
    } catch (err) {
        console.error('Error updating account:', err);
        res.status(500).json({ message: 'Error updating account', error: err.message });
    }
});
// ====== Contact Routes ======

// Add a new contact
app.post('/contacts', async (req, res) => {
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

    try {
        const query = `
            INSERT INTO dbo.contact (contact_name, title, account_name, contact_owner, phone_number, email_address, company_address, comments, created_date)
            VALUES (@contactName, @title, @accountName, @contactOwner, @phoneNumber, @emailAddress, @companyAddress, @comments, @createdDate)
        `;
        const request = new sql.Request();
        request.input('contactName', sql.VarChar, contactName);
        request.input('title', sql.VarChar, title);
        request.input('accountName', sql.VarChar, accountName);
        request.input('contactOwner', sql.VarChar, contactOwner);
        request.input('phoneNumber', sql.VarChar, phoneNumber);
        request.input('emailAddress', sql.VarChar, emailAddress);
        request.input('companyAddress', sql.VarChar, companyAddress);
        request.input('comments', sql.Text, comments);
        request.input('createdDate', sql.Date, createdDate);

        const result = await request.query(query);
        res.status(201).json({ message: 'Contact created successfully', result });
    } catch (err) {
        console.error('Error inserting contact:', err);
        res.status(500).json({ message: 'Error creating contact', error: err.message });
    }
});

// Get all contacts
app.get('/contacts', async (req, res) => {
    try {
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
                FORMAT(created_date, 'yyyy-MM-dd') as created_date
            FROM dbo.contact
        `;
        const result = await sql.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching contacts:', err.message);
        res.status(500).json({ message: 'Error fetching contacts', error: err.message });
    }
});

// ====== contact_detail.html ======

// Fetch contact by ID
app.get('/contacts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `SELECT * FROM dbo.contact WHERE contact_id = @id`;
        const request = new sql.Request();
        request.input('id', sql.Int, id);

        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Contact not found.' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error fetching contact:', err);
        res.status(500).json({ message: 'Error fetching contact', error: err.message });
    }
});


app.put('/contacts/:id', async (req, res) => {
    const { id } = req.params;
    const { contact_name, account_name, contact_owner, title, email_address, phone_number, created_date, company_address, comments } = req.body;

    if (!id || id === 'null') {
        return res.status(400).json({ message: 'Invalid contact ID.' });
    }

    try {
        const query = `
            UPDATE dbo.contact
            SET 
                contact_name = @contact_name,
                account_name = @account_name,
                contact_owner = @contact_owner,
                title = @title,
                email_address = @email_address,
                phone_number = @phone_number,
                created_date = @created_date,
                company_address = @company_address,
                comments = @comments
            WHERE contact_id = @id
        `;

        const request = new sql.Request();
        request.input('contact_name', sql.VarChar, contact_name);
        request.input('account_name', sql.VarChar, account_name);
        request.input('contact_owner', sql.VarChar, contact_owner);
        request.input('title', sql.VarChar, title);
        request.input('email_address', sql.VarChar, email_address);
        request.input('phone_number', sql.VarChar, phone_number);
        request.input('created_date', sql.Date, created_date);
        request.input('company_address', sql.VarChar, company_address);
        request.input('comments', sql.Text, comments);
        request.input('id', sql.Int, id);

        const result = await request.query(query);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Contact not found.' });
        }

        res.json({ message: 'Contact updated successfully.' });
    } catch (err) {
        console.error('Error updating contact:', err);
        res.status(500).json({ message: 'Error updating contact', error: err.message });
    }
});

// ====== Opportunity Routes ======

// Add a new opportunity
app.post('/opportunities', async (req, res) => {
    const {
        opportunityName,
        opportunityStage,
        opportunityOwner,
        accountName,
        contactName,
        comments,
        createdDate,
    } = req.body;

    try {
        const query = `
            INSERT INTO dbo.opportunity (opportunity_name, opportunity_stage, opportunity_owner, account_name, contact_name, comments, created_date)
            VALUES (@opportunityName, @opportunityStage, @opportunityOwner, @accountName, @contactName, @comments, @createdDate)
        `;
        const request = new sql.Request();
        request.input('opportunityName', sql.VarChar, opportunityName);
        request.input('opportunityStage', sql.VarChar, opportunityStage);
        request.input('opportunityOwner', sql.VarChar, opportunityOwner);
        request.input('accountName', sql.VarChar, accountName);
        request.input('contactName', sql.VarChar, contactName);
        request.input('comments', sql.Text, comments);
        request.input('createdDate', sql.Date, createdDate);

        const result = await request.query(query);
        res.status(201).json({ message: 'Opportunity created successfully', result });
    } catch (err) {
        console.error('Error inserting opportunity:', err);
        res.status(500).json({ message: 'Error creating opportunity', error: err.message });
    }
});

// Get all opportunities
app.get('/opportunities', async (req, res) => {
    try {
        const query = `
            SELECT 
                opportunity_id, 
                opportunity_name, 
                opportunity_stage,
                opportunity_owner, 
                account_name,
                contact_name, 
                comments, 
                FORMAT(created_date, 'yyyy-MM-dd') as created_date
            FROM dbo.opportunity
        `;
        const result = await sql.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching opportunities:', err.message);
        res.status(500).json({ message: 'Error fetching opportunities', error: err.message });
    }
});

// ====== opportunity_detail.html ======

// Fetch opportunity by ID
app.get('/opportunities/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `SELECT * FROM dbo.opportunity WHERE opportunity_id = @id`;
        const request = new sql.Request();
        request.input('id', sql.Int, id);

        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Opportunity not found.' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error fetching opportunity:', err);
        res.status(500).json({ message: 'Error fetching opportunity', error: err.message });
    }
});



app.put('/opportunities/:id', async (req, res) => {
    const { id } = req.params;
    const { opportunity_name, opportunity_stage, opportunity_owner, account_name, contact_name, created_date, comments } = req.body;

    try {
        const query = `
            UPDATE dbo.opportunity
            SET 
                opportunity_name = @opportunity_name,
                opportunity_stage = @opportunity_stage,
                opportunity_owner = @opportunity_owner,
                account_name = @account_name,
                contact_name = @contact_name,
                created_date = @created_date,
                comments = @comments
            WHERE opportunity_id = @id
        `;

        const request = new sql.Request();
        request.input('opportunity_name', sql.VarChar, opportunity_name);
        request.input('opportunity_stage', sql.VarChar, opportunity_stage);
        request.input('opportunity_owner', sql.VarChar, opportunity_owner);
        request.input('account_name', sql.VarChar, account_name);
        request.input('contact_name', sql.VarChar, contact_name);
        request.input('created_date', sql.Date, created_date);
        request.input('comments', sql.Text, comments);
        request.input('id', sql.Int, id);

        const result = await request.query(query);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Opportunity not found.' });
        }

        res.json({ message: 'Opportunity updated successfully.' });
    } catch (err) {
        console.error('Error updating opportunity:', err);
        res.status(500).json({ message: 'Error updating opportunity', error: err.message });
    }
});

// ====== Lead Routes ======

// Add a new lead
app.post('/leads', async (req, res) => {
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

    if (!leadName || !emailAddress) {
        return res.status(400).json({ message: 'Lead Name and Email Address are required.' });
    }

    try {
        const query = `
            INSERT INTO dbo.lead (lead_name, account_name, contact_name, lead_owner, phone_number, company_name, title, email_address, created_date)
            VALUES (@leadName, @accountName, @contactName, @leadOwner, @phoneNumber, @companyName, @title, @emailAddress, @createdDate)
        `;
        const request = new sql.Request();
        request.input('leadName', sql.VarChar, leadName);
        request.input('accountName', sql.VarChar, accountName);
        request.input('contactName', sql.VarChar, contactName);
        request.input('leadOwner', sql.VarChar, leadOwner);
        request.input('phoneNumber', sql.VarChar, phoneNumber);
        request.input('companyName', sql.VarChar, companyName);
        request.input('title', sql.VarChar, title);
        request.input('emailAddress', sql.VarChar, emailAddress);
        request.input('createdDate', sql.Date, createdDate);

        const result = await request.query(query);
        res.status(201).json({ message: 'Lead created successfully', result });
    } catch (err) {
        console.error('Error inserting lead:', err);
        res.status(500).json({ message: 'Error creating lead', error: err.message });
    }
});

// Get all leads
app.get('/leads', async (req, res) => {
    try {
        const query = `
            SELECT 
                lead_id, 
                lead_name,
                account_name, 
                contact_name, 
                lead_owner, 
                phone_number, 
                company_name, 
                title, 
                email_address, 
                FORMAT(created_date, 'yyyy-MM-dd') as created_date
            FROM dbo.lead
        `;
        const result = await sql.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching leads:', err.message);
        res.status(500).json({ message: 'Error fetching leads', error: err.message });
    }
});

// ====== lead_detail.html ======

// Fetch lead by ID
app.get('/leads/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `SELECT * FROM dbo.lead WHERE lead_id = @id`;
        const request = new sql.Request();
        request.input('id', sql.Int, id);

        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Lead not found.' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error fetching lead:', err);
        res.status(500).json({ message: 'Error fetching lead', error: err.message });
    }
});



app.put('/leads/:id', async (req, res) => {
    const { id } = req.params;
    const { lead_name, account_name, company_name, lead_owner, title, email_address, phone_number, contact_name, created_date } = req.body;

    try {
        const query = `
            UPDATE dbo.lead
            SET 
                lead_name = @lead_name,
                account_name = @account_name,
                company_name = @company_name,
                lead_owner = @lead_owner,
                title = @title,
                email_address = @email_address,
                phone_number = @phone_number,
                contact_name = @contact_name,
                created_date = @created_date
            WHERE lead_id = @id
        `;

        const request = new sql.Request();
        request.input('lead_name', sql.VarChar, lead_name);
        request.input('account_name', sql.VarChar, account_name);
        request.input('company_name', sql.VarChar, company_name);
        request.input('lead_owner', sql.VarChar, lead_owner);
        request.input('title', sql.VarChar, title);
        request.input('email_address', sql.VarChar, email_address);
        request.input('phone_number', sql.VarChar, phone_number);
        request.input('contact_name', sql.VarChar, contact_name);
        request.input('created_date', sql.Date, created_date);
        request.input('id', sql.Int, id);

        const result = await request.query(query);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Lead not found.' });
        }

        res.json({ message: 'Lead updated successfully.' });
    } catch (err) {
        console.error('Error updating lead:', err);
        res.status(500).json({ message: 'Error updating lead', error: err.message });
    }
});
// ====== Login Route ======
app.post('/api/login', async (req, res) => {
    const { user_name, password } = req.body;

    // Validate input fields
    if (!user_name || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        // Query to check if the username and password exist in the database
        const query = `
            SELECT user_id, user_name, password
            FROM dbo.users
            WHERE user_name = @user_name
        `;
        
        const request = new sql.Request();
        request.input('user_name', sql.VarChar, user_name);

        const result = await request.query(query);

        // If no user found
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // User found, now check the password (you may want to hash it in a real application)
        const user = result.recordset[0];

        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Successful login
        res.status(200).json({ 
            message: 'Login successful',
            user: {
                user_id: user.user_id,
                user_name: user.user_name
            }
        });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Error during login', error: err.message });
    }
});


const path = require('path');
//const router = express.Router();
 

 
// Define routes for serving HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,  'Public' ,'login.html'));
});
 
app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public' , 'index.html'));
});
app.use(express.static(path.join(__dirname, 'Public')));
// Account routes
app.get('/account.html',  (req, res) => {
    //res.type('text/html');
    res.sendFile(path.join(__dirname, 'Public' ,'account.html'));
});
 
app.get('/account_form.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public' , 'account_form.html'));
});
 
app.get('/account_detail.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public' , 'account_detail.html'));
});
 
// Contact routes
app.get('/contact.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public' , 'contact.html'));
});
 
app.get('/contact_form.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public' , 'contact_form.html'));
});
 
app.get('/contact_detail.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public' , 'contact_detail.html'));
});
 
// Lead routes
app.get('/Leads.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public' , 'Leads.html'));
});
 
app.get('/lead_form.html', (req, res) => {
    res.sendFile(path.join(__dirname,'Public' ,  'lead_form.html'));
});
 
app.get('/lead_detail.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public' , 'lead_detail.html'));
});
 
// Opportunity routes
app.get('/Opportunity.html', (req, res) => {
    res.sendFile(path.join(__dirname,'Public' ,  'Opportunity.html'));
});
 
app.get('/opportunity_form.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public' , 'opportunity_form.html'));
});
 
app.get('/opportunity_detail.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public' , 'opportunity_detail.html'));
});
 
// Error handling for undefined routes

 
module.exports = app;

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
