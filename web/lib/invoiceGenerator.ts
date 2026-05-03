"use client";

export interface InvoiceData {
  orderId: string;
  date: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    total: number;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: string;
}

export const generateInvoicePDF = async (data: InvoiceData) => {
  if (typeof window === "undefined") return;

  try {
    // Dynamically import jsPDF and its plugins
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(213, 34, 69); // #d52245
    doc.text("ENTRY E-COMMERCE", 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("INVOICE", pageWidth - 40, 20);
    doc.text(`#${data.orderId.slice(-8).toUpperCase()}`, pageWidth - 40, 25);
    
    // Company Info
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text("123 Business Street", 20, 35);
    doc.text("City, State, 12345", 20, 40);
    doc.text("support@entry-ecommerce.com", 20, 45);
    
    // Customer Info
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 20, 60);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(data.customerName, 20, 67);
    doc.text(data.customerEmail, 20, 72);
    doc.text(data.shippingAddress.street, 20, 77);
    doc.text(`${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}`, 20, 82);
    doc.text(data.shippingAddress.country, 20, 87);
    
    // Order Details Info
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Order Details:", pageWidth - 80, 60);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Order Date: ${data.date}`, pageWidth - 80, 67);
    doc.text(`Payment: ${data.paymentMethod.toUpperCase()}`, pageWidth - 80, 72);
    doc.text(`Status: ${data.status.toUpperCase()}`, pageWidth - 80, 77);
    
    // Items Table
    const tableColumn = ["Item", "Price", "Qty", "Total"];
    const tableRows = data.items.map(item => [
      item.name,
      `$${item.price.toFixed(2)}`,
      item.quantity.toString(),
      `$${item.total.toFixed(2)}`
    ]);
    
    autoTable(doc, {
      startY: 100,
      head: [tableColumn],
      body: tableRows,
      headStyles: { fillColor: [213, 34, 69] }, // #d52245
      theme: "striped",
    });
    
    // Summary
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(10);
    doc.text("Subtotal:", pageWidth - 80, finalY);
    doc.text(`$${data.subtotal.toFixed(2)}`, pageWidth - 30, finalY, { align: "right" });
    
    doc.text("Shipping:", pageWidth - 80, finalY + 7);
    doc.text(`$${data.shipping.toFixed(2)}`, pageWidth - 30, finalY + 7, { align: "right" });
    
    doc.text("Tax:", pageWidth - 80, finalY + 14);
    doc.text(`$${data.tax.toFixed(2)}`, pageWidth - 30, finalY + 14, { align: "right" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Total:", pageWidth - 80, finalY + 24);
    doc.text(`$${data.total.toFixed(2)}`, pageWidth - 30, finalY + 24, { align: "right" });
    
    // Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150);
    doc.text("Thank you for your business!", pageWidth / 2, pageWidth > 200 ? 280 : 260, { align: "center" });
    
    // Save PDF
    doc.save(`Invoice_${data.orderId.slice(-8).toUpperCase()}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
