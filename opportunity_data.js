document.addEventListener('DOMContentLoaded', () => {
    // Fetch and display all accounts on page load
    async function fetchOpportunities() {
        try {
        const response = await fetch('http://localhost:3000/opportunities');
        if (!response.ok) {
            throw new Error('Failed to fetch opportunities');
        }

        const opportunities = await response.json();

        const tableBody = document.getElementById('opportunityTableBody');
        tableBody.innerHTML = ''; // Clear previous rows

        opportunities.forEach(opportunity => {
            const row = document.createElement('tr');
            row.classList.add('cursor-pointer', 'hover:bg-gray-100');
            row.addEventListener('click', () => {
                // Redirect to opportunity_detail.html with opportunity ID as a query parameter
                window.location.href = `opportunity_detail.html?opportunityId=${opportunity.opportunity_id}`;
            });

            row.innerHTML = `
                <td class="px-4 py-2">${opportunity.opportunity_name}</td>
                <td class="px-4 py-2">${opportunity.opportunity_stage}</td>
                <td class="px-4 py-2">${opportunity.opportunity_owner}</td>
                <td class="px-4 py-2">${opportunity.account_name}</td>
                <td class="px-4 py-2">${opportunity.contact_name}</td>
                <td class="px-4 py-2">${opportunity.comments}</td>
                <td class="px-4 py-2">${opportunity.created_date}</td>
                <td class="px-4 py-2">
                    <a href="opportunity_detail.html?opportunityId=${opportunity.opportunity_id}" 
                       class="text-blue-600 hover:underline">View</a>
                </td>
            `;
            tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching aopportunity:', error);
            alert('An error occurred while fetching opportunity.');
        }
    }

    // Fetch opportunity on page load
    fetchOpportunities();
});
