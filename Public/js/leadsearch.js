document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('#searchLeadInput');
    const searchButton = document.querySelector('#searchLeadButton');
    const resultsDiv = document.querySelector('#leadResults');

    searchButton.addEventListener('click', async () => {
        const query = searchInput.value.trim();

        if (!query) {
            alert('Please enter a search term.');
            return;
        }

        try {
            // Fetch search results from the backend
            const response = await fetch(`http://localhost:3000/leads/search?query=${query}`);
            const result = await response.json();

            // Clear previous results
            resultsDiv.innerHTML = '';

            if (response.ok) {
                if (result.results.length > 0) {
                    result.results.forEach((lead) => {
                        const leadDiv = document.createElement('div');
                        leadDiv.className = 'p-4 border-b';

                        leadDiv.innerHTML = `
                            <h3 class="text-lg font-bold">${lead.lead_name}</h3>
                            <p><strong>Company Name:</strong> ${lead.company_name}</p>
                            <p><strong>Account Name:</strong> ${lead.account_name}</p>
                            <p><strong>Lead Owner:</strong> ${lead.lead_owner}</p>
                            <p><strong>Phone Number:</strong> ${lead.phone_number}</p>
                            <p><strong>Email Address:</strong> ${lead.email_address}</p>
                            <p><strong>Title:</strong> ${lead.title || 'N/A'}</p>
                            <p><strong>Created Date:</strong> ${lead.created_date}</p>
                        `;
                        resultsDiv.appendChild(leadDiv);
                    });
                } else {
                    resultsDiv.innerHTML = '<p>No leads found.</p>';
                }
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error searching leads:', error);
            alert('An error occurred. Please try again.');
        }
    });
});
