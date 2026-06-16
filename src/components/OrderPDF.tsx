'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Sale, Expense, Purchase, Debtor, Creditor, Product } from '@/lib/mockData';

// Brand colors for PDF styling
const primaryColor = '#2c4a21'; // Olive green
const secondaryColor = '#d97706'; // Amber gold
const darkText = '#1c1917';
const mutedText = '#78716c';
const bgLight = '#fdfbf7';
const borderCol = '#e7e5e4';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    color: darkText,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff'
  },
  header: {
    borderBottomWidth: 1.5,
    borderBottomColor: primaryColor,
    paddingBottom: 12,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  brandName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: primaryColor,
  },
  brandSub: {
    fontSize: 9,
    color: mutedText,
    marginTop: 2,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: secondaryColor,
    textAlign: 'right'
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  metaCol: {
    width: '48%',
  },
  metaLabel: {
    fontSize: 8,
    color: mutedText,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 10,
    marginBottom: 2,
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: borderCol,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 25,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: borderCol,
    minHeight: 24,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: primaryColor,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  th: {
    fontSize: 8,
    fontWeight: 'bold',
    padding: 6,
  },
  td: {
    fontSize: 9,
    padding: 6,
  },
  colDesc: { width: '40%' },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '20%', textAlign: 'right' },
  colTotal: { width: '25%', textAlign: 'right' },
  
  colRepName: { width: '30%' },
  colRepValue: { width: '70%' },

  summaryBlock: {
    width: '40%',
    alignSelf: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: borderCol,
    paddingTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    color: mutedText,
    fontSize: 9,
  },
  summaryVal: {
    fontSize: 9,
    textAlign: 'right',
  },
  totalPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: primaryColor,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: borderCol,
    paddingTop: 10,
    textAlign: 'center',
    color: mutedText,
    fontSize: 7,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: primaryColor,
    marginTop: 15,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: borderCol,
    paddingBottom: 4,
  }
});

// ==========================================
// INVOICE PDF DOCUMENT
// ==========================================
interface InvoicePDFProps {
  sale: Sale;
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ sale }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandName}>Great Pickle Taste (GPT)</Text>
          <Text style={styles.brandSub}>Authentic Handmade Pickles | Kathmandu, Nepal</Text>
        </View>
        <View>
          <Text style={styles.docTitle}>TAX INVOICE</Text>
          <Text style={styles.brandSub}>Invoice No: {sale.invoiceNumber}</Text>
        </View>
      </View>

      {/* Meta details */}
      <View style={styles.metaContainer}>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Billed To:</Text>
          <Text style={styles.metaValue}>{sale.customerName}</Text>
          <Text style={styles.metaValue}>Phone: {sale.customerPhone}</Text>
        </View>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Invoice Date:</Text>
          <Text style={styles.metaValue}>{new Date(sale.saleDate).toLocaleDateString()}</Text>
          <Text style={styles.metaLabel}>Payment Status:</Text>
          <Text style={[styles.metaValue, { fontWeight: 'bold', color: sale.paymentStatus === 'Paid' ? 'green' : 'orange' }]}>
            {sale.paymentStatus.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.th, styles.colDesc, { color: '#ffffff' }]}>Pickle Description</Text>
          <Text style={[styles.th, styles.colQty, { color: '#ffffff' }]}>Qty</Text>
          <Text style={[styles.th, styles.colPrice, { color: '#ffffff' }]}>Unit Price (NPR)</Text>
          <Text style={[styles.th, styles.colTotal, { color: '#ffffff' }]}>Amount (NPR)</Text>
        </View>
        {sale.items.map((item, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={[styles.td, styles.colDesc]}>{item.name}</Text>
            <Text style={[styles.td, styles.colQty]}>{item.quantity}</Text>
            <Text style={[styles.td, styles.colPrice]}>Rs. {item.price}</Text>
            <Text style={[styles.td, styles.colTotal]}>Rs. {item.total}</Text>
          </View>
        ))}
      </View>

      {/* Summary Block */}
      <View style={styles.summaryBlock}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryVal}>Rs. {sale.subtotal}</Text>
        </View>
        {sale.discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount</Text>
            <Text style={styles.summaryVal}>- Rs. {sale.discount}</Text>
          </View>
        )}
        <View style={[styles.summaryRow, { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: borderCol }]}>
          <Text style={[styles.summaryLabel, { fontWeight: 'bold' }]}>Grand Total</Text>
          <Text style={[styles.summaryVal, styles.totalPrice]}>Rs. {sale.total}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Amount Paid</Text>
          <Text style={styles.summaryVal}>Rs. {sale.amountPaid}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Balance Due</Text>
          <Text style={[styles.summaryVal, { color: sale.balanceDue > 0 ? 'red' : 'green' }]}>Rs. {sale.balanceDue}</Text>
        </View>
      </View>

      {/* Signatures / Terms */}
      <View style={{ marginTop: 60, flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ width: '40%', borderTopWidth: 1, borderTopColor: mutedText, paddingTop: 4, textAlign: 'center' }}>
          <Text style={{ fontSize: 8, color: mutedText }}>Customer Signature</Text>
        </View>
        <View style={{ width: '40%', borderTopWidth: 1, borderTopColor: mutedText, paddingTop: 4, textAlign: 'center' }}>
          <Text style={{ fontSize: 8, color: mutedText }}>Authorized Representative</Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Thank you for choosing Great Pickle Taste! For order queries, email hello@greatpickletaste.com.np
      </Text>
    </Page>
  </Document>
);

// ==========================================
// BUSINESS SNAPSHOT REPORT PDF DOCUMENT
// ==========================================
interface ReportPDFProps {
  sales: Sale[];
  purchases: Purchase[];
  expenses: Expense[];
  debtors: Debtor[];
  creditors: Creditor[];
  products: Product[];
}

export const ReportPDF: React.FC<ReportPDFProps> = ({
  sales,
  purchases,
  expenses,
  debtors,
  creditors,
  products
}) => {
  const totalSalesVal = sales.reduce((acc, curr) => acc + curr.total, 0);
  const totalPaidSalesVal = sales.reduce((acc, curr) => acc + curr.amountPaid, 0);
  const totalPurchasesVal = purchases.reduce((acc, curr) => acc + curr.total, 0);
  const totalPaidPurchasesVal = purchases.reduce((acc, curr) => acc + curr.amountPaid, 0);
  const totalExpensesVal = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalDebt = debtors.reduce((acc, curr) => acc + curr.totalDebt, 0);
  const totalCredit = creditors.reduce((acc, curr) => acc + curr.totalCredit, 0);

  const netProfit = totalSalesVal - totalPurchasesVal - totalExpensesVal;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>Great Pickle Taste (GPT)</Text>
            <Text style={styles.brandSub}>Executive Financial Report Summary</Text>
          </View>
          <View>
            <Text style={styles.docTitle}>BUSINESS REPORT</Text>
            <Text style={styles.brandSub}>Generated on: {new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Executive summary table */}
        <Text style={styles.sectionTitle}>Executive Financial Dashboard</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.td, styles.colRepName, { fontWeight: 'bold' }]}>Gross Sales Revenue</Text>
            <Text style={[styles.td, styles.colRepValue]}>Rs. {totalSalesVal} (Collected: Rs. {totalPaidSalesVal}, Receivables/Debt: Rs. {totalSalesVal - totalPaidSalesVal})</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.td, styles.colRepName, { fontWeight: 'bold' }]}>Total Vendor Purchases</Text>
            <Text style={[styles.td, styles.colRepValue]}>Rs. {totalPurchasesVal} (Paid: Rs. {totalPaidPurchasesVal}, Owed/Credit: Rs. {totalPurchasesVal - totalPaidPurchasesVal})</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.td, styles.colRepName, { fontWeight: 'bold' }]}>Business Operational Expenses</Text>
            <Text style={[styles.td, styles.colRepValue]}>Rs. {totalExpensesVal}</Text>
          </View>
          <View style={[styles.tableRow, { backgroundColor: '#f5f5f4' }]}>
            <Text style={[styles.td, styles.colRepName, { fontWeight: 'bold', color: primaryColor }]}>Estimated Net Profit</Text>
            <Text style={[styles.td, styles.colRepValue, { fontWeight: 'bold', color: netProfit >= 0 ? 'green' : 'red' }]}>
              Rs. {netProfit}
            </Text>
          </View>
        </View>

        {/* Receivables & Owed Liabilities */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
          <View style={{ width: '48%' }}>
            <Text style={styles.sectionTitle}>Outstanding Receivables (Debtors)</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.th, { width: '60%', color: '#ffffff' }]}>Customer Name</Text>
                <Text style={[styles.th, { width: '40%', textAlign: 'right', color: '#ffffff' }]}>Debt (NPR)</Text>
              </View>
              {debtors.filter(d => d.totalDebt > 0).map((d, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={[styles.td, { width: '60%' }]}>{d.customerName}</Text>
                  <Text style={[styles.td, { width: '40%', textAlign: 'right' }]}>Rs. {d.totalDebt}</Text>
                </View>
              ))}
              <View style={[styles.tableRow, { fontWeight: 'bold' }]}>
                <Text style={[styles.td, { width: '60%' }]}>Total Debt Outstanding</Text>
                <Text style={[styles.td, { width: '40%', textAlign: 'right', fontWeight: 'bold' }]}>Rs. {totalDebt}</Text>
              </View>
            </View>
          </View>
          
          <View style={{ width: '48%' }}>
            <Text style={styles.sectionTitle}>Owed Liabilities (Creditors)</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.th, { width: '60%', color: '#ffffff' }]}>Vendor Supplier</Text>
                <Text style={[styles.th, { width: '40%', textAlign: 'right', color: '#ffffff' }]}>Owed (NPR)</Text>
              </View>
              {creditors.filter(c => c.totalCredit > 0).map((c, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={[styles.td, { width: '60%' }]}>{c.vendorName}</Text>
                  <Text style={[styles.td, { width: '40%', textAlign: 'right' }]}>Rs. {c.totalCredit}</Text>
                </View>
              ))}
              <View style={[styles.tableRow, { fontWeight: 'bold' }]}>
                <Text style={[styles.td, { width: '60%' }]}>Total Credit Owed</Text>
                <Text style={[styles.td, { width: '40%', textAlign: 'right', fontWeight: 'bold' }]}>Rs. {totalCredit}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stock Alert Status */}
        <Text style={styles.sectionTitle}>Inventory Stock Alerts (Low stock levels)</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.th, { width: '50%', color: '#ffffff' }]}>Product Name</Text>
            <Text style={[styles.th, { width: '25%', textAlign: 'center', color: '#ffffff' }]}>Current Stock</Text>
            <Text style={[styles.th, { width: '25%', textAlign: 'center', color: '#ffffff' }]}>Min Stock Alert</Text>
          </View>
          {products.map((p, i) => (
            <View key={i} style={[styles.tableRow, p.stockQuantity <= p.minStockLevel ? { backgroundColor: '#fef2f2' } : {}]}>
              <Text style={[styles.td, { width: '50%' }]}>{p.name}</Text>
              <Text style={[styles.td, { width: '25%', textAlign: 'center', color: p.stockQuantity <= p.minStockLevel ? 'red' : 'black' }]}>
                {p.stockQuantity} jars
              </Text>
              <Text style={[styles.td, { width: '25%', textAlign: 'center' }]}>{p.minStockLevel} jars</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Confidential. Internal Great Pickle Taste Management Reporting.
        </Text>
      </Page>
    </Document>
  );
};
