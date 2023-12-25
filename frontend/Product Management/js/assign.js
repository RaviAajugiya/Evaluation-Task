let assignData;
const token = localStorage.getItem('token');
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};


const loadData = async (url) => {
    const res = await fetch(url, {headers: headers});
    assignData = await res.json();
    console.log(assignData);
    $('#assignParty').DataTable({
        data: assignData,
        columns: [
            { data: 'assignId', title: 'assignId' },
            { data: 'partyName', title: 'party Name' },
            { data: 'productName', title: 'product Name' },

            {
                title: 'Actions',
                render: function (data, type, row) {
                    return `
                        <button class="btn btn-warning btn-sm" onclick="editassign(${row.assignId})">
                            <i class="bi bi-pencil-fill"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm ms-2" onclick="deleteassign(${row.assignId})">
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

function deleteassign(assignId) {
    if (confirm('Are you sure you want to delete this party?')) {
        fetch(`https://localhost:44309/api/AssignParty/${assignId}`, {
            method: 'DELETE',
            headers : headers
        })
            .then(response => {
                if (response.ok) {
                    location.reload();
                } else {
                    console.error('Failed to delete party:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Error deleting party:', error);
            });
    }
}



loadData('https://localhost:44309/api/AssignParty');



$(document).ready(function () {

    const populateDropdown = async (url, dropdownId, valueField, textField) => {
        const res = await fetch(url, {headers: headers});
        const data = await res.json();

        const dropdown = $(`#${dropdownId}`);
        dropdown.empty();

        data.forEach(item => {
            dropdown.append(`<option value="${item[valueField]}">${item[textField]}</option>`);
        });
    };

    populateDropdown('https://localhost:44309/api/party', 'partyName', 'partyId', 'partyName');
    populateDropdown('https://localhost:44309/api/product', 'productName', 'productId', 'productName');

    const urlParams = new URLSearchParams(window.location.search);
    const assignId = urlParams.get('assignId');
    if (assignId) {
        console.log(assignId);
        $.ajax({
            url: `https://localhost:44309/api/AssignParty/${assignId}`,
            type: 'GET',
            headers : headers,
            success: function (data) {
                $('#partyName').val(data.partyId).change();
                $('#productName').val(data.productId).change();
            },
            error: function (error) {
                console.error('Error fetching assign details:', error);
            }
        });
    }

    console.log(assignId);

    $('#assignForm').submit(function (event) {
        event.preventDefault(); 
        var partyName = $('#partyName').val();
        var productName = $('#productName').val();

        console.log('d', partyName, productName);
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
            headers : headers,
            data: JSON.stringify(assignData),
            success: function (data) {
                console.log(`assign ${assignId ? 'updated' : 'added'} successfully:`, data);
            },
            error: function (error) {
                console.error(`Error ${assignId ? 'updating' : 'adding'} assign:`, error);
            }
        });

        location.href = `/assignParty.html`; 

    });
});


