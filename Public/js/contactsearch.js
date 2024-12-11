document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('#searchContactInput');
    const searchButton = document.querySelector('#searchContactButton');
    const resultsDiv = document.querySelector('#contactResults');

    searchButton.addEventListener('click', async () => {
        const query = searchInput.value.trim();

        if (!query) {
            alert('Please enter a search term.');
            return;
        }

        try {
            // Fetch search results from the backend
            const response = await fetch(`http://localhost:3000/contacts/search?query=${query}`);
            const result = await response.json();

            // Clear previous results
            resultsDiv.innerHTML = '';

            if (response.ok) {
                if (result.results.length > 0) {
                    result.results.forEach((contact) => {
                        const contactDiv = document.createElement('div');
                        contactDiv.className = 'p-4 border-b';

                        contactDiv.innerHTML = `
                            <h3 class="text-lg font-bold">${contact.contact_name}</h3>
                            <p><strong>Account Name:</strong> ${contact.account_name}</p>
                            <p><strong>Contact Owner:</strong> ${contact.contact_owner}</p>
                            <p><strong>Phone Number:</strong> ${contact.phone_number}</p>
                            <p><strong>Email Address:</strong> ${contact.email_address}</p>
                            <p><strong>Company Address:</strong> ${contact.company_address || 'N/A'}</p>
                            <p><strong>Comments:</strong> ${contact.comments || 'N/A'}</p>
                            <p><strong>Created Date:</strong> ${contact.created_date}</p>
                        `;
                        resultsDiv.appendChild(contactDiv);
                    });
                } else {
                    resultsDiv.innerHTML = '<p>No contacts found.</p>';
                }
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error searching contacts:', error);
            alert('An error occurred. Please try again.');
        }
    });
});
