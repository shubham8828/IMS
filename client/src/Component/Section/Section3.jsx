import React, { useState } from "react";
import invoiceImage from "../../asset/share_invoices_on_whatsapp_1.webp";
import './Section.css'

const ShareInvoiceSection = () => {
  const [showAccordion, setShowAccordion] = useState(false);

  const toggleAccordion = () => setShowAccordion(!showAccordion);

  return (
    <div className="section-container">
      <div className="section-content">
        <div className="image-container">
          <img
            src={invoiceImage}
            alt="Share invoices on WhatsApp AIMPS billing inventory accounting GST"
          />
        </div>
        <div>
          <h3 className="section-title">Share invoices on WhatsApp & Email</h3>
          <p className="section-description">
            AIMPS helps you reach your customers and vendors wherever they are.
            Share invoices and purchase orders on WhatsApp and Email.
          </p>
          <div className="accordion">
            <div className="accordion-title" onClick={toggleAccordion}>
              <span>Read more</span>
            </div>
            <div className={`accordion-content ${showAccordion ? "show" : ""}`}>
              <h3>
                Using AIMPS, create GST Compliant Invoices & Share with
                Customers Easily on WhatsApp and Email
              </h3>
              <p>
                With AIMPS free GST billing software, you can easily create GST
                Invoices, Bills, Quotations, and more. Share them seamlessly on
                WhatsApp and Email.
              </p>
              <p>
                AIMPS offers a seamless experience, allowing you to print and
                customize invoices with brand colors and logos in various sizes.
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ShareInvoiceSection;
