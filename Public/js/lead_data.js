// Add API URL configuration at the top of the file
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080' 
    : 'http://crmwebapp-env.eba-hur2mvaf.us-east-1.elasticbeanstalk.com';

document.addEventListener('DOMContentLoaded', () => {
    // Check if the current page is `Leads.html` or `lead_detail.html`
    const tableBody = document.getElementById('leadTableBody');
    const leadId = new URLSearchParams(window.location.search).get('leadId');

    if (tableBody) {
        // This block runs only if `tableBody` exists (i.e., on `Leads.html`)
        fetchLeads();
    } else if (leadId) {
        // This block runs only if `leadId` exists in the URL (i.e., on `lead_detail.html`)
        fetchLeadDetails(leadId);
    }

    // Function to fetch all leads (for Leads.html)
    async function fetchLeads() {
        try {
            console.log('Fetching leads from:', `${API_URL}/api/leads`);
            const response = await fetch(`${API_URL}/api/leads`);
            if (!response.ok) {
                throw new Error(`Failed to fetch leads. Status: ${response.status}`);
            }

            const leads = await response.json();
            console.log('Fetched leads:', leads);

            tableBody.innerHTML = ''; // Clear previous rows

            // Ensure leads is an array
            if (!Array.isArray(leads)) {
                throw new Error('Fetched leads data is not an array');
            }

            leads.forEach(lead => {
                const row = document.createElement('tr');
                row.classList.add('cursor-pointer', 'hover:bg-gray-100');
                row.innerHTML = `
                    <td class="px-4 py-2">${lead.lead_name || ''}</td>
                    <td class="px-4 py-2">${lead.account_name || ''}</td>
                    <td class="px-4 py-2">${lead.company_name || ''}</td>
                    <td class="px-4 py-2">${lead.lead_owner || ''}</td>
                    <td class="px-4 py-2">${lead.title || ''}</td>
                    <td class="px-4 py-2">${lead.email_address || ''}</td>
                    <td class="px-4 py-2">${lead.phone_number || ''}</td>
                    <td class="px-4 py-2">${lead.contact_name || ''}</td>
                    <td class="px-4 py-2">${lead.created_date || ''}</td>
                    <td class="px-4 py-2">
                        <a href="lead_detail.html?leadId=${lead.lead_id}" 
                           class="text-blue-600 hover:underline">View</a>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching leads:', error);
            alert(`An error occurred while fetching leads: ${error.message}`);
        }
    }

    // Function to fetch lead details (for lead_detail.html)
    async function fetchLeadDetails(leadId) {
        try {
            console.log('Fetching lead details from:', `${API_URL}/api/leads/${leadId}`);
            const response = await fetch(`${API_URL}/api/leads/${leadId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch lead details: ${response.statusText}`);
            }

            const lead = await response.json();
            console.log('Fetched lead details:', lead);

            // Populate fields with fetched lead data
            document.getElementById('leadName').innerText = lead.lead_name || '';
            document.getElementById('accountName').innerText = lead.account_name || '';
            document.getElementById('title').innerText = lead.title || '';
            document.getElementById('companyName').innerText = lead.company_name || '';
            document.getElementById('leadOwner').innerText = lead.lead_owner || '';
            document.getElementById('createdDate').innerText = lead.created_date || '';
            document.getElementById('phoneNumber').innerText = lead.phone_number || '';
            document.getElementById('emailAddress').innerText = lead.email_address || '';
            document.getElementById('contactName').innerText = lead.contact_name || '';
        } catch (error) {
            console.error('Error fetching lead details:', error);
            alert(`An error occurred while fetching lead details: ${error.message}`);
        }
    }
});
