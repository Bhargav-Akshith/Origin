export type Language = 'en' | 'hi';

export const translations = {
  en: {
    // Top Bar
    govIndia: 'GOVERNMENT OF INDIA • MINISTRY OF CONSUMER AFFAIRS',
    deptLegalMetrology: 'DEPARTMENT OF LEGAL METROLOGY',
    stdCompliancePortal: 'Standard Compliance Portal • LMR 2011',
    portalTitle: 'Packaged Commodity Compliance & Verification Portal',
    portalSubtitle: 'National Legal Metrology Enforcement System (NLMES)',
    inspectionDate: 'Inspection Date',
    portalActive: 'PORTAL OPERATIONAL',
    inspectorId: 'Inspector GOV-8821',
    enforcementWing: 'Central Enforcement Wing',
    
    // Metrics
    totalScanned: 'Total Scanned SKUs',
    batchLiveAudits: 'Batch & Live Audits',
    complianceRate: 'Compliance Rate',
    compliantSkus: 'Compliant SKUs',
    violationsFlagged: 'Violations Flagged',
    nonCompliantItems: 'Non-Compliant Items',
    criticalBreaches: 'Critical Statutory Breaches',
    noticeIssuable: 'Notice Issuable',

    // Ingestion
    ingestionTitle: 'Universal Commodity Inspection & Screening Terminal',
    ingestionSubtitle: 'Automated scanning of product packaging, digital catalog artwork, or physical label photographs',
    ingestionBadge: 'Module: Ingestion & Regulatory OCR',
    commodityNameLabel: 'Commodity / Brand Identification (Optional)',
    commodityNamePlaceholder: 'e.g. Standard Packaged Commodity',
    categoryLabel: 'Statutory Regulatory Category',
    uploadBtn: 'Upload Package File',
    cameraBtn: 'Capture Camera',
    dragDropText: 'Drag and drop packaging image or click to select from filesystem',
    formatSupportText: 'Universal format support: JPG, PNG, WEBP, BMP (Max 25MB) • Automatic Deskew & Glare Filtering',
    processingText: 'Executing Computer Vision & Statutory Parsing...',
    processingSub: 'Validating all 8 statutory Legal Metrology rules',
    benchmarkTitle: 'Standard Reference Test Commodities',
    benchmarkSub: 'Benchmark SKUs',
    benchmarkDesc: 'Pre-configured statutory test cases for instant verification of compliance vs non-compliance workflows:',

    // Categories
    catFood: 'Packaged Food, Edible Oils & Confectionery',
    catCosmetics: 'Cosmetics, Soaps & Personal Hygiene',
    catPharma: 'Pharmaceuticals & Nutrition Pre-packs',
    catChemicals: 'Household Detergents & Chemical Commodities',
    catElectronics: 'Electronics, Cables & Domestic Appliances',
    catGeneral: 'General Consumer Commodities & Textiles',

    // Canvas
    canvasTitle: 'Computer Vision Evidence Locator',
    spatialZones: 'Spatial Declarations',
    showOverlays: 'Show Overlays',
    noPackageTitle: 'No Commodity Packaging Loaded',
    noPackageDesc: 'Upload any consumer commodity photo or select a benchmark sample above to visualize bounding-box evidence',
    canvasHelp: 'Click any spatial bounding box on the packaging artwork to isolate its statutory declaration.',
    verifiedPass: 'Verified Pass',
    statutoryViolation: 'Statutory Violation',
    omittedOnPackaging: '[Omitted on Packaging]',

    // Compliance Card
    statutoryAssessment: 'Statutory Assessment',
    score: 'Score',
    clearanceTitle: 'STATUTORY COMPLIANCE CLEARANCE',
    nonComplianceTitle: 'STATUTORY NON-COMPLIANCE DETECTED',
    pdfCertificateBtn: 'Official PDF Certificate',
    commodity: 'Commodity',
    category: 'Regulatory Category',
    violationsCount: 'Violations Flagged',
    digitalSha: 'Digital SHA-256',
    clauseBreaches: 'Clause Breaches',

    // Rules Table
    tableTitle: 'Statutory Legal Metrology Declarations Audit',
    tableSubtitle: 'Enforcement of Legal Metrology (Packaged Commodities) Rules, 2011 & Amendments',
    verifiedOutOf: 'Declarations Verified',
    thClause: 'Clause',
    thDeclaration: 'Statutory Declaration',
    thDetectedValue: 'Detected Packaging Value',
    thStatus: 'Legal Status',
    thInspect: 'Inspect',
    passBadge: 'PASS',
    violationBadge: 'VIOLATION',

    // Rule Names & Requirements
    rule_mfg_address: 'Complete Name & Address of Manufacturer / Packer / Importer',
    rule_generic_name: 'Generic or Common Name of Commodity',
    rule_net_quantity: 'Net Quantity in Standard Metric Units (SI Units)',
    rule_mfg_date: 'Month & Year of Manufacture / Pre-packing',
    rule_expiry_date: 'Best Before / Expiration Period for Consumer Safety',
    rule_mrp: 'Retail Sale Price (MRP incl. of all taxes) & Unit Sale Price (USP)',
    rule_consumer_care: 'Consumer Grievance Redressal Officer (Name, Address, Phone, Email)',
    rule_country_origin: 'Country of Origin / Manufacturing Origin Statement',

    // Violations List
    zeroViolationsTitle: 'Zero Statutory Violations Detected',
    zeroViolationsDesc: 'This packaging fully complies with all declarations under Legal Metrology Rules, 2011. No statutory penalties or seizure notices apply.',
    violationsListTitle: 'Statutory Violations & Legal Notices',
    actionRequiredNotice: 'Action Required: Section 39 Notice',
    packagingEvidence: 'Packaging Evidence',

    // Camera Modal
    cameraModalTitle: 'Live Package Camera Scanner',
    cameraModalSubtitle: 'Position commodity packaging label inside the viewfinder reticle for optical compliance scan',
    cameraCaptureBtn: 'Capture & Run Compliance Audit',
    cameraSwitchBtn: 'Switch Camera Lens',
    cameraCloseBtn: 'Close Scanner',
    cameraErrorTitle: 'Camera Stream Unavailable',
    cameraErrorDesc: 'Unable to access hardware camera or permission was not granted. You can still upload packaging photos directly.',
    cameraSelectFileFallback: 'Upload Photo Instead',

    // Admin Control Center
    adminPortalTab: 'Admin Control Center',
    inspectorPortalTab: 'Inspector Portal',
    adminBadge: 'CENTRAL CONTROLLER CLEARANCE',
    navDashboard: 'Executive Dashboard',
    navUsers: 'User & Role Access',
    navRules: 'Rules Engine Manager',
    navSubmissions: 'Case Review & Submissions',
    navAiDiagnostics: 'AI & Vision Diagnostics',
    navAnalytics: 'Compliance Analytics',
    navAuditLogs: 'Security Audit Trail',
    navSettings: 'System Settings',
    navAlerts: 'Alerts & Notices',

    // Admin Common Actions
    saveChanges: 'Save Changes',
    cancelAction: 'Cancel',
    searchPlaceholder: 'Search records...',
    filterAll: 'All Categories / Statuses',
    roleAdmin: 'Administrator',
    roleInspector: 'Inspector',
    roleReviewer: 'Senior Reviewer',
    roleOperator: 'Terminal Operator',
    statusActive: 'ACTIVE',
    statusBlocked: 'SUSPENDED',
    statusNew: 'NEW',
    statusUnderReview: 'UNDER REVIEW',
    statusCompleted: 'APPROVED / CLEAR',
    statusNoticeIssued: 'SECTION 39 NOTICE',

    // Footer
    footerLeft: 'SIH Origin • Team IRIS | Smart India Hackathon 2026 | PS #26034',
    footerRight: 'Automated Legal Metrology (Packaged Commodities) Compliance System • Version 2.0 (Dual Portal)'
  },
  hi: {
    // Top Bar
    govIndia: 'भारत सरकार • उपभोक्ता मामले मंत्रालय',
    deptLegalMetrology: 'विधिक मापविज्ञान विभाग',
    stdCompliancePortal: 'मानक अनुपालन पोर्टल • एलएमआर 2011',
    portalTitle: 'पैकेज्ड कमोडिटी अनुपालन एवं सत्यापन पोर्टल',
    portalSubtitle: 'राष्ट्रीय विधिक मापविज्ञान प्रवर्तन प्रणाली (NLMES)',
    inspectionDate: 'निरीक्षण तिथि',
    portalActive: 'पोर्टल सक्रिय',
    inspectorId: 'निरीक्षक GOV-8821',
    enforcementWing: 'केंद्रीय प्रवर्तन विंग',
    
    // Metrics
    totalScanned: 'कुल स्कैन की गई वस्तुएं',
    batchLiveAudits: 'बैच एवं लाइव ऑडिट',
    complianceRate: 'अनुपालन दर',
    compliantSkus: 'अनुपालन वाली वस्तुएं',
    violationsFlagged: 'चिह्नित उल्लंघन',
    nonCompliantItems: 'गैर-अनुपालन वस्तुएं',
    criticalBreaches: 'गंभीर वैधानिक उल्लंघन',
    noticeIssuable: 'नोटिस जारी योग्य',

    // Ingestion
    ingestionTitle: 'सार्वभौमिक कमोडिटी निरीक्षण एवं स्क्रीनिंग टर्मिनल',
    ingestionSubtitle: 'वैधानिक सत्यापन हेतु उत्पाद पैकेजिंग, डिजिटल कैटलॉग या लेबल तस्वीरों की स्वचालित स्कैनिंग',
    ingestionBadge: 'मॉड्यूल: इनजेशन एवं विनियामक ओसीआर',
    commodityNameLabel: 'कमोडिटी / ब्रांड पहचान (वैकल्पिक)',
    commodityNamePlaceholder: 'उदा. मानक पैकेज्ड कमोडिटी',
    categoryLabel: 'वैधानिक विनियामक श्रेणी',
    uploadBtn: 'पैकेज फ़ाइल अपलोड करें',
    cameraBtn: 'कैमरा लाइव स्कैनर',
    dragDropText: 'पैकेजिंग छवि खींचें और छोड़ें या फ़ाइल सिस्टम से चुनें',
    formatSupportText: 'सार्वभौमिक प्रारूप समर्थन: JPG, PNG, WEBP, BMP (अधिकतम 25MB) • स्वचालित डीस्क्यू एवं चमक फ़िल्टरिंग',
    processingText: 'कंप्यूटर विज़न एवं वैधानिक पार्सिंग जारी...',
    processingSub: 'सभी 8 वैधानिक विधिक मापविज्ञान नियमों का सत्यापन',
    benchmarkTitle: 'मानक संदर्भ परीक्षण कमोडिटी',
    benchmarkSub: 'बेंचमार्क वस्तुएं',
    benchmarkDesc: 'अनुपालन बनाम गैर-अनुपालन वर्कफ़्लो के त्वरित सत्यापन हेतु पूर्व-कॉन्फ़िगर किए गए परीक्षण मामले:',

    // Categories
    catFood: 'पैकेज्ड खाद्य, खाद्य तेल एवं कन्फेक्शनरी',
    catCosmetics: 'सौंदर्य प्रसाधन, साबुन एवं व्यक्तिगत स्वच्छता',
    catPharma: 'फार्मास्यूटिकल्स एवं पोषण प्री-पैक',
    catChemicals: 'घरेलू डिटर्जेंट एवं रासायनिक वस्तुएं',
    catElectronics: 'इलेक्ट्रॉनिक्स, केबल एवं घरेलू उपकरण',
    catGeneral: 'सामान्य उपभोक्ता वस्तुएं एवं कपड़ा',

    // Canvas
    canvasTitle: 'कंप्यूटर विज़न साक्ष्य लोकेटर',
    spatialZones: 'स्थानिक घोषणाएं',
    showOverlays: 'ओवरले दिखाएं',
    noPackageTitle: 'कोई कमोडिटी पैकेजिंग लोड नहीं है',
    noPackageDesc: 'बाउंडिंग-बॉक्स साक्ष्य देखने के लिए उपभोक्ता कमोडिटी फोटो अपलोड करें या बेंचमार्क नमूना चुनें',
    canvasHelp: 'वैधानिक घोषणा को अलग से देखने के लिए पैकेजिंग पर किसी भी बॉक्स पर क्लिक करें।',
    verifiedPass: 'सत्यापित पास',
    statutoryViolation: 'वैधानिक उल्लंघन',
    omittedOnPackaging: '[पैकेजिंग पर मौजूद नहीं]',

    // Compliance Card
    statutoryAssessment: 'वैधानिक मूल्यांकन',
    score: 'स्कोर',
    clearanceTitle: 'वैधानिक अनुपालन प्रमाण पत्र स्वीकृत',
    nonComplianceTitle: 'वैधानिक गैर-अनुपालन पाया गया',
    pdfCertificateBtn: 'आधिकारिक पीडीएफ प्रमाणपत्र',
    commodity: 'कमोडिटी',
    category: 'विनियामक श्रेणी',
    violationsCount: 'चिह्नित उल्लंघन',
    digitalSha: 'डिजिटल SHA-256',
    clauseBreaches: 'खंड उल्लंघन',

    // Rules Table
    tableTitle: 'वैधानिक विधिक मापविज्ञान घोषणाएं ऑडिट',
    tableSubtitle: 'विधिक मापविज्ञान (पैकेज्ड कमोडिटीज) नियम, 2011 एवं संशोधन का प्रवर्तन',
    verifiedOutOf: 'घोषणाएं सत्यापित',
    thClause: 'खंड',
    thDeclaration: 'वैधानिक घोषणा',
    thDetectedValue: 'पहचाना गया पैकेजिंग मान',
    thStatus: 'कानूनी स्थिति',
    thInspect: 'निरीक्षण',
    passBadge: 'पास',
    violationBadge: 'उल्लंघन',

    // Rule Names & Requirements
    rule_mfg_address: 'निर्माता / पैकर / आयातक का पूरा नाम और पता',
    rule_generic_name: 'कमोडिटी का सामान्य या जेनेरिक नाम',
    rule_net_quantity: 'मानक मीट्रिक इकाइयों (SI यूनिट) में शुद्ध मात्रा',
    rule_mfg_date: 'निर्माण / प्री-पैकिंग का महीना और वर्ष',
    rule_expiry_date: 'उपभोक्ता सुरक्षा हेतु उपयोग की अंतिम अवधि (Best Before)',
    rule_mrp: 'अधिकतम खुदरा मूल्य (सभी करों सहित) एवं यूनिट बिक्री मूल्य (USP)',
    rule_consumer_care: 'उपभोक्ता शिकायत निवारण अधिकारी (नाम, पता, फोन, ईमेल)',
    rule_country_origin: 'मूल देश / निर्माण देश का स्पष्ट विवरण',

    // Violations List
    zeroViolationsTitle: 'शून्य वैधानिक उल्लंघन पाया गया',
    zeroViolationsDesc: 'यह पैकेजिंग विधिक मापविज्ञान नियम 2011 के तहत सभी नियमों का पूर्ण अनुपालन करती है। कोई जब्ती या वैधानिक नोटिस लागू नहीं है।',
    violationsListTitle: 'वैधानिक उल्लंघन एवं कानूनी नोटिस',
    actionRequiredNotice: 'आवश्यक कार्रवाई: धारा 39 नोटिस',
    packagingEvidence: 'पैकेजिंग साक्ष्य',

    // Camera Modal
    cameraModalTitle: 'लाइव पैकेज कैमरा स्कैनर',
    cameraModalSubtitle: 'ऑप्टिकल अनुपालन स्कैन के लिए पैकेजिंग लेबल को व्यूफ़ाइंडर फ़्रेम में रखें',
    cameraCaptureBtn: 'कैप्चर एवं अनुपालन ऑडिट चलाएं',
    cameraSwitchBtn: 'कैमरा लेंस बदलें',
    cameraCloseBtn: 'स्कैनर बंद करें',
    cameraErrorTitle: 'कैमरा उपलब्ध नहीं है',
    cameraErrorDesc: 'हार्डवेयर कैमरा या अनुमति उपलब्ध नहीं है। आप सीधे पैकेजिंग फ़ोटो अपलोड कर सकते हैं।',
    cameraSelectFileFallback: 'फ़ोटो अपलोड करें',

    // Admin Control Center
    adminPortalTab: 'एडमिन कंट्रोल सेंटर',
    inspectorPortalTab: 'निरीक्षक पोर्टल',
    adminBadge: 'केंद्रीय नियंत्रक अनुमति',
    navDashboard: 'कार्यकारी डैशबोर्ड',
    navUsers: 'उपयोगकर्ता एवं भूमिका पहुंच',
    navRules: 'नियम इंजन प्रबंधक',
    navSubmissions: 'केस समीक्षा एवं सबमिशन',
    navAiDiagnostics: 'एआई एवं विज़न डायग्नोस्टिक्स',
    navAnalytics: 'अनुपालन विश्लेषण',
    navAuditLogs: 'सुरक्षा ऑडिट ट्रेल',
    navSettings: 'सिस्टम सेटिंग्स',
    navAlerts: 'अलर्ट एवं नोटिस',

    // Admin Common Actions
    saveChanges: 'परिवर्तन सहेजें',
    cancelAction: 'रद्द करें',
    searchPlaceholder: 'रिकॉर्ड खोजें...',
    filterAll: 'सभी श्रेणियां / स्थितियां',
    roleAdmin: 'व्यवस्थापक (Admin)',
    roleInspector: 'विधिक निरीक्षक',
    roleReviewer: 'वरिष्ठ समीक्षक',
    roleOperator: 'टर्मिनल ऑपरेटर',
    statusActive: 'सक्रिय',
    statusBlocked: 'निलंबित',
    statusNew: 'नया',
    statusUnderReview: 'समीक्षाधीन',
    statusCompleted: 'स्वीकृत / अनुपालन',
    statusNoticeIssued: 'धारा 39 नोटिस जारी',

    // Footer
    footerLeft: 'SIH ओरिजिन • टीम IRIS | स्मार्ट इंडिया हैकाथॉन 2026 | समस्या आईडी #26034',
    footerRight: 'स्वचालित विधिक मापविज्ञान (पैकेज्ड कमोडिटीज) अनुपालन प्रणाली • संस्करण 2.0 (दोहरी पोर्टल)'
  }
};
