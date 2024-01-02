const token = localStorage.getItem('token');
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};
let invoiceTable;

$(document).ready(function () {
    let DataCount;
    let filter = {
        Order: 'asc',
        PageNo: 1,
        PageSize: 5,
        Column: null,
        StartDate: null,
        EndDate: null,
        InvoiceNo: null,
        ProductId: null,
        PartyId: null
    };

    function convertEmptyStringsToNull(obj) {
        for (const prop in obj) {
            if (obj.hasOwnProperty(prop) && typeof obj[prop] === 'string') {
                obj[prop] = obj[prop].trim() === '' ? null : obj[prop];
            }
        }
    }

    $('#pageSize').change(function () {
        filter.PageSize = $('#pageSize').val();
        filter.PageNo = 1;
        console.log(filter);
        filterAndReloadTable();
    });

    function filterAndReloadTable() {
        convertEmptyStringsToNull(filter);
        invoiceTable.ajax.reload();
    }

    let updatePaginationButtons = function () {
        $('#prevPageBtn').prop('disabled', filter.PageNo <= 1);
        $('#nextPageBtn').prop('disabled', (filter.PageNo * filter.PageSize) >= DataCount);
    };

    invoiceTable = $('#invoiceHistory').DataTable({
        searching: false,
        ordering: false,
        "bPaginate": false,
        ajax: {
            url: 'https://localhost:44309/api/invoice/FilterInvoice',
            type: 'POST',
            headers: headers,
            dataSrc: function (json) {
                DataCount = json.totalCount;
                updatePaginationButtons();
                return json.invoices;
            },
            data: function (data) {
                return JSON.stringify(filter);
            },
            contentType: 'application/json',
            error: function (xhr, error, thrown) {
                console.log('AJAX Error:', xhr, error, thrown);
                console.log(filter);
            }
        },

        columns: [
            { data: 'id', title: 'Id' },
            { data: 'partyName', title: 'Party Name' },
            { data: 'date', title: 'Date' },
            { data: 'total', title: 'Total' },
            {
                title: 'Actions',
                render: function (data, type, row) {
                    return `<button class="view-btn btn btn-outline-success btn-sm" data-id=${row.id}>View</button>`;
                }
            }
        ],
        initComplete: function () {
            $('#prevPageBtn').on('click', function () {
                if (filter.PageNo > 1) {
                    filter.PageNo--;
                    filterAndReloadTable();
                }
            });

            $('#nextPageBtn').on('click', function () {
                if ((filter.PageNo * filter.PageSize) < DataCount) {
                    filter.PageNo++;
                    filterAndReloadTable();
                }
            });

            $('#invoiceHistory thead').on('click', 'th', function () {
                console.log('Header clicked:', $(this).text());
                filter.Column = $(this).text().replace(" ", "");
                filter.Order = filter.Order === 'asc' ? 'desc' : 'asc';
                filterAndReloadTable();
            });
        }
    });

    $('#party, input[type="checkbox"], #invoiceNo, #startDate, #endDate').on('change', function () {
        filter.PartyId = $('#party').val();
        filter.ProductId = $('input[type="checkbox"]:checked')
            .map(function () {
                return $(this).val();
            })
            .get()
            .join(',');
        filter.InvoiceNo = $('#invoiceNo').val();
        filter.StartDate = $('#startDate').val();
        filter.EndDate = $('#endDate').val();

        filterAndReloadTable();
    });

    $('#productDropdown').on('shown.bs.dropdown', function () {
        $('input[type="checkbox"]').on('change', function () {
            filter.ProductId = $('input[type="checkbox"]:checked')
                .map(function () {
                    return $(this).val();
                })
                .get()
                .join(',');
            filterAndReloadTable();
        });
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

