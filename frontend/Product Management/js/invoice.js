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
        const PageNumber = $('#pageNo').val();
        const PageSize = $('#pageSize').val();
        const sortbycolname = $('#sortBy').val();
    
        const queryParams = new URLSearchParams({
            PartyName,
            ProductName,
            InvoiceNo,
            StartDate,
            EndDate,
            PageSize,
            PageNumber,
            sortbycolname
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
                    { data: 'total', title: 'total' },
                    {
                        title: 'Actions',
                        render: function (data, type, row) {
                            return '<button class="view-btn btn btn-outline-success btn-sm" data-id="' + row.id + '">View Invoice</button>';
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
    $('#invoiceReset').click(function(){
        location.reload();
    })
});
