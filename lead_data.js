document.addEventListener('DOMContentLoaded', async () => {
    // Fetch and display all leads on page load
    async function fetchLeads() {
        try {
            const response = await fetch('http://localhost:3000/leads');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const leads = await response.json();
            const tableBody = document.getElementById('leadTableBody');
            if (!tableBody) {
                console.error('Could not find leadTableBody element');
                return;
            }

            tableBody.innerHTML = ''; // Clear previous rows

            if (leads.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="10" class="px-4 py-2 text-center">No leads found</td>';
                tableBody.appendChild(row);
                return;
            }

            // Populate table rows
            leads.forEach(lead => {
                const row = document.createElement('tr');
                row.classList.add('cursor-pointer', 'hover:bg-gray-100');
                row.addEventListener('click', () => {
                    window.location.href = `lead_detail.html?leadId=${lead.lead_id}`;
                });

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
            const tableBody = document.getElementById('leadTableBody');
            if (tableBody) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="10" class="px-4 py-2 text-center text-red-500">
                            Error loading leads: ${error.message}
                        </td>
                    </tr>
                `;
            }
        }
    }

    // Fetch leads on page load
    fetchLeads();

    // Add event listener for the save button
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        saveButton.addEventListener('click', async (e) => {
            e.preventDefault();

            const urlParams = new URLSearchParams(window.location.search);
            const leadId = urlParams.get('leadId');

            if (!leadId) {
                alert('Invalid Lead ID.');
                return;
            }

            try {
                const updatedLead = {
                    lead_name: document.getElementById('lead_name').value.trim(),
                    account_name: document.getElementById('account_name').value.trim(),
                    company_name: document.getElementById('company_name').value.trim(),
                    lead_owner: document.getElementById('lead_owner').value.trim(),
                    title: document.getElementById('title').value.trim(),
                    email_address: document.getElementById('email_address').value.trim(),
                    phone_number: document.getElementById('phone_number').value.trim(),
                    contact_name: document.getElementById('contact_name').value.trim(),
                    created_date: document.getElementById('created_date').value.trim(),
                };

                const response = await fetch(`http://localhost:3000/leads/${leadId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedLead),
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                alert('Lead updated successfully!');
                window.location.href = 'leads.html'; // Redirect back to leads list
            } catch (error) {
                console.error('Error updating lead:', error);
                alert('Error updating lead. Please try again.');
            }
        });
    } else {
        console.error('Save button not found in the DOM.');
    }
});

