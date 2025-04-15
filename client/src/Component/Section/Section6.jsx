import React, { useState } from 'react';
import payment from '../../asset/payment.avif'
import './Section.css'

const Section6 = () => {
    const [showAccordion, setShowAccordion] = useState(false);

    const toggleAccordion = () => setShowAccordion(!showAccordion);

    return (
        <div className="section-container">
            <div className="section-content">
                <div className="relative">
                    <h3 className="section-title">Get payments faster</h3>
                    <p className="section-description">
                        With AIMPS you can send payment links and even QR codes so that customers can pay you quickly. Send payment reminders easily. Make payments to your suppliers conveniently from your trusted UPI apps.
                    </p>
                    <div className="accordion">
                        <div className="accordion-title" onClick={toggleAccordion}>
                            <span>Read more</span>
                        </div>
                        <div className={`accordion-content ${showAccordion ? 'show' : ''}`}>
                            <h3 style={{ fontSize: '12px', fontWeight: 'bold' }}>Quick Invoicing for Retailers, Distributors, Startups, Freelancers, Service Providers using AIMPS invoicing app</h3>
                            <p>AIMPS is the best GST billing and accounting software that allows you to generate all kinds of reports like Daily Sale Reports, Bill-wise profit, Item-wise and Party-wise Sale Reports, Purchase Reports, Quotation Reports, Inventory StockIn and StockOut Reports, Expense Reports, Party Ledgers, Payments Reports, Category-wise Sale Reports, Profit and Loss Statements, etc.</p>
                            <p>With the use of the AIMPS GST software, it is quite easier to track sales, purchases, quotations, and expenses. You can add multiple users, businesses, price lists for wholesale price, retail price, distributor price, etc. Recording the expenses in the business is most important to maintain the accounts and even for tax filing. It is easier to record expenses in AIMPS GST billing and invoicing software.</p>
                        </div>
                    </div>
                   
                </div>
                <div className="image-container">
                    <img
                        src={payment}
                        alt="Sales Dashboard"
                    />
                </div>
            </div>
        </div>
    );
};

export default Section6;
