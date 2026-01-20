import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/context/SessionContext';
import type { TreatmentType } from '@renal-decision-aid/shared-types';

interface TreatmentData {
  id: TreatmentType;
  title: string;
  subtitle: string;
  description: string;
  tags: { icon: React.ReactNode; label: string }[];
  bgGradient: string;
  iconColor: string;
  icon: React.ReactNode;
  overview: string[];
  howItWorks: { title: string; content: string }[];
  benefits: { icon: React.ReactNode; title: string }[];
  considerations: string[];
  lifestyle: { icon: React.ReactNode; title: string; content: string }[];
  steps: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  patientStories: { quote: string; name: string; age: number; duration: string }[];
}

const TREATMENT_DATA: Record<TreatmentType, TreatmentData> = {
  'kidney-transplant': {
    id: 'kidney-transplant',
    title: 'Kidney Transplant',
    subtitle: 'Receiving a healthy kidney from a donor can offer the best quality of life for many people with kidney failure.',
    description: 'A kidney transplant involves receiving a healthy kidney from either a living donor (such as a family member or friend) or a deceased donor.',
    tags: [
      { icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>, label: 'Living or deceased donor' },
      { icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: 'Major surgery' },
      { icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>, label: 'Best long-term outcomes' },
    ],
    bgGradient: 'from-[#E6F4EA] to-[#f0f7f0]',
    iconColor: 'text-nhs-green',
    icon: (
      <svg className="w-28 h-28" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="4">
        <path d="M60 15C45 15 33 27 33 42C33 52.5 39 60 39 67.5C39 82.5 52.5 90 60 90C67.5 90 81 82.5 81 67.5C81 60 87 52.5 87 42C87 27 75 15 60 15Z" />
        <path d="M52.5 52.5C52.5 48 55.5 45 60 45C64.5 45 67.5 48 67.5 52.5C67.5 57 64.5 60 60 60C55.5 60 52.5 57 52.5 52.5Z" strokeWidth="3" />
        <line x1="60" y1="72" x2="60" y2="84" strokeWidth="3" strokeLinecap="round" />
        <line x1="54" y1="78" x2="66" y2="78" strokeWidth="3" strokeLinecap="round" />
        <path d="M60 27L63 24C66 21 70.5 21 72 24C73.5 27 73.5 30 70.5 33L60 42L49.5 33C46.5 30 46.5 27 48 24C49.5 21 54 21 57 24L60 27Z" fill="currentColor" />
      </svg>
    ),
    overview: [
      'A kidney transplant is often considered the best treatment for kidney failure when suitable. A successful transplant can provide the best quality of life and longest survival for many people.',
      'You can receive a kidney from a living donor (such as a family member, friend, or altruistic stranger) or from someone who has died (deceased donor). Living donor transplants often work better and last longer.',
    ],
    howItWorks: [
      { title: 'Assessment', content: 'Your kidney team will assess whether you are suitable for a transplant. This involves blood tests, scans, and checking your overall health.' },
      { title: 'Finding a donor', content: 'If you have a willing living donor, they will be assessed separately. Otherwise, you will be placed on the national waiting list for a deceased donor kidney.' },
      { title: 'The operation', content: 'Transplant surgery takes 2-4 hours. The new kidney is placed in your lower abdomen and connected to your blood vessels and bladder. Your own kidneys are usually left in place.' },
      { title: 'Recovery', content: 'Most people stay in hospital for 5-7 days after surgery. Full recovery takes 2-3 months. You will need to take immunosuppressant medications for life to prevent rejection.' },
    ],
    benefits: [
      { icon: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, title: 'Best quality of life' },
      { icon: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title: 'No dialysis sessions' },
      { icon: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>, title: 'Fewer diet restrictions' },
      { icon: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>, title: 'Better energy levels' },
    ],
    considerations: [
      'Requires major surgery with associated risks',
      'Need to take immunosuppressant medications for life',
      'May need to wait years for a suitable kidney from the waiting list',
      'Not suitable for everyone - depends on overall health',
      'Risk of rejection - the new kidney may stop working over time',
      'Increased risk of infections due to immunosuppression',
    ],
    lifestyle: [
      { icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, title: 'Travel', content: 'After recovery, most transplant patients can travel freely. You will need to plan ahead for medication supplies and know where to seek medical care if needed.' },
      { icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>, title: 'Work', content: 'Most people can return to work 2-3 months after surgery. Many transplant recipients work full time and lead active careers.' },
      { icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>, title: 'Diet', content: 'Dietary restrictions are usually much less strict after a successful transplant. Your dietitian will advise you, but most people can enjoy a normal, healthy diet.' },
    ],
    steps: [
      { title: 'Referral and assessment', description: 'Your kidney team will refer you for transplant assessment. This involves tests to check you are well enough for surgery.' },
      { title: 'Finding a donor', description: 'Explore living donation options with family and friends. If no living donor is available, you will be placed on the national waiting list.' },
      { title: 'Preparation', description: 'Stay as healthy as possible. Attend all clinic appointments and keep your vaccinations up to date.' },
      { title: 'The transplant', description: 'When a suitable kidney becomes available, you will be called to hospital for the operation.' },
      { title: 'Recovery and follow-up', description: 'After surgery, you will have regular clinic visits to monitor your new kidney and adjust medications.' },
    ],
    faqs: [
      { question: 'How long does a transplanted kidney last?', answer: 'On average, a kidney from a living donor lasts 15-20 years, and from a deceased donor about 10-15 years. Some kidneys last much longer. If your transplant fails, you can have dialysis or another transplant.' },
      { question: 'Can I still have a transplant if I am on dialysis?', answer: 'Yes. Many people receive a transplant while on dialysis. Being on dialysis does not prevent you from having a transplant.' },
      { question: 'What are the risks of surgery?', answer: 'Like any major surgery, there are risks including bleeding, infection, and blood clots. Your surgical team will discuss these with you in detail.' },
      { question: 'Will I feel the new kidney?', answer: 'No. The new kidney is placed in your lower abdomen and you cannot feel it working. Most people forget it is there.' },
    ],
    patientStories: [
      { quote: 'Getting my transplant was life-changing. I went from spending hours on dialysis to being able to work full-time and travel. The surgery was a big step, but it was absolutely worth it.', name: 'James', age: 45, duration: '5 years post-transplant' },
      { quote: 'My husband donated his kidney to me. It brought us even closer together. I am so grateful for his gift and for every day I have with my family.', name: 'Sarah', age: 52, duration: '3 years post-transplant' },
    ],
  },
  'hemodialysis': {
    id: 'hemodialysis',
    title: 'Hospital Haemodialysis',
    subtitle: 'Dialysis at a hospital or dialysis centre, where a machine cleans your blood with professional support.',
    description: 'Haemodialysis uses a machine to filter your blood outside your body. This is usually done at a dialysis unit in hospital or a community centre.',
    tags: [
      { icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>, label: 'Hospital or centre' },
      { icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: '3-4 times weekly' },
      { icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label: 'Professional care' },
    ],
    bgGradient: 'from-[#FFF7E6] to-[#fff9f0]',
    iconColor: 'text-nhs-orange',
    icon: (
      <svg className="w-28 h-28" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="4">
        <rect x="30" y="22" width="60" height="75" rx="6" />
        <rect x="39" y="33" width="42" height="18" rx="3" strokeWidth="3" />
        <circle cx="48" cy="67" r="6" strokeWidth="3" />
        <circle cx="72" cy="67" r="6" strokeWidth="3" />
        <line x1="48" y1="78" x2="48" y2="87" strokeWidth="3" strokeLinecap="round" />
        <line x1="72" y1="78" x2="72" y2="87" strokeWidth="3" strokeLinecap="round" />
        <line x1="60" y1="37" x2="60" y2="46" strokeWidth="3" strokeLinecap="round" />
        <line x1="55" y1="42" x2="65" y2="42" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    overview: [
      'Hospital haemodialysis (HD) is a treatment that uses a machine to filter waste products and excess fluid from your blood when your kidneys can no longer do this effectively.',
      'Treatment is typically provided at a hospital dialysis unit or satellite centre, with trained nurses and healthcare assistants looking after you during each session.',
    ],
    howItWorks: [
      { title: 'Vascular access', content: 'Before starting HD, you will need a vascular access - a way for blood to flow to the dialysis machine. This is usually a fistula (a join between an artery and vein in your arm) created with minor surgery.' },
      { title: 'The dialysis session', content: 'During HD, your blood flows through tubes to a dialysis machine. The machine filters your blood through a special membrane, removing waste and extra water, then returns the cleaned blood to your body.' },
      { title: 'Treatment schedule', content: 'Most people have HD three times a week, for 4-5 hours each session. The exact schedule depends on your needs and local unit availability.' },
    ],
    benefits: [
      { icon: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>, title: 'Professional care' },
      { icon: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, title: 'Effective treatment' },
      { icon: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, title: 'Social contact' },
      { icon: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>, title: 'No home setup' },
    ],
    considerations: [
      'Requires regular hospital or centre visits 3 times per week',
      'Each session lasts 4-5 hours plus travel time',
      'May feel tired or washed out after treatment',
      'Dietary and fluid restrictions are important',
      'Need vascular access surgery (fistula or line)',
      'Less flexibility in scheduling compared to home treatments',
    ],
    lifestyle: [
      { icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, title: 'Travel', content: 'Holiday dialysis can be arranged at other centres, but requires advance planning. The dialysis team can help you arrange treatment at your destination.' },
      { icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>, title: 'Work', content: 'Many people on HD continue to work. Evening or early morning dialysis sessions may be available to fit around your work schedule.' },
      { icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>, title: 'Diet', content: 'You will need to follow dietary advice to limit salt, potassium, phosphate, and fluids. A renal dietitian will help you plan meals that work for you.' },
    ],
    steps: [
      { title: 'Referral', description: 'Your kidney team will refer you when your kidneys can no longer cope and you need dialysis.' },
      { title: 'Access surgery', description: 'A fistula or graft will be created in your arm to provide access for dialysis. This needs time to mature before use.' },
      { title: 'Training', description: 'You will be shown what to expect during dialysis sessions and how to care for your access.' },
      { title: 'Starting treatment', description: 'Begin your regular dialysis sessions at the hospital or satellite unit.' },
      { title: 'Ongoing care', description: 'Regular blood tests and clinic reviews to ensure your dialysis is working well.' },
    ],
    faqs: [
      { question: 'Does dialysis hurt?', answer: 'The needle insertions at the start of each session may cause brief discomfort, but most people get used to this. During dialysis, you should not feel pain.' },
      { question: 'What can I do during dialysis?', answer: 'You can read, watch TV, use a tablet, sleep, or chat with other patients. Many units have WiFi and entertainment options.' },
      { question: 'Can I drive after dialysis?', answer: 'Most people can drive after dialysis, but you may feel tired. Some people prefer to arrange transport, especially at first.' },
      { question: 'What if I miss a session?', answer: 'Missing sessions can be dangerous as waste and fluid build up. If you need to miss a session, contact your unit to arrange an alternative time.' },
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
    tags: [
      { icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, label: 'Home-based' },
      { icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>, label: 'Overnight or daytime' },
      { icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: 'Daily treatment' },
    ],
    bgGradient: 'from-[#E6F0FA] to-[#f0f5ff]',
    iconColor: 'text-nhs-blue',
    icon: (
      <svg className="w-28 h-28" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="4">
        <path d="M20 55L60 20L100 55" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M28 50V95H92V50" />
        <path d="M68 65C68 75 60 83 50 83C55 80 58 74 58 68C58 58 50 50 40 50C45 46 50 44 56 44C64 44 68 54 68 65Z" strokeWidth="3" />
        <rect x="72" y="58" width="12" height="22" rx="3" strokeWidth="3" />
        <line x1="78" y1="80" x2="78" y2="88" strokeWidth="3" strokeLinecap="round" />
        <circle cx="78" cy="92" r="3" strokeWidth="2" />
      </svg>
    ),
    overview: [
      'Peritoneal dialysis is a treatment for kidney failure that you can do at home. It uses the lining of your tummy (called the peritoneum) as a natural filter to clean your blood.',
      'A soft tube called a catheter is placed in your tummy, and you use this to put a special fluid in and out. The fluid collects waste products and extra water from your blood, which you then drain away.',
    ],
    howItWorks: [
      { title: 'The PD Catheter', content: 'Before starting PD, you will have a small operation to place a thin, flexible tube (catheter) into your tummy. This is usually done under local anaesthetic and takes about an hour. The catheter stays in place permanently.' },
      { title: 'The Exchange Process', content: 'During PD, you fill your tummy with dialysis fluid through the catheter. The fluid stays inside for several hours while waste and water pass from your blood into the fluid. You then drain out the used fluid and replace it with fresh fluid.' },
      { title: 'APD (Automated PD)', content: 'APD uses a machine (cycler) to do exchanges automatically while you sleep. You connect at bedtime and the machine does several exchanges overnight. Days are free for normal activities.' },
      { title: 'CAPD (Manual PD)', content: 'CAPD does not use a machine. You do exchanges yourself about 4 times during the day. Each exchange takes about 30 minutes. The fluid stays in between exchanges.' },
    ],
    benefits: [
      { icon: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, title: 'Treatment at home' },
      { icon: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title: 'Flexible schedule' },
      { icon: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title: 'No needles' },
      { icon: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, title: 'Easier to travel' },
    ],
    considerations: [
      'Daily treatment is required, even on weekends and holidays',
      'Need space at home for supplies (delivered monthly)',
      'Keeping everything sterile is essential to prevent infection',
      'Risk of peritonitis (infection) if technique is not maintained',
      'May not be suitable for certain abdominal conditions',
      'Some people find the responsibility of self-care challenging at first',
    ],
    lifestyle: [
      { icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, title: 'Travel', content: 'PD allows more freedom to travel than hospital dialysis. Supplies can be delivered to your destination, or you can take supplies with you. Many people on PD travel for holidays and even go abroad.' },
      { icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>, title: 'Work', content: 'Most people on PD can continue working. APD is particularly good for working people because treatment happens overnight, leaving days free for work and activities.' },
      { icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>, title: 'Diet', content: 'PD patients often have fewer dietary restrictions than those on haemodialysis. However, you will still need to follow guidance on salt, potassium, phosphate, and fluids.' },
    ],
    steps: [
      { title: 'Assessment', description: 'Your kidney team will assess whether PD is medically suitable for you, examining your tummy and asking about previous surgeries.' },
      { title: 'Catheter surgery', description: 'A small operation to place the catheter in your tummy. You will need 2-4 weeks for healing before starting dialysis.' },
      { title: 'Training', description: 'Training usually takes 1-2 weeks and covers how to do exchanges, keep everything clean, and recognise problems.' },
      { title: 'Home setup', description: 'Supplies will be delivered to your home. You will need storage space about the size of a small wardrobe.' },
      { title: 'Ongoing support', description: 'Regular clinic visits (usually monthly) and 24/7 phone support. Your PD nurses are always available if you have questions.' },
    ],
    faqs: [
      { question: 'Is PD painful?', answer: 'PD is generally not painful. You may feel a sense of fullness when fluid is in your tummy, but this usually becomes less noticeable over time.' },
      { question: 'Can I swim with a PD catheter?', answer: 'Showering is fine once your exit site is healed. Swimming is generally not recommended due to infection risk, though some people use waterproof dressings.' },
      { question: 'What if there is a power cut during APD?', answer: 'APD machines have battery backup for short power cuts. For longer outages, you can manually drain the fluid. Your training will cover emergency procedures.' },
      { question: 'How long can I stay on PD?', answer: 'Many people stay on PD for several years. Over time, the peritoneum may become less effective, and some people need to switch to haemodialysis.' },
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
    tags: [
      { icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>, label: 'Focus on comfort' },
      { icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label: 'Supportive care' },
      { icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, label: 'No hospital visits' },
    ],
    bgGradient: 'from-[#F3E8FF] to-[#f8f0ff]',
    iconColor: 'text-nhs-purple',
    icon: (
      <svg className="w-28 h-28" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="4">
        <path d="M60 82.5L37.5 63C30 56 30 45 37.5 39C45 33 54 36 60 42C66 36 75 33 82.5 39C90 45 90 56 82.5 63L60 82.5Z" />
        <path d="M30 90C30 82.5 37.5 78 45 78H52.5" strokeWidth="3" strokeLinecap="round" />
        <path d="M90 90C90 82.5 82.5 78 75 78H67.5" strokeWidth="3" strokeLinecap="round" />
        <circle cx="60" cy="60" r="7.5" strokeWidth="3" />
      </svg>
    ),
    overview: [
      'Conservative management (also called supportive care or conservative kidney management) is an active treatment approach that focuses on quality of life without dialysis or transplant.',
      'This option may be right for some people, particularly those who are elderly, frail, or have other serious health conditions. It involves careful symptom management, medications, and support from the kidney care team.',
    ],
    howItWorks: [
      { title: 'Active medical management', content: 'You will continue to have regular appointments with your kidney team. Medications will be used to manage symptoms and slow kidney decline where possible.' },
      { title: 'Symptom control', content: 'The focus is on keeping you comfortable. This includes managing symptoms like tiredness, nausea, itching, and breathlessness with medications and lifestyle adjustments.' },
      { title: 'Supportive care', content: 'You will have access to dietitians, social workers, and other specialists. Palliative care teams may also be involved to help with symptom management and planning.' },
      { title: 'Advance care planning', content: 'Your team will help you think about and document your wishes for future care. This ensures your preferences are known and respected.' },
    ],
    benefits: [
      { icon: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>, title: 'Focus on quality of life' },
      { icon: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, title: 'No dialysis sessions' },
      { icon: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title: 'More time at home' },
      { icon: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, title: 'Time with loved ones' },
    ],
    considerations: [
      'Kidney function will continue to decline over time',
      'Symptoms will need active management and may change',
      'Life expectancy may be shorter than with dialysis',
      'Important to have honest conversations about expectations',
      'Advance care planning is recommended',
      'May change your mind and start dialysis later if suitable',
    ],
    lifestyle: [
      { icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, title: 'Family & Support', content: 'Family members and friends often play an important role. The kidney team can provide information and support to help them understand what to expect.' },
      { icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, title: 'Daily Life', content: 'Without dialysis appointments, you have more flexibility in your daily routine. The focus is on maintaining activities that bring you joy and meaning.' },
      { icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>, title: 'Planning Ahead', content: 'Advance care planning helps ensure your wishes are known and respected. This may include decisions about hospital admissions and end-of-life care.' },
    ],
    steps: [
      { title: 'Discussion', description: 'Have an open conversation with your kidney team about your options and what matters most to you.' },
      { title: 'Assessment', description: 'Your team will assess your overall health and help you understand what to expect with conservative care.' },
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
    patientStories: [
      { quote: 'At 85, I decided dialysis was not for me. My kidney team have been wonderful - managing my symptoms and helping me stay comfortable at home. I have been able to spend quality time with my grandchildren.', name: 'Dorothy', age: 85, duration: 'On conservative care for 18 months' },
      { quote: 'After discussing all the options with my doctor and family, conservative care felt right for my situation. The support I receive is excellent, and I am able to focus on what matters most to me.', name: 'Harold', age: 78, duration: 'On conservative care for 1 year' },
    ],
  },
};

export default function TreatmentDetailPage() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { markTreatmentViewed } = useSession();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const treatment = TREATMENT_DATA[type as TreatmentType];

  // Mark treatment as viewed when page loads
  useEffect(() => {
    if (treatment) {
      markTreatmentViewed(treatment.id);
    }
  }, [treatment, markTreatmentViewed]);

  if (!treatment) {
    return (
      <main className="min-h-screen bg-bg-page flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            {t('error.treatmentNotFound', 'Treatment not found')}
          </h1>
          <Link
            to="/treatments"
            className="text-nhs-blue hover:underline"
          >
            {t('nav.backToTreatments', 'Back to treatments')}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-page" id="main-content" aria-label={t('treatments.detailedInfoAriaLabel', { treatment: treatment.title })}>
      {/* Breadcrumb */}
      <nav className="bg-bg-page border-b border-nhs-pale-grey" aria-label={t('accessibility.breadcrumb')}>
        <div className="max-w-container-xl mx-auto px-4 py-3">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link to="/" className="text-nhs-blue hover:underline">
                {t('nav.home', 'Home')}
              </Link>
            </li>
            <li className="text-nhs-mid-grey">/</li>
            <li>
              <Link to="/treatments" className="text-nhs-blue hover:underline">
                {t('treatments.title', 'Treatment Options')}
              </Link>
            </li>
            <li className="text-nhs-mid-grey">/</li>
            <li className="text-text-secondary" aria-current="page">
              {treatment.title}
            </li>
          </ol>
        </div>
      </nav>

      <div className="max-w-container-xl mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <section className={`bg-gradient-to-br ${treatment.bgGradient} rounded-lg p-8 md:p-10 mb-10 flex flex-col md:flex-row gap-8 items-center`} aria-labelledby="treatment-title">
          <div className={treatment.iconColor}>{treatment.icon}</div>
          <div className="flex-1 text-center md:text-left">
            <h1 id="treatment-title" className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
              {treatment.title}
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed mb-4">
              {treatment.subtitle}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
              {treatment.tags.map((tag, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-nhs-blue rounded-full text-sm text-nhs-blue">
                  {tag.icon}
                  {tag.label}
                </span>
              ))}
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 bg-nhs-blue text-white rounded-md font-semibold text-sm hover:bg-nhs-blue-dark transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
              aria-label={t('accessibility.listenToPage', 'Listen to this page being read aloud')}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
              <span>{t('common.listenToPage', 'Listen to this page')}</span>
            </button>
          </div>
        </section>

        {/* Overview Section */}
        <section className="mb-12" aria-labelledby="overview-heading">
          <header className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-nhs-pale-grey">
            <svg className="w-8 h-8 text-nhs-blue" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
            <h2 id="overview-heading" className="text-2xl font-bold text-text-primary">
              {t('treatment.overview', `What is ${treatment.title}?`)}
            </h2>
          </header>
          <div className="text-text-primary leading-relaxed space-y-4">
            {treatment.overview.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-12" aria-labelledby="how-it-works-heading">
          <header className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-nhs-pale-grey">
            <svg className="w-8 h-8 text-nhs-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <h2 id="how-it-works-heading" className="text-2xl font-bold text-text-primary">
              {t('treatment.howItWorks', 'How Does It Work?')}
            </h2>
          </header>
          <div className="space-y-4">
            {treatment.howItWorks.map((item, idx) => (
              <div key={idx}>
                <h3 className="font-semibold text-text-primary mb-1">{item.title}</h3>
                <p className="text-text-secondary leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-12" aria-labelledby="benefits-heading">
          <header className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-nhs-pale-grey">
            <svg className="w-8 h-8 text-nhs-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h2 id="benefits-heading" className="text-2xl font-bold text-text-primary">
              {t('treatment.benefits', 'Benefits')}
            </h2>
          </header>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {treatment.benefits.map((benefit, idx) => (
              <div key={idx} className="bg-[#E6F4EA] rounded-md p-4 text-center">
                <div className="text-nhs-green mx-auto mb-2">{benefit.icon}</div>
                <span className="font-semibold text-nhs-green-dark text-sm">{benefit.title}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Considerations Section */}
        <section className="mb-12" aria-labelledby="considerations-heading">
          <header className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-nhs-pale-grey">
            <svg className="w-8 h-8 text-nhs-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <h2 id="considerations-heading" className="text-2xl font-bold text-text-primary">
              {t('treatment.considerations', 'Things to Consider')}
            </h2>
          </header>
          <ul className="space-y-2" role="list">
            {treatment.considerations.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 bg-[#FFF8E6] border-l-4 border-nhs-warm-yellow rounded-sm">
                <svg className="w-6 h-6 flex-shrink-0 text-[#856404]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <span className="text-[#856404]">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Lifestyle Section */}
        <section className="mb-12" aria-labelledby="lifestyle-heading">
          <header className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-nhs-pale-grey">
            <svg className="w-8 h-8 text-nhs-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <h2 id="lifestyle-heading" className="text-2xl font-bold text-text-primary">
              {t('treatment.lifestyle', 'Lifestyle Impact')}
            </h2>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {treatment.lifestyle.map((item, idx) => (
              <div key={idx} className="bg-white border border-nhs-pale-grey rounded-lg p-6">
                <div className="text-nhs-blue mb-3">{item.icon}</div>
                <h3 className="text-lg font-bold text-text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Getting Started Steps */}
        <section className="mb-12" aria-labelledby="steps-heading">
          <header className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-nhs-pale-grey">
            <svg className="w-8 h-8 text-nhs-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            <h2 id="steps-heading" className="text-2xl font-bold text-text-primary">
              {t('treatment.gettingStarted', 'Getting Started')}
            </h2>
          </header>
          <ol className="space-y-4">
            {treatment.steps.map((step, idx) => (
              <li key={idx} className="flex gap-4 p-4 bg-white border border-nhs-pale-grey rounded-md">
                <div className="w-10 h-10 flex-shrink-0 bg-nhs-blue text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-1">{step.title}</h3>
                  <p className="text-sm text-text-secondary">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQs Section */}
        <section className="mb-12" aria-labelledby="faq-heading">
          <header className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-nhs-pale-grey">
            <svg className="w-8 h-8 text-nhs-blue" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
            </svg>
            <h2 id="faq-heading" className="text-2xl font-bold text-text-primary">
              {t('treatment.faq', 'Frequently Asked Questions')}
            </h2>
          </header>
          <div className="space-y-2" role="list" aria-label={t('accessibility.faq')}>
            {treatment.faqs.map((faq, idx) => (
              <div key={idx} className="border border-nhs-pale-grey rounded-md overflow-hidden" role="listitem">
                <button
                  className="w-full px-4 py-3 flex justify-between items-center bg-white hover:bg-bg-surface-secondary text-left font-semibold text-text-primary focus:outline-none focus:ring-3 focus:ring-focus focus:ring-inset"
                  aria-expanded={openFaq === idx}
                  aria-controls={`faq-answer-${idx}`}
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span>{faq.question}</span>
                  <svg
                    className={`w-6 h-6 text-nhs-blue flex-shrink-0 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {openFaq === idx && (
                  <div id={`faq-answer-${idx}`} className="px-4 pb-4 text-text-secondary leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Patient Stories Section */}
        <section className="mb-12" aria-labelledby="stories-heading">
          <header className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-nhs-pale-grey">
            <svg className="w-8 h-8 text-nhs-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <h2 id="stories-heading" className="text-2xl font-bold text-text-primary">
              {t('treatment.stories', 'Hear from Others')}
            </h2>
          </header>
          <p className="text-text-secondary mb-4">
            {t('treatment.storiesIntro', "These are experiences from real patients. Everyone's journey is different.")}
          </p>
          <div className="space-y-4">
            {treatment.patientStories.map((story, idx) => (
              <article key={idx} className="bg-white border border-nhs-pale-grey rounded-lg p-6 relative">
                <span className="absolute top-4 left-6 text-6xl text-nhs-pale-grey font-serif leading-none">"</span>
                <blockquote className="text-lg italic text-text-secondary leading-relaxed mb-4 pl-8">
                  {story.quote}
                </blockquote>
                <footer className="flex items-center gap-3 pl-8">
                  <div className="w-12 h-12 bg-nhs-blue text-white rounded-full flex items-center justify-center font-bold text-lg" aria-hidden="true">
                    {story.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary">{story.name}, {story.age}</div>
                    <div className="text-sm text-text-muted">{story.duration}</div>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        </section>

        {/* Action Section */}
        <section className="bg-white border-2 border-nhs-blue rounded-lg p-8 mb-10" aria-labelledby="action-heading">
          <h2 id="action-heading" className="text-xl font-bold text-text-primary text-center mb-6">
            {t('treatment.readyToLearnMore', 'Ready to Learn More?')}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/compare"
              className="inline-flex items-center gap-2 px-5 py-3 border-2 border-nhs-blue text-nhs-blue font-semibold rounded-md hover:bg-nhs-blue hover:text-white transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span>{t('compare.withOthers', 'Compare with Other Treatments')}</span>
            </Link>
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-5 py-3 border-2 border-nhs-blue text-nhs-blue font-semibold rounded-md hover:bg-nhs-blue hover:text-white transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>{t('chat.askQuestion', 'Ask a Question About This')}</span>
            </Link>
          </div>
        </section>

        {/* Related Treatments */}
        <section className="mb-10 pt-8 border-t border-nhs-pale-grey" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-xl font-bold text-text-primary mb-4">
            {t('treatment.exploreOthers', 'Explore Other Treatments')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.values(TREATMENT_DATA)
              .filter((t) => t.id !== treatment.id)
              .map((relatedTreatment) => (
                <Link
                  key={relatedTreatment.id}
                  to={`/treatments/${relatedTreatment.id}`}
                  className="bg-white border border-nhs-pale-grey rounded-md p-4 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
                >
                  <div className={`w-10 h-10 flex-shrink-0 ${relatedTreatment.iconColor}`}>
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>
                  <span className="font-semibold text-text-primary">{relatedTreatment.title}</span>
                </Link>
              ))}
          </div>
        </section>

        {/* Navigation Buttons */}
        <nav className="flex flex-col sm:flex-row justify-between gap-4 pt-8 border-t border-nhs-pale-grey" aria-label={t('accessibility.pageNavigation')}>
          <button
            onClick={() => navigate('/treatments')}
            className="inline-flex items-center justify-center sm:justify-start gap-2 px-4 py-3 text-nhs-blue font-medium hover:underline focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 rounded"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>{t('nav.backToTreatments', 'Back to All Treatments')}</span>
          </button>
          <Link
            to="/summary"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-nhs-blue text-white font-semibold rounded-md hover:bg-nhs-blue-dark transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
          >
            <span>{t('summary.addToMy', 'Add to My Summary')}</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </Link>
        </nav>
      </div>
    </main>
  );
}
