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

    // Check if we're on the lead detail page
    const isDetailPage = window.location.pathname.includes('lead_detail.html');
    
    if (isDetailPage) {
        console.log('On lead detail page'); // Debug log

        // Add click handler for the edit button
        const editButton = document.querySelector('button[onclick="enableEditing()"]');
        if (editButton) {
            editButton.addEventListener('click', () => {
                const editableFields = document.querySelectorAll('[contenteditable]');
                editableFields.forEach(field => field.setAttribute('contenteditable', 'true'));
                document.getElementById('saveButton').classList.remove('hidden');
            });
        }

        // Add click handler for the save button
        const saveButton = document.getElementById('saveButton');
        if (saveButton) {
            console.log('Save button found'); // Debug log
            
            saveButton.addEventListener('click', async () => {
                console.log('Save button clicked'); // Debug log
                
                const leadId = new URLSearchParams(window.location.search).get('leadId');
                
                if (!leadId) {
                    alert('Invalid Lead ID.');
                    return;
                }

                try {
                    // Get the date value
                    const dateValue = document.getElementById('createdDate').innerText.trim();
                    
                    // Function to format date to YYYY-MM-DD
                    function formatDate(dateString) {
                        const date = new Date(dateString);
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        return `${year}-${month}-${day}`;
                    }

                    const updatedLead = {
                        lead_name: document.getElementById('leadName').innerText.trim(),
                        account_name: document.getElementById('accountName').innerText.trim(),
                        company_name: document.getElementById('companyName').innerText.trim(),
                        lead_owner: document.getElementById('leadOwner').innerText.trim(),
                        title: document.getElementById('title').innerText.trim(),
                        email_address: document.getElementById('emailAddress').innerText.trim(),
                        phone_number: document.getElementById('phoneNumber').innerText.trim(),
                        contact_name: document.getElementById('contactName').innerText.trim(),
                        created_date: formatDate(dateValue)  // Use the custom format function
                    };

                    console.log('Formatted date:', updatedLead.created_date); // Debug log
                    console.log('Sending updated data:', updatedLead); // Debug log

                    const response = await fetch(`http://localhost:3000/leads/${leadId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedLead)
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to update lead');
                    }

                    alert('Lead updated successfully!');
                    
                    // Disable editing after successful save
                    const editableFields = document.querySelectorAll('[contenteditable]');
                    editableFields.forEach(field => field.setAttribute('contenteditable', 'false'));
                    saveButton.classList.add('hidden');

                } catch (error) {
                    console.error('Error updating lead:', error);
                    alert('Error updating lead. Please try again.');
                }
            });
        } else {
            console.error('Save button not found'); // Debug log
        }
    } else {
        // We're on the leads list page, fetch and display leads
        fetchLeads();
    }
});

