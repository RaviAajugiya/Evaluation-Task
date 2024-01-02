const token = localStorage.getItem('token');
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};


$(document).ready(function () {
    let formData = {
        products: []
    };

    function updateDataTable() {
        $('#invoiceTable').DataTable().clear().rows.add(formData.products).draw();

        const grandTotal = formData.products.reduce((total, item) => {
            return total + (item.quantity * item.rate);
        }, 0);

        $('#grandTotal').text(grandTotal.toFixed(2));
    }

    $('#invoiceForm').submit(function (e) {
        e.preventDefault();

        $('#partyDropdown').prop('disabled', true);
        formData.partyId = $('#partyDropdown').val();
        formData.products.push({
            productId: $('#productDropdown').val(),
            productName: $('#productDropdown option:selected').text(),
            quantity: parseFloat($('#quantity').val()),
            rate: parseFloat($('#productRate').val()),
            total: parseFloat($('#quantity').val()) * parseFloat($('#productRate').val())
        });


        $('#partyName').text($('#partyDropdown option:selected').text());
        updateDataTable();
    });


    $('#searchButton').click(function (e) {
        e.preventDefault();
    
        const PartyName = $('#party').val();
        const ProductName = $('#product').val();
        const InvoiceNo = $('#invoiceNo').val();
        const StartDate = $('#startDate').val();
        const EndDate = $('#endDate').val();
    
        const queryParams = new URLSearchParams({
            PartyName,
            ProductName,
            InvoiceNo,
            StartDate,
            EndDate
        });
    
        const apiUrl = `https://localhost:44309/api/invoice/GetInvoiceHistory?${queryParams}`;
    
        fetch(apiUrl, {headers:headers})
            .then(response => response.json())
            .then(data => {
                console.log(data);
                $('#invoiceHistory').DataTable().clear().rows.add(data).draw();
            })
            .catch(error => console.error('Error fetching invoice history:', error));
    });
    
    


    $('#invoiceTable').DataTable({
        data: formData.products,
        columns: [
            { data: 'productName', title: 'Product Name' },
            { data: 'quantity', title: 'Quantity' },
            { data: 'rate', title: 'Rate' },
            { data: 'total', title: 'total' },
        ]
    });

    $('#invoiceCancel').click(function () {
        location.href = 'invoice.html'
    });


    $('#GenerateInvoice').click(function () {
        console.log(formData);

        $.ajax({
            url: 'https://localhost:44309/api/Invoice',
            type: 'POST',
            headers: headers,
            data: JSON.stringify(formData),
            success: function (data) {
                location.href = 'invoice.html'
                localStorage.setItem('ToastMessage','Invoice added successfully');
            },
            error: function (error) {
                console.log(error);
            }
        });

    });


    fetch('https://localhost:44309/api/invoice', {headers: headers})
        .then(response => response.json())
        .then(data => {
            console.log('dt', data);
            $('#invoiceHistory').DataTable({
                data: data,
                columns: [
                    { data: 'id', title: 'id' },
                    { data: 'partyId', title: 'partyId' },
                    { data: 'partyName', title: 'partyName' },
                    { data: 'date', title: 'date' },
                    {
                        title: 'Actions',
                        render: function (data, type, row) {
                            return '<button class="btn-sm btn btn-outline-success" data-id="' + row.id + '">View Invoice</button>';
                        }
                    }
                ]
            });
        });


    $('#invoiceHistory').on('click', '.view-btn', function () {
        var invoiceId = $(this).data('id');

        window.location.href = 'viewInvoice.html?id=' + invoiceId;
    });

    $('#addInvoice').click(function(){
        location.href = '/addinvoice.html'
    })


    fetch('https://localhost:44309/api/AssignParty', {headers: headers})
        .then(response => response.json())
        .then(data => {
            const uniqueParties = new Set();
            data.forEach(party => {
                if (!uniqueParties.has(party.partyId)) {
                    uniqueParties.add(party.partyId);
                    $('#partyDropdown').append(`<option value="${party.partyId}">${party.partyName}</option>`);
                }
            });
            loadInvoiceProducts();

        })
        .catch(error => console.error('Error fetching party data:', error));

    function fetchInvoiceProductRate(productId) {
        fetch(`https://localhost:44309/api/invoice/InvoiceProductRate/${productId}`, {headers: headers})
            .then(response => response.json())
            .then(data => {
                $('#productRate').val(data);
            });
    }

    function loadInvoiceProductRate() {
        let productId = $('#productDropdown').val();
        fetchInvoiceProductRate(productId);
    }


    $('#productDropdown').change(function () {
        $('#productRate').empty();
        let productId = $('#productDropdown').val();
        fetchInvoiceProductRate(productId);

    });

    function loadInvoiceProducts() {
        let partyId = $('#partyDropdown').val();
        fetchInvoiceProducts(partyId);
    }

    $('#partyDropdown').change(function () {
        $('#productDropdown').empty();
        let partyId = $('#partyDropdown').val();
        fetchInvoiceProducts(partyId);
    });

    function fetchInvoiceProducts(partyId) {
        fetch(`https://localhost:44309/api/invoice/InvoiceProducts/${partyId}`, {headers: headers})
            .then(response => response.json())
            .then(data => {
                $('#productDropdown').empty();
                data.forEach(product => {
                    $('#productDropdown').append(`<option value="${product.productId}">${product.productName}</option>`);
                });
                loadInvoiceProductRate();
            });
    }

});
