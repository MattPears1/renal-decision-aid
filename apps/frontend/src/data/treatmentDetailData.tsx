/**
 * Treatment Detail Data
 * Contains comprehensive information for each treatment option displayed on the TreatmentDetailPage.
 * This data includes simplified explanations, visual explainers, FAQs, and common questions.
 * @module data/treatmentDetailData
 */
import React from 'react';
import type { TreatmentType } from '@renal-decision-aid/shared-types';

/** Treatment data structure for each treatment option */
export interface TreatmentDetailData {
  id: TreatmentType;
  title: string;
  subtitle: string;
  description: string;
  /** Simple plain-language explanation for those new to kidney disease */
  inSimpleTerms: string;
  /** Visual explainer description for accessibility and understanding */
  visualExplainer: {
    iconDescription: string;
    simpleVisual: string;
  };
  /** Quick day-in-life summary */
  dayInLifeSummary: {
    morning: string;
    afternoon: string;
    evening: string;
    keyMessage: string;
  };
  tags: { icon: React.ReactNode; label: string }[];
  bgGradient: string;
  iconColor: string;
  icon: React.ReactNode;
  overview: string[];
  howItWorks: { title: string; content: string; simpleExplanation: string }[];
  benefits: { icon: React.ReactNode; title: string; explanation: string }[];
  considerations: string[];
  lifestyle: { icon: React.ReactNode; title: string; content: string }[];
  steps: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  /** Common questions patients ask - categorised */
  commonQuestions: { question: string; answer: string; category: 'practical' | 'medical' | 'lifestyle' | 'emotional' }[];
  patientStories: { quote: string; name: string; age: number; duration: string }[];
}

// Icon SVG components for reuse
const ClockIcon = <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const HeartIcon = <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>;
const ActivityIcon = <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
const HomeIcon = <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const UsersIcon = <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;

// Large benefit icons
const CheckCircleIcon = <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const ClockLgIcon = <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const CoffeeCupIcon = <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>;
const ActivityLgIcon = <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
const UsersLgIcon = <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const HomeLgIcon = <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const ShieldIcon = <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const CalendarIcon = <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const GridIcon = <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>;
const HeartLgIcon = <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;

// Lifestyle icons
const WorkIcon = <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const FoodIcon = <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>;
const TravelIcon = <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>;
const ExerciseIcon = <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;

// Treatment icons (large)
const TransplantIcon = (
  <svg className="w-28 h-28" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="4">
    <path d="M60 15C45 15 33 27 33 42C33 52.5 39 60 39 67.5C39 82.5 52.5 90 60 90C67.5 90 81 82.5 81 67.5C81 60 87 52.5 87 42C87 27 75 15 60 15Z" />
    <path d="M52.5 52.5C52.5 48 55.5 45 60 45C64.5 45 67.5 48 67.5 52.5C67.5 57 64.5 60 60 60C55.5 60 52.5 57 52.5 52.5Z" strokeWidth="3" />
    <line x1="60" y1="72" x2="60" y2="84" strokeWidth="3" strokeLinecap="round" />
    <line x1="54" y1="78" x2="66" y2="78" strokeWidth="3" strokeLinecap="round" />
    <path d="M60 27L63 24C66 21 70.5 21 72 24C73.5 27 73.5 30 70.5 33L60 42L49.5 33C46.5 30 46.5 27 48 24C49.5 21 54 21 57 24L60 27Z" fill="currentColor" />
  </svg>
);

const HemodialysisIcon = (
  <svg className="w-28 h-28" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="4">
    <rect x="30" y="20" width="60" height="80" rx="8" />
    <circle cx="60" cy="50" r="15" />
    <path d="M52 50c0-4.5 3.5-8 8-8s8 3.5 8 8-3.5 8-8 8-8-3.5-8-8" strokeWidth="3" />
    <line x1="60" y1="35" x2="60" y2="20" strokeWidth="3" />
    <line x1="60" y1="100" x2="60" y2="75" strokeWidth="3" />
    <circle cx="45" cy="85" r="4" fill="currentColor" />
    <circle cx="60" cy="85" r="4" fill="currentColor" />
    <circle cx="75" cy="85" r="4" fill="currentColor" />
    <path d="M20 45 Q10 60 20 75" strokeWidth="3" />
    <path d="M100 45 Q110 60 100 75" strokeWidth="3" />
  </svg>
);

const PeritonealIcon = (
  <svg className="w-28 h-28" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="4">
    <path d="M30 25 L90 25 L90 95 L30 95 Z" strokeWidth="3" rx="5" />
    <ellipse cx="60" cy="60" rx="20" ry="25" />
    <path d="M45 55 Q60 40 75 55" strokeWidth="2" />
    <path d="M45 65 Q60 80 75 65" strokeWidth="2" />
    <line x1="60" y1="95" x2="60" y2="110" strokeWidth="3" />
    <rect x="50" y="108" width="20" height="10" rx="2" fill="currentColor" />
    <circle cx="40" cy="30" r="3" fill="currentColor" />
    <circle cx="80" cy="30" r="3" fill="currentColor" />
  </svg>
);

const ConservativeIcon = (
  <svg className="w-28 h-28" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="4">
    <path d="M60 20 C35 20 20 45 20 65 C20 90 40 100 60 100 C80 100 100 90 100 65 C100 45 85 20 60 20Z" />
    <path d="M60 35 L60 50" strokeWidth="3" strokeLinecap="round" />
    <path d="M45 55 C45 45 75 45 75 55 C75 65 60 70 60 80" strokeWidth="3" strokeLinecap="round" />
    <circle cx="60" cy="88" r="3" fill="currentColor" />
    <path d="M35 40 Q25 55 35 70" strokeWidth="2" />
    <path d="M85 40 Q95 55 85 70" strokeWidth="2" />
    <circle cx="40" cy="80" r="5" fill="none" strokeWidth="2" />
    <circle cx="80" cy="80" r="5" fill="none" strokeWidth="2" />
  </svg>
);

/** Treatment data for all kidney treatment options */
export const TREATMENT_DETAIL_DATA: Record<TreatmentType, TreatmentDetailData> = {
  'kidney-transplant': {
    id: 'kidney-transplant',
    title: 'Kidney Transplant',
    subtitle: 'Receiving a healthy kidney from a donor can offer the best quality of life for many people with kidney failure.',
    description: 'A kidney transplant involves receiving a healthy kidney from either a living donor (such as a family member or friend) or a deceased donor.',
    inSimpleTerms: 'Think of it like getting a new kidney to replace ones that no longer work. Someone gives you one of their kidneys (people only need one to live well). After the operation, the new kidney does the cleaning job your old kidneys cannot do anymore. You take daily tablets to help your body accept the new kidney.',
    visualExplainer: {
      iconDescription: 'A kidney shape with a heart symbol, showing the gift of donation',
      simpleVisual: 'Picture: Your body with two tired kidneys. A new healthy kidney is placed in your lower tummy (not where the old ones are). The new kidney connects to your blood vessels and starts working within hours.',
    },
    dayInLifeSummary: {
      morning: 'Wake up, take your daily tablets with breakfast. Start your day like anyone else.',
      afternoon: 'Work, hobbies, exercise - your day is your own. No treatment appointments most days.',
      evening: 'Dinner with family, evening tablets. Normal bedtime routine.',
      keyMessage: 'After recovery, most days feel normal. The main difference is remembering to take your tablets.',
    },
    tags: [
      { icon: HeartIcon, label: 'Living or deceased donor' },
      { icon: ClockIcon, label: 'Major surgery' },
      { icon: ActivityIcon, label: 'Best long-term outcomes' },
    ],
    bgGradient: 'from-[#E6F4EA] to-[#f0f7f0]',
    iconColor: 'text-nhs-green',
    icon: TransplantIcon,
    overview: [
      'A kidney transplant is often considered the best treatment for kidney failure when suitable. A successful transplant can provide the best quality of life and longest survival for many people.',
      'You can receive a kidney from a living donor (such as a family member, friend, or altruistic stranger) or from someone who has died (deceased donor). Living donor transplants often work better and last longer.',
    ],
    howItWorks: [
      { title: 'Assessment', content: 'Your kidney team will assess whether you are suitable for a transplant. This involves blood tests, scans, and checking your overall health.', simpleExplanation: 'Doctors check if your body is ready for surgery. They do tests to make sure a transplant is safe for you.' },
      { title: 'Finding a donor', content: 'If you have a willing living donor, they will be assessed separately. Otherwise, you will be placed on the national waiting list for a deceased donor kidney.', simpleExplanation: 'You need someone to give you a kidney. This can be a family member, friend, or someone who has died and wanted to help others.' },
      { title: 'The operation', content: 'Transplant surgery takes 2-4 hours. The new kidney is placed in your lower abdomen and connected to your blood vessels and bladder. Your own kidneys are usually left in place.', simpleExplanation: 'The surgeon puts the new kidney in your lower tummy and connects it. Your old kidneys stay where they are - they do not need to be removed.' },
      { title: 'Recovery', content: 'Most people stay in hospital for 5-7 days after surgery. Full recovery takes 2-3 months. You will need to take immunosuppressant medications for life to prevent rejection.', simpleExplanation: 'You stay in hospital for about a week. Getting back to normal takes 2-3 months. You will take tablets every day to stop your body fighting the new kidney.' },
    ],
    benefits: [
      { icon: CheckCircleIcon, title: 'Best quality of life', explanation: 'Most people feel much better after a transplant. You can do more of the things you enjoy.' },
      { icon: ClockLgIcon, title: 'No dialysis sessions', explanation: 'No more spending hours connected to a machine. Your new kidney works around the clock.' },
      { icon: CoffeeCupIcon, title: 'Fewer diet restrictions', explanation: 'You can eat and drink more freely. Most foods are back on the menu.' },
      { icon: ActivityLgIcon, title: 'Better energy levels', explanation: 'Many people say they feel more awake and able to do things again.' },
    ],
    considerations: [
      'Requires major surgery with associated risks',
      'Need to take immunosuppressant medications for life',
      'May need to wait months or years for a suitable kidney',
      'Not suitable for everyone - your team will assess your suitability',
    ],
    lifestyle: [
      { icon: WorkIcon, title: 'Work & Activities', content: 'After 2-3 months recovery, most people return to normal activities including work, driving, and hobbies.' },
      { icon: FoodIcon, title: 'Diet', content: 'Fewer restrictions than dialysis. You can enjoy most foods and drinks, though a healthy balanced diet is recommended.' },
      { icon: TravelIcon, title: 'Travel', content: 'You can travel freely after recovery. Just remember to take your medications and have a plan for medical care if needed.' },
      { icon: ExerciseIcon, title: 'Exercise', content: 'Regular exercise is encouraged and beneficial. Most activities are possible, though contact sports should be avoided.' },
    ],
    steps: [
      { title: 'Referral', description: 'Your kidney team will refer you for transplant assessment when appropriate.' },
      { title: 'Assessment', description: 'Comprehensive tests to check your suitability for transplant surgery.' },
      { title: 'Waiting or planning', description: 'Either wait for a deceased donor kidney or prepare for living donor surgery.' },
      { title: 'Surgery', description: 'The transplant operation, followed by close monitoring in hospital.' },
      { title: 'Recovery', description: 'Gradual return to normal activities with regular clinic appointments.' },
    ],
    faqs: [
      { question: 'How long does a transplanted kidney last?', answer: 'On average, a kidney from a living donor lasts 15-20 years, and from a deceased donor about 10-15 years. Some kidneys last much longer. If your transplant fails, you can have dialysis or another transplant.' },
      { question: 'Can I still have a transplant if I am on dialysis?', answer: 'Yes. Many people receive a transplant while on dialysis. Being on dialysis does not prevent you from having a transplant.' },
      { question: 'What are the risks of surgery?', answer: 'Like any major surgery, there are risks including bleeding, infection, and blood clots. Your surgical team will discuss these with you in detail.' },
      { question: 'Will I feel the new kidney?', answer: 'No. The new kidney is placed in your lower abdomen and you cannot feel it working. Most people forget it is there.' },
    ],
    commonQuestions: [
      { question: 'Can someone in my family give me a kidney?', answer: 'Yes, if they are healthy and willing. They will have tests to check they are a good match. Even if blood types do not match, there are ways to make it work. Family members often make the best donors.', category: 'practical' },
      { question: 'How long will I wait for a kidney?', answer: 'If you have a living donor, a few months. For the waiting list, it depends on your blood type and other factors. Some people wait months, others years. Ask your team about your likely wait.', category: 'practical' },
      { question: 'What happens if my body rejects the kidney?', answer: 'Your tablets help prevent this. Doctors watch for signs of rejection with regular blood tests. If caught early, rejection can usually be treated with extra medicine.', category: 'medical' },
      { question: 'Can I have children after a transplant?', answer: 'Yes, but you need to plan with your doctors. Some tablets need changing before pregnancy. Many people with transplants have healthy families.', category: 'lifestyle' },
      { question: 'Will I need to take tablets forever?', answer: 'Yes, you will take tablets every day for life. Missing doses can harm your kidney. Most people get into a routine quickly. Set phone reminders if it helps.', category: 'practical' },
      { question: 'What if I am scared of the operation?', answer: 'This is completely normal. Talk to your team about your fears. Meeting others who have had transplants can help. The surgery is done by expert surgeons, and you will be asleep throughout.', category: 'emotional' },
      { question: 'Can I drink alcohol or eat anything I want?', answer: 'Most people can enjoy a normal diet and occasional alcohol after recovery. Some foods may need limiting. Your team will give you clear advice.', category: 'lifestyle' },
      { question: 'What if the transplant does not work?', answer: 'You can go back on dialysis and possibly have another transplant later. Not working is not common, but there are always options.', category: 'emotional' },
    ],
    patientStories: [
      { quote: 'Getting my transplant was life-changing. I went from spending three days a week at the hospital to living a normal life. I have been able to return to work and even ran a 5K last year!', name: 'Sarah', age: 45, duration: 'Transplant recipient for 3 years' },
      { quote: 'My brother donated a kidney to me. It was a big decision for both of us, but seeing how much better I feel now, we know it was the right choice. The bond between us is even stronger.', name: 'James', age: 52, duration: 'Transplant recipient for 5 years' },
    ],
  },
  'hemodialysis': {
    id: 'hemodialysis',
    title: 'Hospital Haemodialysis',
    subtitle: 'Dialysis at a hospital or dialysis centre, where a machine cleans your blood with professional support.',
    description: 'Haemodialysis uses a machine to filter your blood outside your body. This is usually done at a dialysis unit in hospital or a community centre.',
    inSimpleTerms: 'A machine cleans your blood for you at a hospital or clinic. It does the job your kidneys cannot do anymore. You visit three times a week, sit in a comfortable chair for 4-5 hours, and trained nurses look after you. The machine takes your blood, cleans it, and puts it back.',
    visualExplainer: {
      iconDescription: 'A dialysis machine with tubes connecting to an arm',
      simpleVisual: 'Picture: You sit in a reclining chair. Two needles connect your arm to the machine through soft tubes. Blood flows out, gets cleaned in the machine, and flows back. Nurses watch over you the whole time.',
    },
    dayInLifeSummary: {
      morning: 'On dialysis days: wake early, light breakfast, travel to the unit. Non-dialysis days: normal morning.',
      afternoon: 'Dialysis days: 4-5 hours at the unit (read, watch TV, rest). Other days: work or activities as usual.',
      evening: 'May feel tired after dialysis. Rest and have a light meal. Other evenings are normal.',
      keyMessage: 'Three days a week are dialysis days. The other four days you are free to do what you want.',
    },
    tags: [
      { icon: HomeIcon, label: 'Hospital or centre based' },
      { icon: ClockIcon, label: '3-4 times weekly' },
      { icon: UsersIcon, label: 'Professional care' },
    ],
    bgGradient: 'from-[#E6E6FA] to-[#f5f0ff]',
    iconColor: 'text-nhs-purple',
    icon: HemodialysisIcon,
    overview: [
      'Haemodialysis (HD) is the most common form of dialysis. A machine filters your blood, removing waste products and excess fluid that your kidneys can no longer remove.',
      'Most people have HD three times a week at a dialysis unit, with each session lasting about 4-5 hours. Some people choose to do HD at home (home haemodialysis).',
    ],
    howItWorks: [
      { title: 'Vascular access', content: 'Before starting HD, you will need a vascular access - a way for blood to flow to the dialysis machine. This is usually a fistula (a join between an artery and vein in your arm) created with minor surgery.', simpleExplanation: 'You need a special connection point in your arm for dialysis. A small operation creates this - it makes a vein bigger and stronger so needles can go in easily.' },
      { title: 'The dialysis session', content: 'During HD, your blood flows through tubes to a dialysis machine. The machine filters your blood through a special membrane, removing waste and extra water, then returns the cleaned blood to your body.', simpleExplanation: 'Your blood goes through tubes to the machine, gets cleaned (like a filter removing dirt from water), and comes back to you. The whole process is painless after the needles go in.' },
      { title: 'Treatment schedule', content: 'Most people have HD three times a week, for 4-5 hours each session. The exact schedule depends on your needs and local unit availability.', simpleExplanation: 'You come in Monday-Wednesday-Friday or Tuesday-Thursday-Saturday. Each visit is about half a day including travel. The other days are yours.' },
    ],
    benefits: [
      { icon: UsersLgIcon, title: 'Professional care', explanation: 'Nurses and doctors do everything for you. You do not need to learn any procedures or worry about getting it right.' },
      { icon: CheckCircleIcon, title: 'Effective treatment', explanation: 'Hospital machines are powerful and clean your blood thoroughly each time.' },
      { icon: UsersLgIcon, title: 'Social contact', explanation: 'You meet other patients and build friendships. Many people enjoy the social side of dialysis.' },
      { icon: GridIcon, title: 'No home setup', explanation: 'No equipment at home. No storage space needed. No training required.' },
    ],
    considerations: [
      'Regular hospital or centre visits (3 times weekly)',
      'Each session takes 4-5 hours plus travel time',
      'Dietary and fluid restrictions apply',
      'May feel tired after treatment',
    ],
    lifestyle: [
      { icon: WorkIcon, title: 'Work & Activities', content: 'Part-time work is possible for many. Evening or early morning sessions may help fit around work. Energy levels vary day to day.' },
      { icon: FoodIcon, title: 'Diet', content: 'You will need to limit fluids, potassium (found in bananas, potatoes), and phosphate. A dietitian will help you plan meals.' },
      { icon: TravelIcon, title: 'Travel', content: 'Holiday dialysis can be arranged but needs planning 6-8 weeks ahead. UK travel is easier than international.' },
      { icon: ExerciseIcon, title: 'Exercise', content: 'Light exercise is encouraged on non-dialysis days. Many people walk, swim, or do gentle activities.' },
    ],
    steps: [
      { title: 'Vascular access creation', description: 'A fistula or graft is created in your arm, ideally several months before starting.' },
      { title: 'Access maturation', description: 'Your fistula needs time (6-12 weeks) to develop and strengthen before use.' },
      { title: 'Starting dialysis', description: 'You will be assigned regular slots at a dialysis unit near you.' },
      { title: 'Ongoing treatment', description: 'Regular blood tests monitor how well dialysis is working for you.' },
    ],
    faqs: [
      { question: 'Does dialysis hurt?', answer: 'The needle insertions at the start of each session may cause brief discomfort, but most people get used to this. During dialysis, you should not feel pain.' },
      { question: 'What can I do during dialysis?', answer: 'You can read, watch TV, use a tablet, sleep, or chat with other patients. Many units have WiFi and entertainment options.' },
      { question: 'Can I drive after dialysis?', answer: 'Most people can drive after dialysis, but you may feel tired. Some people prefer to arrange transport, especially at first.' },
      { question: 'What if I miss a session?', answer: 'Missing sessions can be dangerous as waste and fluid build up. If you need to miss a session, contact your unit to arrange an alternative time.' },
    ],
    commonQuestions: [
      { question: 'What if I am scared of needles?', answer: 'Many people feel this way at first. The staff are very skilled and can use numbing cream. Most people say it gets easier after a few sessions. Let the nurses know - they understand.', category: 'emotional' },
      { question: 'Can I go on holiday?', answer: 'Yes, but you need to plan ahead. Holiday dialysis can be arranged at centres in the UK and abroad. Your unit helps with bookings. Book 6-8 weeks before you travel.', category: 'lifestyle' },
      { question: 'Will I still be able to work?', answer: 'Many people continue working. Ask about evening or early morning sessions to fit around your job. Some employers offer flexible hours for dialysis patients.', category: 'practical' },
      { question: 'What can I eat and drink?', answer: 'You will have some limits on fluids, salt, and certain foods like bananas and tomatoes. A dietitian will explain what works for you. Most people adapt well.', category: 'lifestyle' },
      { question: 'How will I get to the unit?', answer: 'Some people drive themselves, others get lifts. Hospital transport is available for those who need it. Ask your team about options in your area.', category: 'practical' },
      { question: 'What if the machine breaks?', answer: 'Units have backup machines. Staff are trained to handle any problems. You are never at risk - there are always solutions.', category: 'medical' },
      { question: 'Will I feel normal between sessions?', answer: 'Most people feel best 1-2 days after dialysis. Some feel tired right after. Everyone is different. Over time, you learn your own pattern.', category: 'medical' },
      { question: 'Can I still see friends and family?', answer: 'Absolutely. On non-dialysis days, you are free to do whatever you want. Many people have full social lives around their treatment schedule.', category: 'lifestyle' },
    ],
    patientStories: [
      { quote: 'At first, I found the hospital visits tiring, but the nurses became like family. I use the time to read and catch up on TV shows. It is now just part of my routine.', name: 'David', age: 68, duration: 'On HD for 4 years' },
      { quote: 'The staff at my dialysis unit are wonderful. They take care of everything, and I know I am in good hands. It gives my family peace of mind too.', name: 'Priya', age: 55, duration: 'On HD for 2 years' },
    ],
  },
  'peritoneal-dialysis': {
    id: 'peritoneal-dialysis',
    title: 'Peritoneal Dialysis (PD)',
    subtitle: 'A home-based treatment that uses the natural lining of your tummy to clean your blood.',
    description: 'Peritoneal dialysis uses the lining of your abdomen (peritoneum) as a natural filter to clean your blood at home.',
    inSimpleTerms: 'You clean your blood at home using your own body. A thin tube in your tummy lets special fluid flow in. The fluid soaks up waste from your blood, then you drain it away. You can do this during the day or at night while you sleep.',
    visualExplainer: {
      iconDescription: 'A house with a tube connecting to a bag of fluid',
      simpleVisual: 'Picture: A soft tube (about as thick as a pencil) goes into your tummy through a small hole. You connect a bag of clean fluid, let it flow in, wait while it works, then drain it into another bag. It is like rinsing out a dirty sponge - the fluid picks up the waste.',
    },
    dayInLifeSummary: {
      morning: 'If using overnight machine (APD): disconnect, have breakfast, start your day. If doing manual (CAPD): do your first exchange.',
      afternoon: 'Days are mostly free for work, activities, grandchildren. CAPD users do 1-2 exchanges during the day (30 mins each).',
      evening: 'APD users set up the machine before bed. CAPD users do their last exchange. Otherwise, a normal evening.',
      keyMessage: 'APD means treatment happens while you sleep. CAPD fits into your day in short breaks. Either way, you are in control.',
    },
    tags: [
      { icon: HomeIcon, label: 'Home-based' },
      { icon: ClockIcon, label: 'Daily treatment' },
      { icon: ActivityIcon, label: 'More independence' },
    ],
    bgGradient: 'from-[#E6F7F0] to-[#f0faf5]',
    iconColor: 'text-nhs-blue',
    icon: PeritonealIcon,
    overview: [
      'Peritoneal dialysis (PD) is a home-based treatment that uses your body\'s natural peritoneum (the lining of your tummy) as a filter to clean your blood.',
      'There are two main types: APD (automated) where a machine does exchanges overnight while you sleep, and CAPD (manual) where you do exchanges yourself during the day.',
    ],
    howItWorks: [
      { title: 'The PD Catheter', content: 'Before starting PD, you will have a small operation to place a thin, flexible tube (catheter) into your tummy. This is usually done under local anaesthetic and takes about an hour. The catheter stays in place permanently.', simpleExplanation: 'A doctor puts a soft tube in your tummy through a small cut. You are awake but the area is numbed. The tube stays there and becomes part of your daily routine.' },
      { title: 'The Exchange Process', content: 'During PD, you fill your tummy with dialysis fluid through the catheter. The fluid stays inside for several hours while waste and water pass from your blood into the fluid. You then drain out the used fluid and replace it with fresh fluid.', simpleExplanation: 'Clean fluid goes in, sits in your tummy for a few hours soaking up waste, then comes out. Like soaking a dirty cloth, wringing it out, and repeating with fresh water.' },
      { title: 'APD (Automated PD)', content: 'APD uses a machine (cycler) to do exchanges automatically while you sleep. You connect at bedtime and the machine does several exchanges overnight. Days are free for normal activities.', simpleExplanation: 'A bedside machine does everything while you sleep. Connect at night, wake up done. Your days are completely free.' },
      { title: 'CAPD (Manual PD)', content: 'CAPD does not use a machine. You do exchanges yourself about 4 times during the day. Each exchange takes about 30 minutes. The fluid stays in between exchanges.', simpleExplanation: 'You do it yourself 3-4 times a day. Each time takes about 30 minutes. You can do it at home, at work, or anywhere clean.' },
    ],
    benefits: [
      { icon: HomeLgIcon, title: 'Treatment at home', explanation: 'No hospital visits for dialysis. You are in charge of your own treatment in your own space.' },
      { icon: ClockLgIcon, title: 'Flexible schedule', explanation: 'You choose when to do exchanges. Fit treatment around your life, not the other way around.' },
      { icon: ShieldIcon, title: 'No needles', explanation: 'Unlike haemodialysis, there are no needles with PD. Good news if needles worry you.' },
      { icon: CalendarIcon, title: 'Easier to travel', explanation: 'Supplies can be sent to your holiday destination. Much easier than arranging hospital dialysis abroad.' },
    ],
    considerations: [
      'Daily treatment commitment required',
      'Need a permanent tube (catheter) in your tummy',
      'Risk of infection if hygiene is not maintained',
      'Requires storage space for supplies at home',
    ],
    lifestyle: [
      { icon: WorkIcon, title: 'Work & Activities', content: 'APD users have completely free days. CAPD exchanges can fit around work schedules. Many people work full-time on PD.' },
      { icon: FoodIcon, title: 'Diet', content: 'Generally fewer restrictions than haemodialysis. More flexibility with fluids and potassium, though balanced eating is still important.' },
      { icon: TravelIcon, title: 'Travel', content: 'Supplies can be delivered to your holiday destination. You can travel widely with proper planning.' },
      { icon: ExerciseIcon, title: 'Exercise', content: 'Most activities are possible. The catheter is secure during exercise. Swimming is usually avoided.' },
    ],
    steps: [
      { title: 'Training', description: 'You will receive 1-2 weeks of training from specialist PD nurses at the hospital.' },
      { title: 'Catheter insertion', description: 'A small operation places the PD catheter in your tummy.' },
      { title: 'Healing period', description: 'Your catheter needs about 2 weeks to heal before regular use.' },
      { title: 'Starting at home', description: 'Begin PD at home with regular support from your PD nurses.' },
    ],
    faqs: [
      { question: 'Is PD painful?', answer: 'PD is generally not painful. You may feel a sense of fullness when fluid is in your tummy, but this usually becomes less noticeable over time.' },
      { question: 'Can I swim with a PD catheter?', answer: 'Showering is fine once your exit site is healed. Swimming is generally not recommended due to infection risk, though some people use waterproof dressings.' },
      { question: 'What if there is a power cut during APD?', answer: 'APD machines have battery backup for short power cuts. For longer outages, you can manually drain the fluid. Your training will cover emergency procedures.' },
      { question: 'How long can I stay on PD?', answer: 'Many people stay on PD for several years. Over time, the peritoneum may become less effective, and some people need to switch to haemodialysis.' },
    ],
    commonQuestions: [
      { question: 'Will I be able to do this myself?', answer: 'Yes! The training is very thorough - usually 1-2 weeks. You practice until you feel confident. Nurses are available 24/7 by phone if you have questions. Most people manage well.', category: 'practical' },
      { question: 'Where do I store all the supplies?', answer: 'You need about the space of a small wardrobe. Supplies are delivered monthly. Some people use a spare room, others use part of a bedroom or cupboard.', category: 'practical' },
      { question: 'What if I get an infection?', answer: 'If you follow the clean technique you are taught, infections are not common. If one happens, it is usually treated with antibiotics added to your dialysis fluid. Your team will help.', category: 'medical' },
      { question: 'Can I have a bath or shower?', answer: 'Showering is fine - you cover the tube exit with a waterproof dressing. Baths are not usually recommended because of infection risk.', category: 'lifestyle' },
      { question: 'Will people notice the tube?', answer: 'The tube is hidden under your clothes. Most people cannot tell you have it. Some people feel self-conscious at first, but this usually passes.', category: 'emotional' },
      { question: 'Can my partner or family help?', answer: 'Yes, family members can be trained alongside you. Having a backup person is helpful, especially at first or if you are unwell.', category: 'practical' },
      { question: 'What about intimacy with a partner?', answer: 'PD does not prevent intimacy. The tube can be secured out of the way. Talk to your PD nurse if you have concerns - they can advise.', category: 'lifestyle' },
      { question: 'Will I gain weight from the fluid?', answer: 'The fluid adds some weight while it is in your tummy. Some people do notice weight changes. Your team will monitor this and adjust your treatment if needed.', category: 'medical' },
    ],
    patientStories: [
      { quote: 'I was nervous about doing dialysis myself, but the training was excellent. Now I do APD every night while I sleep. I can still look after my grandchildren during the day and have even been on holiday to Spain.', name: 'Margaret', age: 72, duration: 'On APD for 3 years' },
      { quote: 'PD gives me the freedom to maintain my daily prayers and routines. My wife was trained alongside me, so she can help when needed. It took some adjustment, but I am glad I chose this option.', name: 'Raj', age: 65, duration: 'On CAPD for 2 years' },
    ],
  },
  'conservative-care': {
    id: 'conservative-care',
    title: 'Conservative Management',
    subtitle: 'Medical care focused on quality of life and comfort without dialysis or transplant.',
    description: 'Conservative management focuses on maintaining quality of life and managing symptoms without dialysis or transplant.',
    inSimpleTerms: 'This is active care without dialysis. Your doctors and nurses help you feel as well as possible using medicines and support. You stay comfortable at home without the time demands of dialysis. This is a valid choice, especially for people who are older or have other health problems.',
    visualExplainer: {
      iconDescription: 'A heart symbol surrounded by supporting hands',
      simpleVisual: 'Picture: You at home, supported by your kidney team, GP, and family. Regular check-ups but no dialysis machines or hospital stays. Focus on what matters most to you - comfort, family time, and quality of life.',
    },
    dayInLifeSummary: {
      morning: 'Wake when you feel ready. Take your symptom medicines with breakfast. No rush.',
      afternoon: 'Do what you enjoy and feel able to do. Rest when you need to. No treatment appointments to worry about.',
      evening: 'Time with family. Evening medicines. Go to bed when you are tired.',
      keyMessage: 'Your days are your own. Focus is on comfort and doing what matters to you, with support from your care team.',
    },
    tags: [
      { icon: HeartIcon, label: 'Quality of life focus' },
      { icon: HomeIcon, label: 'Home-based care' },
      { icon: UsersIcon, label: 'Full support team' },
    ],
    bgGradient: 'from-[#FFF8E6] to-[#fffef5]',
    iconColor: 'text-nhs-orange',
    icon: ConservativeIcon,
    overview: [
      'Conservative management is an active treatment choice that focuses on maintaining quality of life and managing symptoms without dialysis or transplant.',
      'This option may be particularly suitable for people who are older, have other serious health conditions, or for whom the burdens of dialysis might outweigh the benefits. It involves careful symptom management and full support from your kidney care team.',
    ],
    howItWorks: [
      { title: 'Active medical management', content: 'You will continue to have regular appointments with your kidney team. Medications will be used to manage symptoms and slow kidney decline where possible.', simpleExplanation: 'You still see your kidney doctors regularly. They give you medicines to help you feel better and slow down how fast your kidneys are getting worse.' },
      { title: 'Symptom control', content: 'The focus is on keeping you comfortable. This includes managing symptoms like tiredness, nausea, itching, and breathlessness with medications and lifestyle adjustments.', simpleExplanation: 'If you feel tired, sick, or itchy, there are medicines and tips to help. The goal is to keep you comfortable day to day.' },
      { title: 'Supportive care', content: 'You will have access to dietitians, social workers, and other specialists. Palliative care teams may also be involved to help with symptom management and planning.', simpleExplanation: 'A whole team supports you - not just kidney doctors. This includes people who help with food, feelings, and planning for the future.' },
      { title: 'Advance care planning', content: 'Your team will help you think about and document your wishes for future care. This ensures your preferences are known and respected.', simpleExplanation: 'You talk about what matters to you and write down your wishes. This makes sure everyone knows what you want if you cannot tell them later.' },
    ],
    benefits: [
      { icon: HeartLgIcon, title: 'Focus on quality of life', explanation: 'The aim is to help you live as well as possible, not just as long as possible. Your comfort matters most.' },
      { icon: HomeLgIcon, title: 'No dialysis sessions', explanation: 'No hours spent at hospital or connected to machines. Your time is your own.' },
      { icon: ClockLgIcon, title: 'More time at home', explanation: 'Stay in your own home, in familiar surroundings, with the people you love.' },
      { icon: UsersLgIcon, title: 'Time with loved ones', explanation: 'Focus on the people and things that matter most to you.' },
    ],
    considerations: [
      'Kidney function will continue to decline over time',
      'Symptoms will need ongoing management',
      'Life expectancy may be shorter than with dialysis',
      'Important to have honest conversations about expectations',
    ],
    lifestyle: [
      { icon: WorkIcon, title: 'Daily Life', content: 'No dialysis schedule to work around. Your days can be spent doing what matters most to you.' },
      { icon: FoodIcon, title: 'Diet', content: 'Dietary guidance to manage symptoms. Eating is about comfort and enjoyment as much as nutrition.' },
      { icon: TravelIcon, title: 'Activities', content: 'Do what you enjoy and feel able to do. Rest when needed. Focus on quality time.' },
      { icon: ExerciseIcon, title: 'Energy', content: 'Energy levels will vary. Gentle activity is encouraged when you feel able. Rest is also important.' },
    ],
    steps: [
      { title: 'Discussion', description: 'Have open conversations with your kidney team about whether this approach suits your situation.' },
      { title: 'Care planning', description: 'Work with your team to create a care plan focused on your comfort and quality of life.' },
      { title: 'Ongoing support', description: 'Regular reviews and access to the kidney team, palliative care, and other specialists as needed.' },
      { title: 'Advance planning', description: 'Document your wishes for future care and share them with your family and medical team.' },
    ],
    faqs: [
      { question: 'Does choosing conservative care mean giving up?', answer: 'No. Conservative care is an active treatment choice that focuses on quality of life. You will still receive medical care and support - just without dialysis.' },
      { question: 'How long can I live with conservative care?', answer: 'This varies greatly depending on individual circumstances. Your kidney team can give you an idea based on your health, but no one can predict exactly.' },
      { question: 'Can I change my mind later?', answer: 'In most cases, yes. If your circumstances change, you can discuss starting dialysis with your team. However, this may not always be possible as health changes.' },
      { question: 'Will I be in pain?', answer: 'The aim of conservative care is to keep you comfortable. Symptoms will be managed actively, and palliative care teams can help with pain control if needed.' },
    ],
    commonQuestions: [
      { question: 'Is this the same as giving up?', answer: 'Not at all. This is an active choice to focus on quality of life. You will still receive excellent medical care. It is about choosing what matters most to you.', category: 'emotional' },
      { question: 'Will my family think I am giving up?', answer: 'It can help to have honest conversations with them. Your team can support these talks. Most families understand once they know it is an active, supported choice.', category: 'emotional' },
      { question: 'How will I know when things are getting worse?', answer: 'Your team will keep an eye on you and explain what to expect. You can always ask questions. Changes usually happen gradually, and you will have support throughout.', category: 'medical' },
      { question: 'Will I end up in hospital?', answer: 'The aim is to keep you comfortable at home as much as possible. Some people do need short hospital stays sometimes, but the focus is on home-based care.', category: 'practical' },
      { question: 'Who will look after me?', answer: 'Your kidney team, GP, and possibly palliative care nurses will all be involved. Family and carers also play an important role. You will not be left alone.', category: 'practical' },
      { question: 'What if I change my mind and want dialysis?', answer: 'You can discuss this with your team at any time. If dialysis is still possible for you, you can start. It is your choice.', category: 'medical' },
      { question: 'Can I still do things I enjoy?', answer: 'Yes, within what you feel able to do. Many people continue with hobbies, seeing friends, and enjoying time with family. The focus is on living well.', category: 'lifestyle' },
      { question: 'How do I talk to my family about this?', answer: 'Your team can help with these conversations. Some people find it helpful to have a family meeting with a doctor or nurse present. Honest conversations bring families closer.', category: 'emotional' },
    ],
    patientStories: [
      { quote: 'At 85, I decided dialysis was not for me. My kidney team have been wonderful - managing my symptoms and helping me stay comfortable at home. I have been able to spend quality time with my grandchildren.', name: 'Dorothy', age: 85, duration: 'On conservative care for 18 months' },
      { quote: 'After discussing all the options with my doctor and family, conservative care felt right for my situation. The support I receive is excellent, and I am able to focus on what matters most to me.', name: 'Harold', age: 78, duration: 'On conservative care for 1 year' },
    ],
  },
};

export default TREATMENT_DETAIL_DATA;
