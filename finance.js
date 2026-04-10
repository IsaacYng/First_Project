window.calculateFinance = function() {
    const selectedId = document.getElementById('modelSelect').value;
    const bike = allBikes.find(b => b.id === selectedId);
    if (!bike) return;

    // १. डेटा लिने
    const mrp = parseFloat(bike.price) || 0;
    const insurance = parseFloat(bike.Insurance) || 0;
    const discount = parseFloat(document.getElementById('discountInput').value) || 0;
    const customerExtraAdv = parseFloat(document.getElementById('advEmiInput').value) || 0; 
    const namsari = parseFloat(document.getElementById('namsariInput').value) || 0;
    const accCost = (parseFloat(document.getElementById('helmetInput').value) || 0) + 
                     (parseFloat(document.getElementById('legguardInput').value) || 0) + 
                     (parseFloat(document.getElementById('seatcoverInput').value) || 0) + 
                     (parseFloat(document.getElementById('othersInput').value) || 0);

    const dpPercentVal = parseFloat(document.getElementById('dpPercent').value);
    const tenure = parseFloat(document.getElementById('tenure').value);

    // २. लोन र EMI हिसाब (EMI लाई दशमलवमा राख्ने)
    const afterDiscount = mrp - discount;
    const dpAmountOnly = afterDiscount * (dpPercentVal / 100);
    const loanAmount = afterDiscount - dpAmountOnly;

    let rate = 13.99;
    if (dpPercentVal >= 60) rate = 9.99;
    else if (dpPercentVal >= 50) rate = 11.99;
    else if (dpPercentVal >= 40) rate = 12.99;

    const monthlyRate = (rate / 12) / 100;
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);

    // ३. कच्चा जम्मा रकम (सबै जोड्ने तर राउन्ड नगरी)
    // हिसाब: DP + Namsari + Insurance + १ किस्ता EMI + Accessories + Customer Extra
    const rawTotalDownpayment = dpAmountOnly + namsari + insurance + emi + accCost + customerExtraAdv;

    // ४. Auto Rounding Adjustment (१०३,४५६ लाई १०४,००० बनाउने लजिक)
    const lastThreeDigits = Math.ceil(rawTotalDownpayment) % 1000;
    const autoRounding = lastThreeDigits > 0 ? (1000 - lastThreeDigits) : 0;

    // ५. फाइनल जम्मा रकम (जो बोकेर ग्राहक शोरुम आउँछ)
    const finalTotalDP = Math.ceil(rawTotalDownpayment) + autoRounding;

    // ६. Total Advance EMI (शोरुमले लिने पहिलो किस्ता + राउन्ड अप गरेको पैसा + ग्राहकले थपेको)
    const totalAdvEmiIncludingAdjustment = emi + autoRounding + customerExtraAdv;

    // ७. Due EMI (बाँकी तिर्नुपर्ने: कुल किस्ता रकम - ग्राहकले पहिल्यै तिरिसकेको एडभान्स)
    // यहाँ EMI * (Tenure - 1) हुन्छ किनकि १ किस्ता त सुरुमै तिरिसकियो
    const totalRemainingToPay = (emi * (tenure - 1)) - customerExtraAdv;

    // --- स्क्रिनमा देखाउने ---
    document.getElementById('mrp').innerText = `RS. ${mrp.toLocaleString()}`;
    document.getElementById('afterDiscount').innerText = `RS. ${afterDiscount.toLocaleString()}`;
    
    // Total Downpayment (Main Highlight)
    document.getElementById('displayTotalDP').innerText = `RS. ${finalTotalDP.toLocaleString()}`;
    
    // Monthly EMI (२ अक्षर दशमलवमा)
    document.getElementById('displayEMI').innerText = `RS. ${emi.toFixed(2)}`;
    
    document.getElementById('displayAutoAdEmi').innerText = `RS. ${autoRounding.toLocaleString()}`;
    document.getElementById('displayTotalAdvEmi').innerText = `RS. ${Math.round(totalAdvEmiIncludingAdjustment).toLocaleString()}`;
    document.getElementById('displayDueEmi').innerText = `RS. ${Math.round(totalRemainingToPay).toLocaleString()}`;
    
    document.getElementById('displayRate').innerText = `${rate}%`;
    document.getElementById('displayDpAmt').innerText = `RS. ${Math.round(dpAmountOnly).toLocaleString()}`;
    document.getElementById('displayLoanAmt').innerText = `RS. ${Math.round(loanAmount).toLocaleString()}`;
    document.getElementById('displayTotalInterest').innerText = `RS. ${Math.round((emi * tenure) - loanAmount).toLocaleString()}`;
};
  
