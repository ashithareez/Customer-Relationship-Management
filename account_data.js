document.addEventListener('DOMContentLoaded', () => {
    // Fetch and display all accounts on page load
    async function fetchAccounts() {
        try {
        const response = await fetch('http://localhost:3000/accounts');
        if (!response.ok) {
            throw new Error('Failed to fetch accounts');
        }

        const accounts = await response.json();

        const tableBody = document.getElementById('accountTableBody');
        tableBody.innerHTML = ''; // Clear previous rows

        accounts.forEach(account => {
            const row = document.createElement('tr');
            row.classList.add('cursor-pointer', 'hover:bg-gray-100');
            row.addEventListener('click', () => {
                // Redirect to account_detail.html with account ID as a query parameter
                window.location.href = `account_detail.html?accountId=${account.account_id}`;
            });

            row.innerHTML = `
                <td class="px-4 py-2">${account.account_name}</td>
                <td class="px-4 py-2">${account.account_owner}</td>
                <td class="px-4 py-2">${account.contact_name}</td>
                <td class="px-4 py-2">${account.email_address}</td>
                <td class="px-4 py-2">${account.phone_number}</td>
                <td class="px-4 py-2">${account.company_address}</td>
                <td class="px-4 py-2">${account.created_date}</td>
                <td class="px-4 py-2">
                    <a href="account_detail.html?accountId=${account.account_id}" 
                       class="text-blue-600 hover:underline">View</a>
                </td>
            `;
            tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching accounts:', error);
            alert('An error occurred while fetching accounts.');
        }
    }

    // Fetch accounts on page load
    fetchAccounts();
});
