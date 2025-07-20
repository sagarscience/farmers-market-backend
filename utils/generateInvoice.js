import PDFDocument from "pdfkit";

/**
 * Generates and streams an invoice PDF for the given order.
 * @param {*} res - Express response object
 * @param {*} order - Order object (with buyer and products populated)
 */
export const generateInvoice = (res, order) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  // Set response headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename=invoice-${order._id}.pdf`);
  doc.pipe(res);

  // Title
  doc.font("Helvetica-Bold").fontSize(20).text("Invoice", { align: "center" });
  doc.moveDown(1.5);

  // Buyer Details
  doc.font("Helvetica").fontSize(12);
  doc.text(`Buyer: ${order.buyer.name}`);
  doc.text(`Email: ${order.buyer.email}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
  doc.text(`Order ID: ${order._id}`);
  doc.moveDown(1.5);

  // Table Headers
  const tableTop = doc.y;
  const itemX = 50, priceX = 250, qtyX = 300, totalX = 360;

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("Product", itemX, tableTop)
    .text("Price", priceX, tableTop)
    .text("Qty", qtyX, tableTop)
    .text("Total", totalX, tableTop);

  doc.moveTo(itemX, doc.y + 5).lineTo(550, doc.y + 5).stroke();
  doc.moveDown(1);

  // Product Rows
  doc.font("Helvetica").fontSize(11);

  order.products.forEach((item) => {
    const y = doc.y;
    doc
      .text(item.name, itemX, y, { width: 200 }) // wrap long product names
      .text("₹" + item.price.toString(), priceX, y)
      .text(item.quantity.toString(), qtyX, y)
      .text("₹" + (item.price * item.quantity).toString(), totalX, y);
    doc.moveDown(0.7);
  });

  // Total Amount
  doc.moveDown(1.5);
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .text("Grand Total: ₹" + order.totalAmount.toString(), {
      align: "right",
    });

  doc.end();
};
