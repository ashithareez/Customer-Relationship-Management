document.addEventListener('DOMContentLoaded', () => {
    // Fetch and display all contacts on page load
    async function fetchContacts() {
        try {
        const response = await fetch('http://localhost:3000/contacts');
        if (!response.ok) {
            throw new Error('Failed to fetch contacts');
        }

        const contacts = await response.json();

        const tableBody = document.getElementById('contactTableBody');
        tableBody.innerHTML = ''; // Clear previous rows

        contacts.forEach(contact => {
            const row = document.createElement('tr');
            row.classList.add('cursor-pointer', 'hover:bg-gray-100');
            row.addEventListener('click', () => {
                // Redirect to contact_detail.html with account ID as a query parameter
                window.location.href = `contact_detail.html?contactId=${contact.contact_id}`;
            });

            row.innerHTML = `
                <td class="px-4 py-2">${contact.contact_name}</td>
                <td class="px-4 py-2">${contact.account_name}</td>
                <td class="px-4 py-2">${contact.contact_owner}</td>
                <td class="px-4 py-2">${contact.title}</td>
                <td class="px-4 py-2">${contact.email_address}</td>
                <td class="px-4 py-2">${contact.phone_number}</td>
                <td class="px-4 py-2">${contact.company_address}</td>
                <td class="px-4 py-2">${contact.comments}</td>
                <td class="px-4 py-2">${contact.created_date}</td>
                <td class="px-4 py-2">
                    <a href="contact_detail.html?contactId=${contact.contact_id}" 
                       class="text-blue-600 hover:underline">View</a>
                </td>
            `;
            tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching contacts:', error);
            alert('An error occurred while fetching contacts.');
        }
    }

    // Fetch contacts on page load
    fetchContacts();
});
