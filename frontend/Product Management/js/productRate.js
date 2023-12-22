let productRateData;

const loadData = async (url) => {
    const res = await fetch(url);
    productRateData = await res.json();
    console.log(productRateData);
    $('#productRateTable').DataTable({
        data: productRateData,
        columns: [
            { data: 'rateId', title: 'rateId' },
            { data: 'productId', title: 'productId' },
            { data: 'productName', title: 'productName' },
            { data: 'rate', title: 'rate' },
            { data: 'rateDate', title: 'rateDate' },

            {
                title: 'Actions',
                render: function (data, type, row) {
                    return `
                        <button class="btn btn-warning btn-sm" onclick="editproductRate(${row.rateId})">
                            <i class="bi bi-pencil-fill"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm ms-2" onclick="deleteproductRate(${row.rateId})">
                            <i class="bi bi-trash-fill"></i> Delete
                        </button>
                    `;
                }
            }
        ]
    });
}
loadData('https://localhost:44309/api/ProductRate');


async function editproductRate(productRateId) {
        location.href = `/productRateAdd.html?productRateId=${productRateId}`;
}

function deleteproductRate(productRateId) {
    if (confirm('Are you sure you want to delete this product Rate?')) {
        fetch(`https://localhost:44309/api/ProductRate/${productRateId}`, {
            method: 'DELETE'
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


$(document).ready(function () {

    const populateDropdown = async (url, dropdownId, valueField, textField) => {
        const res = await fetch(url);
        const data = await res.json();

        const dropdown = $(`#${dropdownId}`);
        dropdown.empty();

        data.forEach(item => {
            dropdown.append(`<option value="${item[valueField]}">${item[textField]}</option>`);
        });
    };

    populateDropdown('https://localhost:44309/api/Product', 'productName', 'productId', 'productName');

    const urlParams = new URLSearchParams(window.location.search);
    const productRateId = urlParams.get('productRateId');
    if (productRateId) {
        console.log(productRateId);
        $.ajax({
            url: `https://localhost:44309/api/ProductRate/${productRateId}`,
            type: 'GET',
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

    console.log(productRateId);

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
            data: JSON.stringify(productRateData),
            success: function (data) {
                console.log(`productRate ${productRateId ? 'updated' : 'added'} successfully:`, data);
            },
            error: function (error) {
                console.error(`Error ${productRateId ? 'updating' : 'adding'} productRate:`, error);
            }
        });

        location.href = `/productRate.html`; 

    });
});

