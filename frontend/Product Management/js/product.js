let productData;
const token = localStorage.getItem('token');
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

let DataTable;
const loadData = (url) => {
    DataTable = $('#productTable').DataTable({
        ajax: {
            url: url,
            headers: headers,
            type: 'GET',
            dataSrc: '',
            error: function (error) {
                if (error.status === 401) {
                    location.href = 'login.html'
                }
            }
        },
        order: [[0, 'desc']],
        columns: [
            { data: 'productId', title: 'Product ID' },
            { data: 'productName', title: 'Product Name' },
            {
                title: 'Actions',
                render: function (data, type, row) {
                    return `
                        <button class="btn btn-warning btn-sm" onclick="editProduct(${row.productId})">
                            <i class="bi bi-pencil-fill"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm ms-2" onclick="deleteProduct(${row.productId}, '${row.productName}')">
                            <i class="bi bi-trash-fill"></i> Delete
                        </button>

                    `;
                }
            }
        ]
    });
}



async function editProduct(productId) {
    location.href = `/productAdd.html?productId=${productId}`;
}

function deleteProduct(productId, productName) {
    Swal.fire({
        title: 'Are you sure?',
        html: `You are about to delete <strong>${productName}</strong>. This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`https://localhost:44309/api/product/${productId}`, {
                    method: 'DELETE',
                    headers: headers
                });

                if (response.ok) {
                    DataTable.ajax.reload();
                    showToast('Product deleted successfully');

                } else {
                    console.error('Failed to delete product:', response.statusText);
                }
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    });
}

loadData('https://localhost:44309/api/product');



$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('productId');

    if (productId) {
        $('#editCancel').removeAttr('hidden');
        $('#editCancel').click(function () {
            location.href = 'product.html';
        });

        $('#title').text('Edit Product');
        $.ajax({
            url: `https://localhost:44309/api/product/${productId}`,
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            success: function (data) {
                $('#productName').val(data.productName);
            },
            error: function (error) {
                console.error('Error fetching party details:', error);
            }
        });
    } else {

    }

    $('#productForm').submit(function (event) {
        event.preventDefault();
        var productName = $('#productName').val();

        var productData = {
            productName: productName
        };

        var requestType = productId ? 'PUT' : 'POST';
        var url = productId ? `https://localhost:44309/api/product/${productId}` : 'https://localhost:44309/api/product/';

        $.ajax({
            url: url,
            type: requestType,
            contentType: 'application/json',
            data: JSON.stringify(productData),
            headers: headers,
            success: function (data) {
                if (requestType === 'PUT') {
                    location.href = 'product.html';
                    localStorage.setItem('ToastMessage', 'Product edited successfully');
                } else {
                    location.href = 'product.html';
                    localStorage.setItem('ToastMessage', 'Product added successfully');
                }
            },
            error: function (error) {
                if (error.status === 401) {
                    location.href = 'login.html';
                    return
                }
                showToast('Product already exists', { backgroundColor: 'red' });

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

