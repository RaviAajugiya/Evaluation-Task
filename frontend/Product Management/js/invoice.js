// invoice.js

let invoiceData;

const loadData = async (url) => {
    const res = await fetch(url);
    invoiceData = await res.json();
    console.log(invoiceData);
    $('#invoice').DataTable({
        data: invoiceData,
        columns: [
            { data: 'invoiceId', title: 'Invoice ID' },
            { data: 'partyName', title: 'Party Name' },
            { data: 'productName', title: 'Product Name' },
            { data: 'date', title: 'Date' },
            { data: 'quantity', title: 'Quantity' },
            { data: 'rate', title: 'Rate' },
            { data: 'total', title: 'Total' },
            { data: 'date', title: 'Date' },
            // {
            //     title: 'Actions',
            //     render: function (data, type, row) {
            //         return `
            //             <button class="btn btn-warning btn-sm" onclick="editinvoice(${row.invoiceId})">
            //                 <i class="bi bi-pencil-fill"></i> Edit
            //             </button>
            //             <button class="btn btn-danger btn-sm ms-2" onclick="deleteinvoice(${row.invoiceId})">
            //                 <i class="bi bi-trash-fill"></i> Delete
            //             </button>
            //         `;
            //     }
            // }
        ],
        dom: 'Bfrtip',
        buttons: ['pdf']
    });
};

loadData('https://localhost:44309/api/invoice');

$(document).ready(function () {
    // Fetch party data and populate the dropdown
    fetch('https://localhost:44309/api/party')
        .then(response => response.json())
        .then(data => {
            data.forEach(party => {
                $('#partyDropdown').append(`<option value="${party.partyId}">${party.partyName}</option>`);
            });
        })
        .catch(error => console.error('Error fetching party data:', error));

    fetch('https://localhost:44309/api/product')
        .then(response => response.json())
        .then(data => {
            data.forEach(product => {
                $('#productDropdown').append(`<option value="${product.productId}">${product.productName}</option>`);
            });
        })
        .catch(error => console.error('Error fetching product data:', error));

    $('#invoiceForm').submit(function (e) {
        e.preventDefault();

        const formData = {
            partyId: $('#partyDropdown').val(),
            productId: $('#productDropdown').val(),
            rate: parseFloat($('#rate').val()),
            quantity: parseInt($('#quantity').val())
        };

        $.ajax({
            url: 'https://localhost:44309/api/invoice/',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function (data) {
                location.reload();
            },
        });
    });
});
