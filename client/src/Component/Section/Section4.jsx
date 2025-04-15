import React, { useState } from 'react';
import GST  from '../../asset/GST.jpg';
import './Section.css'

const Section4 = () => {
    const [showAccordion, setShowAccordion] = useState(false);

    const toggleAccordion = () => setShowAccordion(!showAccordion);

    return (
        <div className="section-container">
            <div className="section-content">
                <div>
                    <h3 className="section-title">GST filings made easy</h3>
                    <p className="section-description">
                        Using AIMPS, you can quickly generate GST reports to instantly file your returns.
                    </p>
                    <div className="accordion">
                        <div className="accordion-title" onClick={toggleAccordion}>
                            <span>Read more</span>
                        </div>
                        <div className={`accordion-content ${showAccordion ? 'show' : ''}`}>
                            <h3>AIMPS is a Simple & Free GST Billing & Accounting Software for SMEs.</h3>
                            <p>GST filing is no longer a long process for AIMPS users. You can generate GST reports like GSTR1, GSTR2, and avoid penalties.</p>
                            <p>AIMPS software ensures all bills are accounted for before filing taxes, saving time with data backup options.</p>
                        </div>
                    </div>
                   
                </div>
                <div className="image-container">
                    <img
                        src={GST}
                        alt="Sales Dashboard AIMPS billing inventory accounting GST"
                    />
                </div>
            </div>
        </div>
    );
};

export default Section4;
