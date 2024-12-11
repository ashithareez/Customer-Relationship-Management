document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('#searchAccountInput');
    const searchButton = document.querySelector('#searchAccountButton');
    const resultsDiv = document.querySelector('#accountResults');

    searchButton.addEventListener('click', async () => {
        const query = searchInput.value.trim();

        if (!query) {
            alert('Please enter a search term.');
            return;
        }

        try {
            // Fetch search results from the backend
            const response = await fetch(`http://localhost:3000/accounts/search?query=${query}`);
            const result = await response.json();

            // Clear previous results
            resultsDiv.innerHTML = '';

            if (response.ok) {
                if (result.results.length > 0) {
                    result.results.forEach((account) => {
                        const accountDiv = document.createElement('div');
                        accountDiv.className = 'p-4 border-b';

                        accountDiv.innerHTML = `
                            <h3 class="text-lg font-bold">${account.account_name}</h3>
                            <p><strong>Owner:</strong> ${account.account_owner}</p>
                            <p><strong>Contact Name:</strong> ${account.contact_name}</p>
                            <p><strong>Phone Number:</strong> ${account.phone_number}</p>
                            <p><strong>Email Address:</strong> ${account.email_address}</p>
                            <p><strong>Company Address:</strong> ${account.company_address || 'N/A'}</p>
                            <p><strong>Created Date:</strong> ${account.created_date}</p>
                        `;
                        resultsDiv.appendChild(accountDiv);
                    });
                } else {
                    resultsDiv.innerHTML = '<p>No accounts found.</p>';
                }
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error searching accounts:', error);
            alert('An error occurred. Please try again.');
        }
    });
});
