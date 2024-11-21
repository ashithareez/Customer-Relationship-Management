document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('#searchOpportunityInput');
    const searchButton = document.querySelector('#searchOpportunityButton');
    const resultsDiv = document.querySelector('#opportunityResults');

    searchButton.addEventListener('click', async () => {
        const query = searchInput.value.trim();

        if (!query) {
            alert('Please enter a search term.');
            return;
        }

        try {
            // Fetch search results from the backend
            const response = await fetch(`http://localhost:3000/opportunities/search?query=${query}`);
            const result = await response.json();

            // Clear previous results
            resultsDiv.innerHTML = '';

            if (response.ok) {
                if (result.results.length > 0) {
                    result.results.forEach((opportunity) => {
                        const opportunityDiv = document.createElement('div');
                        opportunityDiv.className = 'p-4 border-b';

                        opportunityDiv.innerHTML = `
                            <h3 class="text-lg font-bold">${opportunity.opportunity_name}</h3>
                            <p><strong>Stage:</strong> ${opportunity.opportunity_stage}</p>
                            <p><strong>Owner:</strong> ${opportunity.opportunity_owner}</p>
                            <p><strong>Account:</strong> ${opportunity.account_name}</p>
                            <p><strong>Created Date:</strong> ${opportunity.created_date}</p>
                            <p><strong>Comments:</strong> ${opportunity.comments || 'N/A'}</p>
                        `;
                        resultsDiv.appendChild(opportunityDiv);
                    });
                } else {
                    resultsDiv.innerHTML = '<p>No opportunities found.</p>';
                }
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error searching opportunities:', error);
            alert('An error occurred. Please try again.');
        }
    });
});
