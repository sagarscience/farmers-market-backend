import PDFDocument from "pdfkit";

export const generateInvoice = (res, order) => {
  const doc = new PDFDocument({ margin: 50 });

  // Set response headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=invoice_${order._id}.pdf`);

  // Pipe PDF to response
  doc.pipe(res);

  // ======= INVOICE HEADER =======
  doc
    .fontSize(20)
    .text("🧾 Farmers Online Trading & Selling System", { align: "center" })
    .moveDown();

  doc
    .fontSize(14)
    .text(`Invoice ID: ${order._id}`)
    .text(`Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`)
    .moveDown();

  // ======= BUYER DETAILS =======
  doc
    .fontSize(12)
    .text(`Buyer Name: ${order.buyer?.name || "N/A"}`)
    .text(`Buyer Email: ${order.buyer?.email || "N/A"}`)
    .moveDown();

  // ======= ORDER ITEMS =======
  doc
    .fontSize(14)
    .text("Order Summary", { underline: true })
    .moveDown(0.5);

  const tableTop = doc.y;
  const itemSpacing = 25;

  // Table Headers
  doc
    .font("Helvetica-Bold")
    .text("Product", 50, tableTop)
    .text("Price", 250, tableTop)
    .text("Qty", 320, tableTop)
    .text("Total", 380, tableTop);

  doc.moveDown();

  // Table Rows
  doc.font("Helvetica");
  order.products.forEach((item, i) => {
    const y = tableTop + itemSpacing * (i + 1);
    doc
      .text(item.name, 50, y)
      .text(`₹${item.price}`, 250, y)
      .text(`${item.quantity}`, 320, y)
      .text(`₹${item.price * item.quantity}`, 380, y);
  });

  // ======= TOTAL =======
  doc
    .moveDown(2)
    .fontSize(13)
    .font("Helvetica-Bold")
    .text(`Total Amount: ₹${order.totalAmount}`, { align: "right" });

  // ======= FOOTER =======
  doc
    .moveDown()
    .fontSize(10)
    .font("Helvetica-Oblique")
    .text("Thank you for supporting local farmers!", { align: "center" });

  // Finalize
  doc.end();
};
