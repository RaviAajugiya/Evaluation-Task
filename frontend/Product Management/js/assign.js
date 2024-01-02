let assignData;
const token = localStorage.getItem('token');
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

let DataTable;
const loadData = (url) => {
    DataTable = $('#assignParty').DataTable({
        ajax: {
            url: url,
            headers: headers,
            dataSrc: '',
            type: 'GET'
        },
        order: [[0, 'desc']],
        columns: [
            { data: 'assignId', title: 'Assign Id' },
            { data: 'partyName', title: 'Party Name' },
            { data: 'productName', title: 'Product Name' },
            {
                title: 'Actions',
                render: function (data, type, row) {
                    return `
                        <button class="btn btn-warning btn-sm" onclick="editassign(${row.assignId})">
                            <i class="bi bi-pencil-fill"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm ms-2" onclick="deleteassign(${row.productId}, '${row.productName}')">
                            <i class="bi bi-trash-fill"></i> Delete
                        </button>
                    `;
                }
            }
        ]
    });
}

async function editassign(assignId) {
    location.href = `/assignPartyAdd.html?assignId=${assignId}`;
}


function deleteassign(assignId, partyName, productName) {
    Swal.fire({
        title: 'Are you sure?',
        html: `You are about to delete <strong>${partyName} - ${productName}</strong>. This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`https://localhost:44309/api/AssignParty/${assignId}`, {
                    method: 'DELETE',
                    headers: headers
                });

                if (response.ok) {
                    DataTable.ajax.reload();
                    showToast('Data deleted successfully');

                } else {
                    console.error('Failed to delete :', response.statusText);
                }
            } catch (error) {
                console.error('Error deleting :', error);
            }
        }
    });
}



loadData('https://localhost:44309/api/AssignParty');



$(document).ready(function () {

    const populateDropdown = async (url, dropdownId, valueField, textField, defaultText) => {
        const res = await fetch(url, { headers: headers });
        const data = await res.json();

        const dropdown = $(`#${dropdownId}`);
        dropdown.empty();
        dropdown.append(`<option value="">${defaultText}</option>`);

        data.forEach(item => {
            dropdown.append(`<option value="${item[valueField]}">${item[textField]}</option>`);
        });
    };

    populateDropdown('https://localhost:44309/api/party', 'partyName', 'partyId', 'partyName', 'Select Party');
    populateDropdown('https://localhost:44309/api/product', 'productName', 'productId', 'productName', 'Select Product');


    const urlParams = new URLSearchParams(window.location.search);
    const assignId = urlParams.get('assignId');

    if (assignId) {
        $('#editCancle').removeAttr('hidden');
        $('#editCancle').click(function () {
            location.href = 'assignParty.html';
        });
        $('#title').text('Edit Assigned Party');

        $.ajax({
            url: `https://localhost:44309/api/AssignParty/${assignId}`,
            type: 'GET',
            headers: headers,
            success: function (data) {
                $('#partyName').val(data.partyId).change();
                $('#productName').val(data.productId).change();
            },
            error: function (error) {
                console.error('Error fetching assign details:', error);
            }
        });
    }


    $('#assignForm').submit(function (event) {
        event.preventDefault();
        var partyName = $('#partyName').val();
        var productName = $('#productName').val();

        var assignData = {
            partyId: partyName,
            productId: productName
        };

        var requestType = assignId ? 'PUT' : 'POST';
        var url = assignId ? `https://localhost:44309/api/AssignParty/${assignId}` : 'https://localhost:44309/api/AssignParty';

        $.ajax({
            url: url,
            type: requestType,
            contentType: 'application/json',
            headers: headers,
            data: JSON.stringify(assignData),
            success: function (data) {
                if (requestType === 'PUT') {
                    location.href = 'assignParty.html';
                    localStorage.setItem('ToastMessage','Assign Party edited successfully');
                } else {
                    location.href = 'assignParty.html';
                    localStorage.setItem('ToastMessage','Party Assigned successfully');
                }
            },
            error: function (error) {
                showToast('Party already Assigned', { backgroundColor: 'red' });
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
