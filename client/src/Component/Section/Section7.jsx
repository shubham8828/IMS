import React, { useState } from 'react';
import analysis  from '../../asset/analysis.jpeg';

import './Section.css'

const Section7 = () => {
    const [showAccordion, setShowAccordion] = useState(false);

    const toggleAccordion = () => setShowAccordion(!showAccordion);

    return (
        <div className="section-container">
            <div className="section-content">
            <div className="image-container">
                    <img
                        src={analysis}
                        alt="Business Analytics Dashboard"
                    />
                </div>
                <div className="relative">
                    <h3 className="section-title">Powerful business analytics and Reports</h3>
                    <p className="section-description">
                        AIMPS automatically generates all the business analytics you will ever need to answer any question about the product/category-wise sales or to understand your users and payments.
                    </p>
                    <div className="accordion">
                        <div className="accordion-title" onClick={toggleAccordion}>
                            <span>Read more</span>
                        </div>
                        <div className={`accordion-content ${showAccordion ? 'show' : ''}`}>
                            <h3 style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                Quick Invoicing for Retailers, Distributors, Startups, Freelancers, Service Providers using AIMPS invoicing app
                            </h3>
                            <p>
                                AIMPS is the best GST billing and accounting software that allows you to generate all kinds of reports like Daily Sale Reports, Bill-wise profit, Item-wise and Party-wise Sale Reports, Purchase Reports, Quotation Reports, Inventory StockIn and StockOut Reports, Expense Reports, Party Ledgers, Payments Reports, Category-wise Sale Reports, Profit and Loss Statements, etc.
                            </p>
                            <p>
                                With the use of the AIMPS GST software, it is quite easier to track sales, purchases, quotations, and expenses. You can add multiple users, businesses, price lists for wholesale price, retail price, distributor price, etc. Recording the expenses in the business is most important to maintain the accounts and even for tax filing. It is easier to record expenses in AIMPS GST billing and invoicing software.
                            </p>
                        </div>
                    </div>
                   
                </div>
                
            </div>
        </div>
    );
};

export default Section7;
