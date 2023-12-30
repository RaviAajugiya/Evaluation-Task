let PartyData;
const token = localStorage.getItem('token');
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};
let DataTable;
const loadData = (url) => {
    DataTable = $('#example').DataTable({
        ajax: {
            url: url,
            headers: headers,
            type: 'GET',
            dataSrc: '',
        },
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
                        <button class="btn btn-danger btn-sm ms-2" onclick="deleteParty(${row.partyId}, '${row.partyName}')">
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

function deleteParty(partyId, partyName) {
    Swal.fire({
        title: 'Are you sure?',
        html: `You are about to delete <strong>${partyName}</strong>. This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`https://localhost:44309/api/party/${partyId}`, {
                    method: 'DELETE',
                    headers: headers
                });

                if (response.ok) {
                    DataTable.ajax.reload();
                    showToast('Party deleted successfully');

                } else {
                    console.error('Failed to delete party:', response.statusText);
                }
            } catch (error) {
                console.error('Error deleting party:', error);
            }
        }
    });
}

loadData('https://localhost:44309/api/party');


$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const partyId = urlParams.get('partyId');

    if (partyId) {
        $('#editCancle').removeAttr('hidden');
        $('#editCancle').click(function () {
            location.href = 'index.html';
        });

        $('#title').text('Edit Party');
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
                if (requestType === 'PUT') {
                    location.href = 'index.html';
                    showToast('Party edited successfully');
                } else {
                    console.log('Add successful');
                    showToast('Party added successfully');
                    $('#partyName').val('');
                }
            },

            error: function (error) {
                showToast('Party already exists', { backgroundColor: 'red' });
            }
        });
    });
});

function showToast(message, options = {}) {
    Toastify({
        text: message,
        duration: options.duration || 3000,
        newWindow: options.newWindow || true,
        close: options.close || true,
        gravity: options.gravity || 'top',
        position: options.position || 'right',
        backgroundColor: options.backgroundColor || 'green',
        stopOnFocus: options.stopOnFocus || true,
        progressBar: options.progressBar || true
    }).showToast();
}
