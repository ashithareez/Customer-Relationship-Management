document.addEventListener('DOMContentLoaded', () => {
    // Fetch and display all accounts on page load
    async function fetchLeads() {
        try {
        const response = await fetch('http://localhost:3000/leads');
        if (!response.ok) {
            throw new Error('Failed to fetch leads');
        }

        const leads = await response.json();

        const tableBody = document.getElementById('leadTableBody');
        tableBody.innerHTML = ''; // Clear previous rows

        leads.forEach(lead => {
            const row = document.createElement('tr');
            row.classList.add('cursor-pointer', 'hover:bg-gray-100');
            row.addEventListener('click', () => {
                // Redirect to lead_detail.html with lead ID as a query parameter
                window.location.href = `lead_detail.html?leadId=${lead.lead_id}`;
            });

            row.innerHTML = `
                <td class="px-4 py-2">${lead.lead_name}</td>
                <td class="px-4 py-2">${lead.lead_owner}</td>
                <td class="px-4 py-2">${lead.company_name}</td>
                <td class="px-4 py-2">${lead.account_name}</td>
                <td class="px-4 py-2">${lead.contact_name}</td>
                <td class="px-4 py-2">${lead.title}</td>
                <td class="px-4 py-2">${lead.email_address}</td>
                <td class="px-4 py-2">${lead.phone_number}</td>
                <td class="px-4 py-2">${lead.created_date}</td>
                <td class="px-4 py-2">
                    <a href="lead_detail.html?leadId=${lead.lead_id}" 
                       class="text-blue-600 hover:underline">View</a>
                </td>
            `;
            tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching leads:', error);
            alert('An error occurred while fetching leads.');
        }
    }

    // Fetch leads on page load
    fetchLeads();
});
