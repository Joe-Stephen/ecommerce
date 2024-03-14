"use strict";
// `<!DOCTYPE html>
//         <html lang="en">
//         <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <title>Order Details</title>
//           <style>
//             body {
//               font-family: Arial, sans-serif;
//               line-height: 1.6;
//               margin: 0;
//               padding: 0;
//             }
//             .container {
//               max-width: 600px;
//               margin: 20px auto;
//               padding: 20px;
//               background-color: #f9f9f9;
//               border-radius: 5px;
//               box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//             }
//             h1 {
//               color: #007bff;
//               text-align: center;
//             }
//             .order-details {
//               margin-bottom: 20px;
//             }
//             .products {
//               margin-left: 20px;
//             }
//             .product {
//               margin-bottom: 10px;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             <h1>Your Order Details</h1>
//             <div class="order-details">
//               <p><strong>Your order has been approved by admin.</strong></p>
//               <p><strong>Order id:</strong> ${order.id}</p>
//               <p><strong>Order date:</strong> ${moment(order.orderDate).format("DD-MM-YYYY")}</p>
//               <p><strong>Expected delivery date:</strong> ${moment(order.expectedDeliveryDate).format("DD-MM-YYYY")}</p>
//               <p><strong>Products:</strong></p>
//               <ul class="products">${productInfo}</ul>
//               <p><strong>Total amount:</strong> ₹${order.totalAmount}/-</p>
//             </div>
//           </div>
//         </body>
//         </html>
//         `
