const token = localStorage.getItem('token');
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};


$(document).ready(function () {

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

    $('#addInvoice').click(function(){
        location.href = '/addinvoice.html'
    })
    $('#invoiceReset').click(function(){
        location.reload();
    })
});
