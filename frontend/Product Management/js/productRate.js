let productRateData;
const token = localStorage.getItem('token');
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

let DataTable;
const loadData = (url) => {
    DataTable = $('#productRateTable').DataTable({
        ajax: {
            url: url,
            headers: headers,
            type: 'GET',
            dataSrc: '',
        },
        order: [[0, 'desc']],
        columns: [
            { data: 'rateId', title: 'Rate Id' },
            { data: 'productName', title: 'Product Name' },
            { data: 'rate', title: 'Rate' },
            { data: 'rateDate', title: 'Date' },
            {
                title: 'Actions',
                render: function (data, type, row) {
                    return `
                        <button class="btn btn-warning btn-sm" onclick="editproductRate(${row.rateId})">
                            <i class="bi bi-pencil-fill"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm ms-2" onclick="deleteproductRate('${row.productName}', ${row.rate}, ${row.rateId})">
                            <i class="bi bi-trash-fill"></i> Delete
                        </button>
                    `;
                }
            }
        ]
    });
};

loadData('https://localhost:44309/api/ProductRate');


async function editproductRate(productRateId) {
    location.href = `/productRateAdd.html?productRateId=${productRateId}`;
}

function deleteproductRate(name, rate, rateId) {
    console.log(name,rate);

    Swal.fire({
        title: 'Are you sure?',
        html: `You are about to delete rate <strong>${name} - ${rate}</strong>. This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const response = await fetch(`https://localhost:44309/api/ProductRate/${rateId}`, {
                method: 'DELETE',
                headers: headers
            });

            if (response.ok) {
                DataTable.ajax.reload();
                showToast('Product Rate deleted successfully');

            } else {
                console.error('Failed to delete :', response.statusText);
            }
        }
    });
}


$(document).ready(function () {

    const populateDropdown = async (url, dropdownId, valueField, textField) => {
        const res = await fetch(url, { headers: headers });
        const data = await res.json();

        const dropdown = $(`#${dropdownId}`);
        dropdown.empty();
        dropdown.append(`<option value="">Select Product</option>`);

        data.forEach(item => {
            dropdown.append(`<option value="${item[valueField]}">${item[textField]}</option>`);
        });
    };

    populateDropdown('https://localhost:44309/api/Product', 'productName', 'productId', 'productName');

    const urlParams = new URLSearchParams(window.location.search);
    const productRateId = urlParams.get('productRateId');
    if (productRateId) {
        $('#editCancel').removeAttr('hidden');
        $('#editCancel').click(function () {
            location.href = 'productRate.html';
        });

        $('#title').text('Edit Product Rate');

        $.ajax({
            url: `https://localhost:44309/api/ProductRate/${productRateId}`,
            type: 'GET',
            headers: headers,
            success: function (data) {
                console.log('rate data', data);
                $('#productName').val(data.productId).change();
                $('#productRate').val(data.rate);
                $('#RateDate').val(data.rateDate);
            },
            error: function (error) {
                console.error('Error fetching productRate details:', error);
            }
        });
    }

    $('#productRateForm').submit(function (event) {
        event.preventDefault();
        var productName = $('#productName').val();
        var rate = $('#productRate').val();
        var rateDate = $('#RateDate').val();

        var productRateData = {
            productId: productName,
            rate: rate,
            rateDate: rateDate,
        };

        var requestType = productRateId ? 'PUT' : 'POST';
        var url = productRateId ? `https://localhost:44309/api/ProductRate/${productRateId}` : 'https://localhost:44309/api/ProductRate';

        $.ajax({
            url: url,
            type: requestType,
            contentType: 'application/json',
            headers: headers,
            data: JSON.stringify(productRateData),
            success: function (data) {
                if (requestType === 'PUT') {
                    location.href = 'productRate.html';
                    localStorage.setItem('ToastMessage','Product Rate edited successfully');
                } else {
                    location.href = 'productRate.html';
                    localStorage.setItem('ToastMessage','Rate added successfully');
                }
            },
            error: function (error) {
                showToast('Rate already exists', { backgroundColor: 'red' });
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


