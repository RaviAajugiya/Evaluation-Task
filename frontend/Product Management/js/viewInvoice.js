
let editData;
let products;
const token = localStorage.getItem('token');
const email = localStorage.getItem('userEmail');

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const invoiceId = urlParams.get('id');


  fetch(`https://localhost:44309/api/invoice/${invoiceId}`,
    {
      method: 'GET',
      headers: headers
    })
    .then(response => response.json())
    .then(data => {
      editData = data;
      $('#invoiceId').text(data.id);
      $('#partyId').text(data.partyId);
      $('#partyName').text(data.partyName);
      $('#invoiceDate').text(data.date);

      let grandTotal = 0;

      data.products.forEach(product => {
        $('#productsBody').append(`
                    <tr>
                        <td>${product.productId}</td>
                        <td>${product.productName}</td>
                        <td>${product.quantity}</td>
                        <td>${product.rate}</td>
                        <td>${product.total}</td>
                    </tr>
                `);

        grandTotal += product.total;
      });

      $('#productsBody').append(`
                <tr>
                    <td colspan="4"><strong>Grand Total:</strong></td>
                    <td>${grandTotal}</td>
                </tr>
            `);



      $('#invoiceTable').DataTable({
        data: editData.products,
        columns: [
          { data: 'productName', title: 'Product Name' },
          { data: 'quantity', title: 'Quantity' },
          { data: 'rate', title: 'Rate' },
          { data: 'total', title: 'Total' },
          {
            title: 'Action',
            render: function (data, type, row) {
              return '<button class="btn btn-warning btn-sm edit-btn">Edit</button> ' +
                '<button class="btn btn-danger btn-sm delete-btn">Delete</button>';
            }
          }
        ]
      });

    })
    .catch(error => {
      console.error('Error:', error);
    });


  $('#invoiceForm').submit(function (e) {
    e.preventDefault();

    $('#partyDropdown').prop('disabled', true);
    editData.partyId = $('#partyDropdown').val();
    editData.products.push({
      productId: $('#productDropdown').val(),
      productName: $('#productDropdown option:selected').text(),
      quantity: parseFloat($('#quantity').val()),
      rate: parseFloat($('#productRate').val()),
      total: parseFloat($('#quantity').val()) * parseFloat($('#productRate').val())
    });

    $('#partyName').text($('#partyDropdown option:selected').text());
    updateDataTable();
  });

  $('#invoiceTable').on('click', '.edit-btn', function () {
    var table = $('#invoiceTable').DataTable();
    var tr = $(this).closest('tr');
    var row = table.row(tr);
    var rowData = row.data();
    var productId = rowData.productId;
    var dropdownOptions = products.map(function (product) {
      var selected = (product.productId === productId) ? 'selected' : '';
      return '<option value="' + product.productId + '" ' + selected + '>' + product.productName + '</option>';
    }).join('');

    tr.find('td').each(function (i) {
      var cell = $(this);
      var cellData = rowData[table.column(i).dataSrc()];

      if (i === 0) {
        var dropdown = $('<select class="form-select">' + dropdownOptions + '</select>');
        cell.html(dropdown);
      } else if (i === 1 || i === 2) {
        cell.html('<input type="number" class="form-control" id="input-' + i + '" value="' + cellData + '">');
      }
    });

    var selectDropdown = tr.find('select');

    selectDropdown.on('change', function () {
      var selectedProductId = $(this).val();
      console.log('Selected Product ID:', selectedProductId);

      var selectedProduct = products.find(product => product.productId.toString() === selectedProductId.toString());
      console.log('Selected Product:', selectedProduct);

      $.ajax({
        url: `https://localhost:44309/api/invoice/InvoiceProductRate/${selectedProduct.productId}`,
        method: 'GET',
        headers: headers,
        success: function (rate) {
          $('#input-2').val(rate);
        }
      });
    });


    tr.find('.edit-btn').hide();
    tr.find('.delete-btn').hide();

    tr.find('td:last').html('<button class="btn btn-success btn-sm save-btn">Save</button> ' +
      '<button class="btn btn-secondary btn-sm cancel-btn ml-2">Cancel</button>');

    tr.find('.cancel-btn').on('click', function () {
      $('#invoiceTable').DataTable().clear().rows.add(editData.products).draw();
      console.log('Canceled');
    });

    tr.find('.save-btn').on('click', function () {
      var editedRow = {};
      tr.find('td').each(function (i) {
        var cellData;
        if (i === 0) {
          // Capture both the value and the displayed text from the select element
          var selectElement = tr.find('select');
          cellData = {
            value: selectElement.val(),
            name: selectElement.find('option:selected').text()
          };
        } else {
          cellData = $('#input-' + i).val();
        }
        editedRow[table.column(i).dataSrc()] = cellData;
      });
      console.log('Updated Row Data:', editedRow);

      console.log(editData.products.find(obj => obj.id === rowData.id));
      var indexToUpdate = editData.products.findIndex(obj => obj.id === rowData.id);

      // Update the object with the new data
      editData.products[indexToUpdate] = {
        id: rowData.id,
        productId: editedRow.productName.value,
        productName: editedRow.productName.name,
        quantity: editedRow.quantity,
        rate: editedRow.rate,
        total: editedRow.quantity * editedRow.rate
      };

      $('#invoiceTable').DataTable().clear().rows.add(editData.products).draw();
      console.log('Object updated:', editData);
      updateDataTable();

    });

  });

  $('#invoiceTable').on('click', '.delete-btn', function () {
    var row = $('#invoiceTable').DataTable().row($(this).parents('tr'));
    var index = row.index();
    row.remove().draw();
    editData.products.splice(index, 1);
    updateDataTable();

  });

  $('#closeEdit').click(function (e) {
    location.reload();

  });

  $('#GenerateInvoice').click(function () {
    console.log(editData);
    const { date, ...newData } = editData;
    console.log(newData);

    $.ajax({
      url: `https://localhost:44309/api/Invoice/${editData.id}`,
      type: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      success: function () {
        $.ajax({
          url: 'https://localhost:44309/api/Invoice',
          type: 'POST',
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          },
          contentType: 'application/json',

          data: JSON.stringify(newData),
          success: function (data) {
            window.location.href = `viewInvoice.html?id=${data}`;
            localStorage.setItem('ToastMessage','Invoice edited successfully');

          },
          error: function (error) {
            console.log(error);
          }
        });
      },
      error: function (error) {
        console.log(error);
      }
    });
  });

  $("#CloseInvoice").click(function (){
    window.location.href = `invoice.html`;
  })

  $("#SendEmail").click(function () {
    $.ajax({
      type: "POST",
      url: `https://localhost:44309/api/print/SendMail`,
      headers: headers,
      data: JSON.stringify({
        id: invoiceId,
        email: email
      }),
      success: function (data) {
        localStorage.setItem('ToastMessage','Email sent successfully to ${email}');
      },
      error: function (error) {
        console.error("Error sending email:", error);
      }
    });
  });
});

$("#PrintInvoice").click(function (e) {
  e.preventDefault();
  generatePDF();
});

function generatePDF() {
  var element = document.querySelector('.invoice-container');
  var opt = {
    margin: 0.5,
    filename: 'invoice.pdf',
    html2canvas: { scale: 1 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait', precision: '12' }
  };
  html2pdf().set(opt).from(element).save();
}


$("#EditInvoice").click(function (e) {
  e.preventDefault();
  if (editData && editData.products) {
    editData.products.forEach((product, index) => {
      product.id = index + 1;
    });
  }
  updateDataTable();
  editInvoice();
});


function editInvoice() {
  $('#editModel').show();
  $('#overlay').show();

  fetch('https://localhost:44309/api/AssignParty',
    {
      method: 'GET',
      headers: headers
    })
    .then(response => response.json())
    .then(data => {
      const uniqueParties = new Set();
      data.forEach(party => {
        if (!uniqueParties.has(party.partyId)) {
          uniqueParties.add(party.partyId);
          $('#partyDropdown').append(`<option value="${party.partyId}">${party.partyName}</option>`);
        }
      });
      $('#partyDropdown').val(editData.partyId);
      $('#partyDropdown').attr('disabled', true);
      loadInvoiceProducts();

    })
    .catch(error => console.error('Error fetching party data:', error));

  function fetchInvoiceProductRate(productId) {
    fetch(`https://localhost:44309/api/invoice/InvoiceProductRate/${productId}`,
      {
        method: 'GET',
        headers: headers
      })
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
    console.log('load invoice', partyId);
    fetchInvoiceProducts(partyId);
  }

  $('#partyDropdown').change(function () {
    $('#productDropdown').empty();
    let partyId = $('#partyDropdown').val();
    fetchInvoiceProducts(partyId);
  });

  function fetchInvoiceProducts(partyId) {
    fetch(`https://localhost:44309/api/invoice/InvoiceProducts/${partyId}`,
      {
        method: 'GET',
        headers: headers
      })
      .then(response => response.json())
      .then(data => {
        products = data;
        $('#productDropdown').empty();
        data.forEach(product => {
          $('#productDropdown').append(`<option value="${product.productId}">${product.productName}</option>`);
        });
        loadInvoiceProductRate();
      });
  }

  $('#partyDropdown').val(editData.partyId);
  $('#partyDropdown').attr('disabled', true);
}

function updateDataTable() {
  $('#invoiceTable').DataTable().clear().rows.add(editData.products).draw();

  const grandTotal = editData.products.reduce((total, item) => {
    return total + (item.quantity * item.rate);
  }, 0);

  $('#grandTotal').text(grandTotal.toFixed(2));
}