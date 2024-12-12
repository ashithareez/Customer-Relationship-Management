document.addEventListener('DOMContentLoaded', () => {
    const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:8080' 
        : 'http://crmwebapp-env.eba-hur2mvaf.us-east-1.elasticbeanstalk.com';

    async function fetchOpportunities() {
        try {
            const response = await fetch(`${API_URL}/opportunities`);
            if (!response.ok) {
                throw new Error(`Failed to fetch opportunities. Status: ${response.status}`);
            }

            const opportunities = await response.json();
            console.log('Fetched opportunities:', opportunities); // Debug log

            const tableBody = document.getElementById('opportunityTableBody');
            tableBody.innerHTML = ''; // Clear previous rows

            opportunities.forEach(opportunity => {
                const row = document.createElement('tr');
                row.classList.add('cursor-pointer', 'hover:bg-gray-100');
                row.innerHTML = `
                    <td class="px-4 py-2">${opportunity.opportunity_name || ''}</td>
                    <td class="px-4 py-2">${opportunity.opportunity_stage || ''}</td>
                    <td class="px-4 py-2">${opportunity.opportunity_owner || ''}</td>
                    <td class="px-4 py-2">${opportunity.account_name || ''}</td>
                    <td class="px-4 py-2">${opportunity.contact_name || ''}</td>
                    <td class="px-4 py-2">${opportunity.comments || ''}</td>
                    <td class="px-4 py-2">${opportunity.created_date || ''}</td>
                    <td class="px-4 py-2">
                        <a href="opportunity_detail.html?opportunityId=${opportunity.opportunity_id}" 
                           class="text-blue-600 hover:underline">View</a>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching opportunities:', error);
            alert('An error occurred while fetching opportunities.');
        }
    }

    fetchOpportunities();
});
