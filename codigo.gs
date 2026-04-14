/**
 * CONFIGURACIÓN INICIAL
 * Ejecuta esta función 'configurarTablas' una sola vez para crear las hojas.
 */
const SS_ID = "10aFMdf6gM29qSVgGm9DVFMfCJ70DryBS9x_OfmL6pmY";

function configurarTablas() {
  const ss = SpreadsheetApp.openById(SS_ID);
  
  // Hoja de Productos
  let sheetProd = ss.getSheetByName("Productos") || ss.insertSheet("Productos");
  sheetProd.clear();
  sheetProd.getRange(1, 1, 1, 8).setValues([["id", "nombre", "precio","precio_costo","precio_atacado","categoria","imagen_url", "stock"]])
           .setBackground("#FFCC00").setFontWeight("bold");
  
  // Datos de ejemplo
  sheetProd.appendRow(["J001", "Oso de Peluche Cariñosito", 120000, "https://images.unsplash.com/photo-1559440666-37483321d410?w=400", 10]);
  sheetProd.appendRow(["J002", "Bloques de Construcción", 85000, "https://images.unsplash.com/photo-1585366119957-e556f4002a06?w=400", 15]);
  sheetProd.appendRow(["J003", "Auto a Control Remoto", 250000, "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400", 5]);

  // Hoja de Ventas
  let sheetVentas = ss.getSheetByName("Ventas") || ss.insertSheet("Ventas");
  sheetVentas.getRange(1, 1, 1, 5).setValues([["Fecha", "Cliente", "Email", "Total", "Detalle"]])
             .setBackground("#FF66B2").setFontWeight("bold").setFontColor("white");
}

function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle("Distribuidora Sanabria Hnos. | Juguetería")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getProductos() {
  const sheet = SpreadsheetApp.openById(SS_ID).getSheetByName("Productos");
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  return data.map(row => {
    let obj = {};
    headers.forEach((header, i) => obj[header] = row[i]);
    return obj;
  });
}

function procesarCompra(cliente, carrito) {
  const ss = SpreadsheetApp.openById(SS_ID);
  const sheetVentas = ss.getSheetByName("Ventas");
  const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const detalle = carrito.map(i => `${i.nombre} (x${i.cantidad})`).join(", ");
  
  sheetVentas.appendRow([new Date(), cliente.nombre, cliente.email, total, detalle]);
  
  generarFacturaPDF(cliente, carrito, total);
  return "¡Gracias! Tu pedido ha sido procesado y enviado a tu email.";
}

function generarFacturaPDF(cliente, carrito, total) {
  const logo = "https://i.ibb.co/tV849s7/puzle.jpg";
  const html = `
    <div style="font-family: Arial; border: 5px solid #00BFFF; padding: 30px; border-radius: 15px;">
      <div style="text-align: center;">
        <img src="${logo}" width="100">
        <h1 style="color: #FF66B2; margin: 0;">Distribuidora Sanabria Hnos.</h1>
        <p>Av. San Juan, Ciudad del Este | Tel: 099430046</p>
      </div>
      <hr style="border: 1px solid #FFCC00;">
      <h3>Comprobante de Compra</h3>
      <p><strong>Cliente:</strong> ${cliente.nombre}</p>
      <p><strong>Email:</strong> ${cliente.email}</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background: #00BFFF; color: white;">
          <th style="padding: 10px; border: 1px solid #ddd;">Producto</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Cant.</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Subtotal</th>
        </tr>
        ${carrito.map(item => `
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">${item.nombre}</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.cantidad}</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">Gs. ${item.precio * item.cantidad}</td>
          </tr>`).join('')}
      </table>
      <h2 style="text-align: right; color: #FF8C00;">Total: Gs. ${total}</h2>
      <p style="text-align: center; color: #777; font-size: 12px;">¡Gracias por traer alegría a casa con nuestros juguetes!</p>
    </div>
  `;
  
  const blob = Utilities.newBlob(html, "text/html", "Factura.html");
  const pdf = blob.getAs("application/pdf").setName("Factura_Sanabria_Hnos.pdf");
  
  MailApp.sendEmail({
    to: cliente.email,
    subject: "✨ Tu compra en Distribuidora Sanabria Hnos.",
    htmlBody: `Hola ${cliente.nombre}, adjuntamos tu factura.`,
    attachments: [pdf]
  });
}
