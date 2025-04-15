import React, { useState } from 'react';
import management from '../../asset/management.jpg'
import './Section.css'

const Section5 = () => {
    const [showAccordion, setShowAccordion] = useState(false);

    const toggleAccordion = () => setShowAccordion(!showAccordion);

    return (
        <div className="section-container">
            <div className="section-content">
            <div className="image-container">
                    <img
                        src={management}
                        alt="AIMPS inventory management AIMPS billing taxes accounting GST"
                    />
                </div>
                <div className="lg:col-start-2">
                    
                    <h3 className="section-title">Manage inventory</h3>
                    <p className="section-description">
                        AIMPS Inventory is designed to help you spend less time in front of the screen and more time with your customers. Download reports on current inventory and update inventory quantities in bulk, which is helpful when adding new inventory.
                    </p>
                    <div className="accordion">
                        <div className="accordion-title" onClick={toggleAccordion}>
                            <span>Read more</span>
                        </div>
                        <div className={`accordion-content ${showAccordion ? 'show' : ''}`}>
                            <h3>AIMPS easy POS Billing, Stock and Payments for Small Businesses. Get Sales &amp; Stock Reports.</h3>
                            <p>The AIMPS billing &amp; invoicing software system helps you track all your inventory instantly. By using AIMPS inventory tracking software, you can track complete inventory with StockIn and StockOut options as soon as they arrive or are dispatched.</p>
                            <p>Using our instant invoicing app, you can have full inventory control managed by a single employee. AIMPS inventory management software allows you to enter large amounts of inventory supply data directly by importing an excel sheet using bulk import options.</p>
                        </div>
                    </div>

                </div>
                
            </div>
        </div>
    );
};

export default Section5;
