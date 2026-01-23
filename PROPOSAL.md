# Proposal: Interactive Multilingual Kidney Treatment Decision Aid

**Prepared by:** Pears Research Services
**Date:** January 2026
**Version:** 1.0
**Contact:** Pears Research Services

---

## Executive Summary

This proposal presents the case for an interactive, multilingual, web-based decision aid designed to support patients with chronic kidney disease (CKD) in making informed treatment decisions. The tool addresses a well-documented gap in current NHS patient education provision: the absence of a comprehensive, personalised, digital decision aid that helps kidney patients explore treatment options across language and cultural barriers.

The current landscape relies predominantly on static pamphlets, archived web resources, and paper-based booklets that fail to meet the needs of an increasingly diverse patient population. Research demonstrates that interactive digital decision aids significantly outperform static materials across every measured outcome, with the 2024 Cochrane review of 209 RCTs (107,698 participants) confirming substantial improvements in patient knowledge, risk understanding, and decision quality with no adverse effects.

**Cost:** One-time development fee of GBP 1,000
**Maintenance:** Minimal; can be absorbed into existing institutional infrastructure
**Hosting:** Deployable on existing servers at negligible additional cost

---

## 1. Rationale and Evidence Base

### 1.1 The Scale of the Problem

Chronic kidney disease affects approximately 1 in 10 UK adults, with around 65,000 people receiving renal replacement therapy at any given time. When patients reach advanced CKD (stages 4-5), they face one of the most consequential healthcare decisions of their lives: choosing between haemodialysis, peritoneal dialysis, kidney transplantation, or conservative management.

### 1.2 Disproportionate Impact on Ethnic Minority Communities

The evidence shows that Black, South Asian, and other ethnic minority communities carry a disproportionate burden:

- End-stage renal failure incidence is **3 to 5 times greater** among ethnic minorities than white Caucasians
- RRT take-on rates: 58/million for white patients vs **221/million for South Asians** and **163/million for African Caribbeans**
- **27% of people on RRT** are from minority ethnic groups despite representing a smaller population share
- Black and Asian patients wait approximately **2.5 years** for a kidney transplant vs 2 years for white patients
- **35% of those waiting for a kidney** are from minority ethnic groups

### 1.3 Language Barriers and Health Literacy

- Approximately **1 million people** in the UK cannot speak English well or at all
- Among non-English-speaking patients: 49% had trouble understanding medical situations, 35% were confused about medication use
- 68% of kidney patients seek information online rather than from professionals
- Only **35% of NHS trusts** are fully compliant with Accessible Information Standards
- The CQC has identified failure to provide communication in other languages as a cause of serious harm

### 1.4 Current Resources Are Inadequate

The UK Kidney PREM survey consistently shows that "Sharing Decisions About Your Care" is one of the **lowest-scoring themes**. A service evaluation across 27 UK renal units found that available materials are of "mixed quality and content and are not widely used or always positively received."

Key findings:
- Only **35% of patients** knew that conservative management was a possible option
- The NHS Think Kidneys programme concluded in 2019; its resources are **archived and unmaintained**
- Only 60% of adult inpatients were as involved in decision-making as they wanted to be

### 1.5 The "Falling through the GApp" Report (2026)

Kidney Care UK's most recent report reveals:
- 1 in 10 patients first learn of their CKD via the NHS App without explanation
- Almost **40% did not have the opportunity** to discuss their diagnosis with a professional
- For 20% there was a gap of **one year or more** between diagnosis and learning about it
- Over 800 patients described "upsetting, traumatic and difficult experiences"

### 1.6 Evidence That Interactive Decision Aids Work

The **2024 Cochrane Systematic Review** (209 RCTs, 107,698 participants) demonstrates:

| Outcome | Effect |
|---------|--------|
| Knowledge improvement | +11.9 points on 100-point scale |
| Accurate risk perceptions | 94% improvement (RR 1.94) |
| Feeling uninformed | Significantly reduced |
| Passive decision-making | 28% reduction |
| Adverse effects | None identified |

The **iPtDA-KRT App Study (2025)** -- the most directly comparable research -- found that interactive digital decision aids demonstrated "substantial and lasting benefits over paper-based PtDAs" with significantly greater improvements in self-efficacy, knowledge, and preparation for decision-making, sustained over 8 weeks.

---

## 2. Current Landscape vs. This Tool

### 2.1 What Currently Exists

| Resource | Format | Limitations |
|----------|--------|-------------|
| **YoDDA Booklet** | 44-page PDF/print | Static, English-only primary version, not personalised |
| **NHS Right Care PDA** | Basic online form | Archived (2019), unmaintained, not interactive |
| **The Kidney Map** | Illustrated poster | Requires group setting with facilitator |
| **MyRenalCare** | Web app | Care management tool, not a treatment decision aid |
| **Kidney Beam** | Online platform | Wellbeing/exercise only, no decision support |
| **Cognitant/Healthinote** | Avatar animations | CKD education only, not treatment modality decisions |

### 2.2 The Gap

There is **no interactive, personalised, multilingual digital decision aid** in the UK that helps kidney patients:
- Explore all treatment options based on their individual circumstances
- Clarify personal values and life goals against treatment compatibility
- Compare treatments side-by-side with personalised relevance
- Access information in their native language with cultural sensitivity
- Generate a personalised summary with questions for their care team

### 2.3 How This Tool Fills the Gap

| Dimension | Static Materials | This Interactive Tool |
|-----------|-----------------|----------------------|
| Personalisation | One-size-fits-all | Adapts to journey stage, preferences, goals |
| Languages | English (some translated excerpts) | 15 languages including 2 RTL (Arabic, Urdu) |
| Interactivity | Read-only | Values exercises, life goals compatibility, comparisons |
| Accessibility | PDF/print only | WCAG 2.2 AA compliant, responsive, works on any device |
| Output | Generic information | Personalised summary with prepared questions for care team |
| Maintenance | Requires reprinting | Digital updates deployed instantly |
| Cost per patient | Print and distribution costs | Zero marginal cost per additional user |
| Availability | Clinic hours / postal | 24/7 access from any device |

---

## 3. Features and Capabilities

### 3.1 Core Features

1. **Personalised Onboarding** -- Patients identify their journey stage (newly diagnosed, considering options, preparing for treatment, etc.) and learning preferences to receive tailored content

2. **Treatment Explorer** -- Comprehensive information on all treatment modalities:
   - Kidney transplantation (living and deceased donor)
   - Haemodialysis (in-centre and home)
   - Peritoneal dialysis (CAPD and APD)
   - Conservative management
   Each with lifestyle impact, process overview, and risk/benefit information

3. **Side-by-Side Comparison** -- Interactive comparison tool allowing patients to evaluate treatments across multiple criteria simultaneously

4. **Values Clarification Exercise** -- Based on the Ottawa Decision Support Framework, helping patients identify what matters most to them in a treatment decision

5. **Life Goals Compatibility Assessment** -- Patients select personal life goals across 6 categories (independence, social, work, lifestyle, health, emotional) and receive compatibility scores for each treatment option

6. **UK Population Statistics** -- Real data from UKRR, NHSBT, and NICE sources showing treatment choices, quality of life comparisons, waiting list information, and survival data with appropriate contextualisation

7. **Interactive 3D Kidney Model** -- Educational anatomy visualisation helping patients understand kidney function and disease

8. **Personalised Summary Report** -- Generates a printable/downloadable PDF summary including:
   - Treatment preferences and values alignment
   - Prepared questions for the kidney care team
   - Key statistics relevant to the patient
   - Life goals compatibility results
   - Next steps and discussion prompts

9. **Comprehensive Glossary** -- 35+ medical terms explained in plain language, searchable and categorised

10. **15-Language Support** -- Full interface translation including English, Welsh, Polish, Urdu, Arabic, Bengali, Gujarati, Punjabi, Somali, Chinese (Simplified/Traditional), French, Spanish, Portuguese, and Hindi -- covering the most commonly requested languages in UK renal services

### 3.2 Privacy and Data Protection

- **No account creation required** -- patients can use the tool immediately
- **No personal data stored on servers** -- all preferences stored locally in the browser
- **No tracking or analytics** that could identify individuals
- **Fully GDPR compliant** -- the tool operates without collecting personal health information
- **Works offline** once loaded (progressive web app capabilities)

### 3.3 Accessibility

- WCAG 2.2 AA compliant throughout
- Responsive design works on mobile, tablet, and desktop
- Right-to-left language support (Arabic, Urdu)
- High contrast and readable typography
- Keyboard navigable for motor impairments
- Screen reader compatible

---

## 4. Recommendation: AI Chat Feature

The application includes an optional AI-powered chat feature. However, **we recommend this feature remain disabled** for the following reasons:

1. **Privacy concerns** -- Patient queries to an AI service would transmit potentially sensitive health information to third-party API providers (OpenAI), creating data protection obligations and potential GDPR complications

2. **Ongoing costs** -- AI API usage incurs per-query costs that scale with user volume, creating an unpredictable ongoing financial obligation

3. **Clinical safety** -- AI responses about medical treatment carry liability risks and may not reflect the latest clinical guidance specific to the patient's trust or region

4. **The tool already addresses this need** -- The personalised summary generates a comprehensive list of prepared questions for the patient to discuss with their kidney care team at their next appointment. This approach:
   - Encourages direct patient-clinician dialogue
   - Ensures answers are clinically accurate and personalised
   - Avoids any risk of AI hallucination on medical topics
   - Has zero ongoing cost
   - Fully protects patient privacy

### 4.1 Future Enhancement: Sensitive Questions Section

A planned future feature would add a dedicated section for patients to note questions they may feel uncomfortable asking their healthcare provider directly. This addresses a real clinical need -- patients often have concerns about intimacy, body image, mental health, or lifestyle impacts that they avoid raising in consultations. The tool would:

- Provide a safe, private space to formulate these questions
- Offer example prompts to help patients articulate concerns
- Optionally include these in the printed summary report (patient's choice)
- Encourage patients to raise important topics they might otherwise avoid

This achieves the benefits of an AI chat (addressing sensitive queries) without the privacy, cost, or safety concerns.

---

## 5. Future Enhancements

### 5.1 Content Enhancements
1. **Additional 3D anatomical models** -- Dialysis access points (fistula, graft, peritoneal catheter), transplant surgical approach, kidney-bladder system
2. **Video testimonials** -- Real patient stories covering each treatment modality (with appropriate consent and ethical approval)
3. **Carer/family companion mode** -- Parallel journey for family members supporting the patient's decision
4. **Medication information module** -- Interactive guide to immunosuppression, dialysis medications, and side effect management
5. **Diet and nutrition tool** -- Personalised dietary guidance based on treatment type (potassium, phosphate, fluid restrictions)

### 5.2 Functionality Enhancements
6. **Sensitive questions section** -- Private space for uncomfortable or embarrassing questions (as described in Section 4.1)
7. **Progress tracking across sessions** -- Allow patients to return and continue where they left off over days/weeks
8. **Clinician dashboard** -- Summary view for healthcare professionals showing patient engagement and readiness
9. **Integration with PatientView** -- Link to real blood results and clinical data (with patient consent)
10. **Peer connection module** -- Anonymised matching with patients who have chosen similar treatments for community support

### 5.3 Technical Enhancements
11. **Native mobile app** -- iOS and Android versions with offline-first architecture
12. **Additional languages** -- Expansion to 25+ languages based on regional demand (e.g., Romanian, Turkish, Lithuanian, Tigrinya)
13. **Voice navigation** -- Hands-free operation for patients with visual or motor impairments
14. **NHS App integration** -- Embed within the NHS App ecosystem for seamless patient access
15. **Trust-specific customisation** -- Allow individual NHS trusts to add local service information, clinic details, and referral pathways

---

## 6. Budget and Implementation

### 6.1 Development Cost

| Item | Cost |
|------|------|
| Full application development, design, and deployment | **GBP 1,000** |
| 15-language translation and localisation | Included |
| WCAG 2.2 AA accessibility compliance | Included |
| Initial hosting setup and deployment | Included |
| User testing and quality assurance | Included |
| **Total one-time cost** | **GBP 1,000** |

### 6.2 Hosting and Infrastructure

The application is a lightweight, static web application that can be deployed on:

- **Existing NHS trust web infrastructure** -- at zero additional cost
- **Institutional servers** (university, research organisation) -- absorbed into existing hosting
- **Free-tier cloud services** -- Platforms such as Netlify, Vercel, or GitHub Pages offer free hosting for static applications with generous bandwidth allowances
- **Current deployment** -- Already live on Heroku (free/minimal tier) as a demonstration

**Expected hosting cost: GBP 0-20/month** depending on chosen infrastructure, with zero cost achievable using existing institutional resources or free-tier services.

### 6.3 Maintenance

The application content (treatment information, statistics, guidelines) should be reviewed periodically to ensure clinical accuracy. Options:

- **Self-maintained** -- The institution's own technical staff can update content directly. The codebase uses standard web technologies (React, TypeScript) and content is stored in structured JSON files, making updates straightforward for any web developer.
- **Maintained by Pears Research Services** -- Content updates and technical maintenance available at an agreed hourly rate, with a recommended monthly review cycle to ensure information remains current with NICE guidelines and UKRR data.

### 6.4 Value Proposition

Compared to existing solutions:
- YoDDA booklet development cost hundreds of thousands in research funding over multiple years
- Cognitant/Healthinote Kidney Essentials required institutional partnerships and significant ongoing licensing
- Commercial patient decision aid platforms typically cost GBP 50,000-200,000 for development

This tool delivers equivalent or superior functionality at a fraction of the cost, with no ongoing licensing fees, no per-patient charges, and no vendor lock-in.

---

## 7. Conclusion

The evidence is clear: UK kidney patients -- particularly those from ethnic minority backgrounds who bear the greatest disease burden -- are poorly served by current decision support resources. Static pamphlets and archived websites fail to meet the needs of a diverse, digitally-engaged patient population facing life-changing treatment decisions.

This interactive, multilingual decision aid directly addresses the gaps identified in the Kidney PREM, the "Falling through the GApp" report, and the NICE NG107 recommendations for shared decision-making tools. It does so at minimal cost, with no ongoing data protection obligations, and in full alignment with NHS digital transformation priorities.

The tool is ready for deployment and can begin improving patient outcomes immediately.

---

## References

1. Stacey D, et al. Decision aids for people facing health treatment or screening decisions. Cochrane Database of Systematic Reviews 2024; 1: CD001431.
2. Su JM, et al. Interactive decision aid on therapy decision making for patients with chronic kidney disease. Digital Health 2025; 11: 20552076251332832.
3. NICE. Renal replacement therapy and conservative management (NG107). 2018.
4. NICE. Shared decision making (NG197). 2021.
5. Kidney Care UK. Falling through the GApp. January 2026.
6. UK Kidney Association. Kidney Patient Reported Experience Measure (PREM). 2024.
7. Witteman HO, et al. Systematic Review and Meta-analysis of Values Clarification Methods. Med Decis Making 2021; 41(7): 798-814.
8. NHS England. Renal Digital Playbook. 2024.
9. Kidney Research UK. Time to Act on Kidney Health Inequalities. 2024.
10. NHS England. Accessible Information Standard -- Implementation Guidance. 2025.
11. Cognitant Group. Kidney Essentials: Chronic Kidney Disease Programme. 2022-2025.
12. BMC Nephrology. Development of an online patient decision aid for kidney failure treatment modality decisions. 2022.
13. Clinical Kidney Journal. Shared decision making for treatment of kidney failure. 2016.
14. NHS Confederation. Digital Transformation in the NHS: A Reference Guide. 2025.
15. Lord Darzi. Independent Investigation of the NHS in England. September 2024.

---

*Prepared by Pears Research Services. This document and the accompanying application are provided for evaluation purposes. The tool is fully functional and deployment-ready.*
