const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://crmwebapp-env.eba-hur2mvaf.us-east-1.elasticbeanstalk.com', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(bodyParser.json());

// Serve static files from the Public directory
app.use(express.static(path.join(__dirname, 'Public'), {
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.js')) {
            res.set('Content-Type', 'application/javascript');
        } else if (path.endsWith('.css')) {
            res.set('Content-Type', 'text/css');
        } else if (path.endsWith('.png')) {
            res.set('Content-Type', 'image/png');
        } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
            res.set('Content-Type', 'image/jpeg');
        }
    }
}));

// Route for default page - redirect to login
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

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
        console.error('Connection Config:', {
            server: config.server,
            database: config.database,
            user: config.user,
            port: config.port,
            options: config.options
        });
    });

    // ====== Login Route ======
app.post('/api/login', async (req, res) => {
    console.log('Login attempt received:', req.body);
    const { user_name, password } = req.body;

    // Validate input fields
    if (!user_name || !password) {
        console.log('Missing credentials');
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        // Check SQL connection state
        if (!sql.connected) {
            console.error('SQL connection is not established');
            await sql.connect(config);
            console.log('Reconnected to SQL Azure');
        }

        // Query matches exactly with the users table schema
        const query = `
            SELECT user_id, user_name, password
            FROM crmdatabase.dbo.users
            WHERE user_name = @user_name
        `;
        
        console.log('Executing query with user_name:', user_name);
        const request = new sql.Request();
        request.input('user_name', sql.VarChar(100), user_name);

        const result = await request.query(query);
        console.log('Query result:', result);

        // If no user found
        if (result.recordset.length === 0) {
            console.log('User not found:', user_name);
            return res.status(404).json({ message: 'User not found.' });
        }

        // User found, now check the password
        const user = result.recordset[0];
        console.log('User found, checking password');

        if (user.password !== password) {
            console.log('Invalid password for user:', user_name);
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        console.log('Login successful for user:', user_name);
        // Successful login
        res.status(200).json({ 
            message: 'Login successful',
            user: {
                user_id: user.user_id,
                user_name: user.user_name
            }
        });
    } catch (err) {
        console.error('Detailed login error:', err);
        console.error('Stack trace:', err.stack);
        res.status(500).json({ 
            message: 'Error during login', 
            error: err.message,
            details: 'Please check server logs for more information'
        });
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
app.get('/api/accounts', async (req, res) => {
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
        console.log('Accounts fetched:', result.recordset);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching accounts:', err);
        res.status(500).json({ message: 'Error fetching accounts', error: err.message });
    }
});

// Fetch account by ID
app.get('/api/accounts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `SELECT * FROM dbo.account WHERE account_id = @id`;
        const request = new sql.Request();
        request.input('id', sql.Int, id);
        const result = await request.query(query);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Account not found' });
        }
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error fetching account:', err);
        res.status(500).json({ message: 'Error fetching account', error: err.message });
    }
});

// Update account
app.put('/api/accounts/:id', async (req, res) => {
    const { id } = req.params;
    const {
        accountName,
        accountOwner,
        contactName,
        phoneNumber,
        emailAddress,
        companyAddress,
        createdDate
    } = req.body;

    try {
        const query = `
            UPDATE dbo.account
            SET 
                account_name = @accountName,
                account_owner = @accountOwner,
                contact_name = @contactName,
                phone_number = @phoneNumber,
                email_address = @emailAddress,
                company_address = @companyAddress,
                created_date = @createdDate
            WHERE account_id = @id
        `;
        
        const request = new sql.Request();
        request.input('id', sql.Int, id);
        request.input('accountName', sql.VarChar, accountName);
        request.input('accountOwner', sql.VarChar, accountOwner || null);
        request.input('contactName', sql.VarChar, contactName || null);
        request.input('phoneNumber', sql.VarChar, phoneNumber || null);
        request.input('emailAddress', sql.VarChar, emailAddress);
        request.input('companyAddress', sql.VarChar, companyAddress || null);
        request.input('createdDate', sql.Date, createdDate || null);

        const result = await request.query(query);
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Account not found' });
        }
        
        res.json({ message: 'Account updated successfully' });
    } catch (err) {
        console.error('Error updating account:', err);
        res.status(500).json({ message: 'Error updating account', error: err.message });
    }
});

// ====== Contact Routes ======

// Add a new contact
app.post('/api/contacts', async (req, res) => {
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
app.get('/api/contacts', async (req, res) => {
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
app.get('/api/contacts/:id', async (req, res) => {
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


app.put('/api/contacts/:id', async (req, res) => {
    const { id } = req.params;
    const { contact_name, account_name, contact_owner, title, email_address, phone_number, created_date, company_address, comments } = req.body;

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
app.post('/api/opportunities', async (req, res) => {
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
app.get('/api/opportunities', async (req, res) => {
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
app.get('/api/opportunities/:id', async (req, res) => {
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



app.put('/api/opportunities/:id', async (req, res) => {
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
app.post('/api/leads', async (req, res) => {
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
app.get('/api/leads', async (req, res) => {
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
app.get('/api/leads/:id', async (req, res) => {
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



app.put('/api/leads/:id', async (req, res) => {
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
// Removed duplicate login route

// Define routes for serving HTML pages
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public' ,'index.html'));
});
 
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
    console.log(`Server is running on port ${port}`);
});
