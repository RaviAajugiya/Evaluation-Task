const token = localStorage.getItem('token');
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};


$(document).ready(function () {

    $('#searchButton').click(function (e) {
        e.preventDefault();
        const partyId = $('#party').val();
        const productId = $('input[type="checkbox"]:checked')
        .map(function () {
            return $(this).val();
        })
        .get()
        .join(',');
        const InvoiceNo = $('#invoiceNo').val();
        const StartDate = $('#startDate').val();
        const EndDate = $('#endDate').val();

        const queryParams = new URLSearchParams({
            partyId,
            productId,
            InvoiceNo,
            StartDate,
            EndDate
        });

        console.log(partyId,
            productId,
            InvoiceNo,
            StartDate,
            EndDate);

        const apiUrl = `https://localhost:44309/api/invoice/FilterInvoice?${queryParams}`;

        $.ajax({
            url: apiUrl,
            headers: headers,
            method: 'GET',
            success: function (data) {
                console.log(data);
                $('#invoiceHistory').DataTable().clear().rows.add(data).draw();
            },
            error: function (error) {
                console.error('Error fetching invoice history:', error);
            }
        });
    });

    $('#invoiceHistory').DataTable({
        searching: false,
        ajax: {
            url: 'https://localhost:44309/api/invoice',
            type: 'GET',
            headers: headers,
            dataSrc: ''
        },
        columns: [
            { data: 'id', title: 'id' },
            { data: 'partyId', title: 'partyId' },
            { data: 'partyName', title: 'partyName' },
            { data: 'date', title: 'date' },
            { data: 'total', title: 'total' },
            {
                title: 'Actions',
                render: function (data, type, row) {
                    return '<button class="view-btn btn btn-outline-success btn-sm" data-id="' + row.id + '">View Invoice</button>';
                }
            }
        ]
    });


    $('#invoiceHistory').on('click', '.view-btn', function () {
        var invoiceId = $(this).data('id');
        window.location.href = 'viewInvoice.html?id=' + invoiceId;
    });

    $('#addInvoice').click(function () {
        location.href = '/addinvoice.html'
    })
    $('#invoiceReset').click(function () {
        location.reload();
    })


    $.ajax({
        url: 'https://localhost:44309/api/party',
        method: 'GET',
        headers: headers,
        success: function (data) {
            var partyDropdown = $('#party');
            partyDropdown.empty();
            partyDropdown.append('<option value="" selected>Select Party</option>');

            data.forEach(function (party) {
                partyDropdown.append(`<option value="${party.partyId}">${party.partyName}</option>`);
            });
        },
        error: function (error) {
            console.error('Error fetching party data:', error);
        }
    });

    $.ajax({
        url: 'https://localhost:44309/api/product',
        method: 'GET',
        headers: headers,
        success: function (data) {
            var productDropdown = $('#productOptions ul');

            productDropdown.empty();

            data.forEach(function (product) {
                productDropdown.append(`
                    <li>
                        <input type="checkbox" id="productCheck${product.productId}" value="${product.productId}">
                        <label for="productCheck${product.productId}">${product.productName}</label>
                    </li>
                `);
            });

            productDropdown.on('change', 'input[type="checkbox"]', function () {
                var selectedProducts = $('input[type="checkbox"]:checked')
                    .map(function () {
                        return $(this).next('label').text();
                    })
                    .get()
                    .join(', ');

                $('#productDropdown').text(selectedProducts || 'Select Products');
            });
        },
        error: function (error) {
            console.error('Error fetching product data:', error);
        }
    });
});


