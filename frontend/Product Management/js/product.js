let productData;

const loadData = async (url) => {
    const res = await fetch(url);
    productData = await res.json();
    $('#productTable').DataTable({
        data: productData,
        columns: [
            { data: 'productId', title: 'product ID' },
            { data: 'productName', title: 'product Name' },
            {
                title: 'Actions',
                render: function (data, type, row) {
                    return `
                        <button class="btn btn-warning btn-sm" onclick="editproduct(${row.productId})">
                            <i class="bi bi-pencil-fill"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm ms-2" onclick="deleteproduct(${row.productId})">
                            <i class="bi bi-trash-fill"></i> Delete
                        </button>
                    `;
                }
            }
        ]
    });
}


async function editproduct(productId) {
        location.href = `/productAdd.html?productId=${productId}`;
}

function deleteproduct(productId) {
    // Call the API to delete the product
    if (confirm('Are you sure you want to delete this product?')) {
        fetch(`https://localhost:44309/api/product/${productId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    // Remove the deleted product from the DataTable
                    const index = productData.findIndex(product => product.productId === productId);
                    if (index !== -1) {
                        productData.splice(index, 1);
                        $('#productTable').DataTable().clear().rows.add(productData).draw();
                    }
                } else {
                    console.error('Failed to delete product:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Error deleting product:', error);
            });
    }
}

loadData('https://localhost:44309/api/product');



// product add
$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('productId');
    
    if (productId) {
        $.ajax({
            url: `https://localhost:44309/api/product/${productId}`,
            type: 'GET',
            success: function (data) {
                $('#productName').val(data.productName);
            },
            error: function (error) {
                console.error('Error fetching product details:', error);
            }
        });
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
            success: function (data) {
                console.log(`product ${productId ? 'updated' : 'added'} successfully:`, data);
            },
            error: function (error) {
                console.error(`Error ${productId ? 'updating' : 'adding'} product:`, error);
            }
        });

        location.href = `/product.html`;

    });
});

