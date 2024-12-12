// Add API URL configuration at the top of the file
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080' 
    : 'http://crmwebapp-env.eba-hur2mvaf.us-east-1.elasticbeanstalk.com';

document.addEventListener('DOMContentLoaded', () => {
    async function fetchAccounts() {
        try {
            // Add console.log to debug
            console.log('Fetching from:', `${API_URL}/accounts`);
            
            const response = await fetch(`${API_URL}/api/accounts`);
            
            // Log the response status
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch accounts. Status: ${response.status}`);
            }

            const accounts = await response.json();
            console.log('Fetched accounts:', accounts);

            const tableBody = document.getElementById('accountTableBody');
            tableBody.innerHTML = '';

            accounts.forEach(account => {
                const row = document.createElement('tr');
                row.classList.add('cursor-pointer', 'hover:bg-gray-100');
                row.innerHTML = `
                    <td class="px-4 py-2">${account.account_name || ''}</td>
                    <td class="px-4 py-2">${account.account_owner || ''}</td>
                    <td class="px-4 py-2">${account.contact_name || ''}</td>
                    <td class="px-4 py-2">${account.email_address || ''}</td>
                    <td class="px-4 py-2">${account.phone_number || ''}</td>
                    <td class="px-4 py-2">${account.company_address || ''}</td>
                    <td class="px-4 py-2">${account.created_date || ''}</td>
                    <td class="px-4 py-2">
                        <a href="account_detail.html?accountId=${account.account_id}" 
                           class="text-blue-600 hover:underline">View</a>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Detailed error:', error);
            // Log the full error details
            if (error.response) {
                console.log('Response:', await error.response.text());
            }
        }
    }

    fetchAccounts();
});
