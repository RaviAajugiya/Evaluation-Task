let PartyData;
const token = localStorage.getItem('token');
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

const loadData = async (url) => {

    const options = {
        method: 'GET',
        headers: headers,
    };
    const res = await fetch(url, options);
    if (res.status === 401) {
        window.location.href = '/login.html';
        return;
    }
    PartyData = await res.json();
    $('#example').DataTable({
        data: PartyData,
        columns: [
            { data: 'partyId', title: 'Party ID' },
            { data: 'partyName', title: 'Party Name' },
            {
                title: 'Actions',
                render: function (data, type, row) {
                    return `
                        <button class="btn btn-warning btn-sm" onclick="editParty(${row.partyId})">
                            <i class="bi bi-pencil-fill"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm ms-2" onclick="deleteParty(${row.partyId})">
                            <i class="bi bi-trash-fill"></i> Delete
                        </button>
                    `;
                }
            }
        ]
    });
}


async function editParty(partyId) {
    location.href = `/indexpartyAdd.html?partyId=${partyId}`;
}

function deleteParty(partyId) {
    if (confirm('Are you sure you want to delete this party?')) {
        fetch(`https://localhost:44309/api/party/${partyId}`, {
            method: 'DELETE',
            headers: headers
        })
            .then(response => {
                if (response.ok) {
                    const index = PartyData.findIndex(party => party.partyId === partyId);
                    if (index !== -1) {
                        PartyData.splice(index, 1);
                        $('#example').DataTable().clear().rows.add(PartyData).draw();
                    }
                } else {
                    console.error('Failed to delete party:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Error deleting party:', error);
            });
    }
}

loadData('https://localhost:44309/api/party');



$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const partyId = urlParams.get('partyId');

    if (partyId) {
        $.ajax({
            url: `https://localhost:44309/api/party/${partyId}`,
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            success: function (data) {
                $('#partyName').val(data.partyName);
            },
            error: function (error) {
                console.error('Error fetching party details:', error);
            }
        });
    }

    $('#partyForm').submit(function (event) {
        event.preventDefault();
        var partyName = $('#partyName').val();

        var partyData = {
            partyName: partyName
        };

        var requestType = partyId ? 'PUT' : 'POST';
        var url = partyId ? `https://localhost:44309/api/party/${partyId}` : 'https://localhost:44309/api/party/';

        $.ajax({
            url: url,
            type: requestType,
            contentType: 'application/json',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            data: JSON.stringify(partyData),
            success: function (data) {
                location.href = `/index.html`;
            },
            error: function (error) {
                alert("Party already exists")
            }
        });


    });
});

