import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useSession } from '@/context/SessionContext';

export default function SummaryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session, endSession } = useSession();
  const [userQuestions, setUserQuestions] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState('');

  const handlePrint = () => {
    window.print();
  };

  const handleStartOver = () => {
    if (window.confirm(t('summary.confirmReset', 'Are you sure you want to start over? All your progress will be lost.'))) {
      endSession();
      navigate('/');
    }
  };

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      setUserQuestions([...userQuestions, newQuestion.trim()]);
      setNewQuestion('');
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setUserQuestions(userQuestions.filter((_, i) => i !== index));
  };

  const getJourneyStageLabel = (stage: string): string => {
    const stageLabels: Record<string, string> = {
      'newly-diagnosed': 'Newly Diagnosed',
      'monitoring': 'Being Monitored',
      'preparing': 'Preparing for Treatment',
      'on-dialysis': 'Currently on Dialysis',
      'transplant-waiting': 'On Transplant Waiting List',
      'post-transplant': 'After Transplant',
      'supporting-someone': 'Supporting Someone',
    };
    return stageLabels[stage] || stage;
  };

  const getJourneyStageDescription = (stage: string): string => {
    const descriptions: Record<string, string> = {
      'newly-diagnosed': 'You are learning about your kidney condition and want to understand your options.',
      'monitoring': 'Your kidneys are being monitored and you are preparing for the future.',
      'preparing': 'You need to start treatment soon and want to understand your choices.',
      'on-dialysis': 'You are receiving dialysis and exploring other options.',
      'transplant-waiting': 'You are on the transplant waiting list.',
      'post-transplant': 'You have had a kidney transplant and want ongoing support.',
      'supporting-someone': 'You are supporting a loved one with kidney disease.',
    };
    return descriptions[stage] || 'Your current stage in the kidney care journey.';
  };

  const getValueLabel = (value: number): string => {
    if (value === 1) return 'Not important';
    if (value === 2) return 'Slightly important';
    if (value === 3) return 'Moderately important';
    if (value === 4) return 'Important';
    return 'Very important';
  };

  const getTreatmentLabel = (treatment: string): string => {
    const labels: Record<string, string> = {
      'haemodialysis': 'Haemodialysis',
      'peritoneal-dialysis': 'Peritoneal Dialysis',
      'home-haemodialysis': 'Home Haemodialysis',
      'kidney-transplant': 'Kidney Transplant',
      'conservative-care': 'Conservative Care',
    };
    return labels[treatment] || treatment;
  };

  const sessionDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-bg-page to-nhs-pale-grey/30 print:bg-white">
      {/* Print Header - Enhanced for printing */}
      <div className="hidden print:block print:mb-8">
        <div className="flex items-center justify-between border-b-4 border-nhs-blue pb-4">
          <div>
            <h1 className="text-3xl font-bold text-nhs-blue">NHS Kidney Treatment Decision Aid</h1>
            <p className="text-lg text-text-secondary mt-1">Your Personal Session Summary</p>
          </div>
          <div className="text-right text-sm text-text-secondary">
            <p className="font-semibold">Date: {sessionDate}</p>
            <p className="font-mono text-xs mt-1">Session ID: {session?.id?.slice(0, 8) || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="max-w-container-lg mx-auto px-4 py-8 md:py-12 print:py-4">
        {/* Screen Header - Enhanced */}
        <div className="print:hidden">
          <header className="bg-white rounded-2xl p-8 shadow-lg border border-nhs-pale-grey mb-8">
            <div className="flex flex-wrap justify-between items-start gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-nhs-green/10 rounded-full text-sm font-medium text-nhs-green mb-4">
                  <CheckIcon className="w-4 h-4" />
                  Ready to review
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-3">
                  {t('summary.title', 'Your Session Summary')}
                </h1>
                <p className="text-base text-text-secondary flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
                  </svg>
                  {sessionDate}
                </p>
                <p className="text-xs text-text-muted font-mono mt-2 bg-nhs-pale-grey/50 px-3 py-1 rounded-full inline-block">
                  {t('summary.sessionId', 'Session ID')}: {session?.id?.slice(0, 8) || 'N/A'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handlePrint}
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-nhs-green to-nhs-green-dark text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-focus focus:ring-offset-2"
                >
                  <PrintIcon className="w-5 h-5" />
                  {t('summary.print', 'Print Summary')}
                </button>
                <button
                  onClick={() => navigator.share?.({
                    title: 'NHS Kidney Treatment Summary',
                    text: 'My kidney treatment decision summary',
                    url: window.location.href,
                  }).catch(() => {})}
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-nhs-blue text-nhs-blue font-bold rounded-xl hover:bg-nhs-blue hover:text-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-focus focus:ring-offset-2"
                >
                  <ShareIcon className="w-5 h-5" />
                  {t('summary.share', 'Share')}
                </button>
              </div>
            </div>
          </header>
        </div>

        {/* Journey Stage Section - Enhanced */}
        <section className="bg-white border border-nhs-pale-grey rounded-2xl mb-6 overflow-hidden shadow-sm print:border-gray-300 print:rounded-lg">
          <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-nhs-blue/5 to-transparent border-b border-nhs-pale-grey">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-3">
              <div className="w-10 h-10 bg-nhs-blue/10 rounded-xl flex items-center justify-center">
                <JourneyIcon className="w-6 h-6 text-nhs-blue" />
              </div>
              {t('summary.sections.journey', 'Your Journey Stage')}
            </h2>
            <Link
              to="/journey"
              className="text-sm text-nhs-blue hover:bg-nhs-blue/5 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors print:hidden"
            >
              <EditIcon className="w-4 h-4" />
              {t('common.edit', 'Edit')}
            </Link>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-5 p-5 bg-gradient-to-r from-nhs-blue/5 to-nhs-blue/10 rounded-xl border-l-4 border-nhs-blue">
              <div className="w-14 h-14 bg-nhs-blue text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <StageIcon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xl font-bold text-text-primary">
                  {session?.journeyStage
                    ? getJourneyStageLabel(session.journeyStage)
                    : t('summary.notSpecified', 'Not specified')}
                </p>
                {session?.journeyStage && (
                  <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                    {getJourneyStageDescription(session.journeyStage)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Your Priorities Section - Enhanced */}
        <section className="bg-white border border-nhs-pale-grey rounded-2xl mb-6 overflow-hidden shadow-sm print:border-gray-300 print:rounded-lg">
          <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-nhs-pink/5 to-transparent border-b border-nhs-pale-grey">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-3">
              <div className="w-10 h-10 bg-nhs-pink/10 rounded-xl flex items-center justify-center">
                <HeartIcon className="w-6 h-6 text-nhs-pink" />
              </div>
              {t('summary.sections.priorities', 'Your Priorities')}
            </h2>
            <Link
              to="/values"
              className="text-sm text-nhs-blue hover:bg-nhs-blue/5 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors print:hidden"
            >
              <EditIcon className="w-4 h-4" />
              {t('common.edit', 'Edit')}
            </Link>
          </div>
          <div className="p-6">
            {session?.valueRatings && session.valueRatings.length > 0 ? (
              <ul className="space-y-2">
                {[...session.valueRatings]
                  .filter(v => v.rating >= 4)
                  .slice(0, 5)
                  .map((value, index) => (
                    <li key={value.statementId} className="flex items-center gap-4 p-4 bg-nhs-pale-grey/30 rounded-lg">
                      <span className="w-8 h-8 bg-nhs-green text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <span className="text-text-primary">
                          {t(`values.statements.${value.statementId}`, value.statementId)}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((dot) => (
                              <span
                                key={dot}
                                className={`w-2 h-2 rounded-full ${
                                  dot <= value.rating ? 'bg-nhs-green' : 'bg-nhs-pale-grey'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-text-secondary">
                            {getValueLabel(value.rating)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-text-secondary">
                {t('summary.noValues', 'You have not completed the values exercise yet.')}
                <Link to="/values" className="text-nhs-blue hover:underline ml-2 print:hidden">
                  {t('summary.completeValues', 'Complete now')}
                </Link>
              </p>
            )}
          </div>
        </section>

        {/* Treatments Explored Section - Enhanced */}
        <section className="bg-white border border-nhs-pale-grey rounded-2xl mb-6 overflow-hidden shadow-sm print:border-gray-300 print:rounded-lg">
          <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-nhs-green/5 to-transparent border-b border-nhs-pale-grey">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-3">
              <div className="w-10 h-10 bg-nhs-green/10 rounded-xl flex items-center justify-center">
                <TreatmentIcon className="w-6 h-6 text-nhs-green" />
              </div>
              {t('summary.sections.viewed', 'Treatments Explored')}
            </h2>
            <Link
              to="/treatments"
              className="text-sm text-nhs-blue hover:bg-nhs-blue/5 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors print:hidden"
            >
              {t('summary.seeAll', 'See all')}
            </Link>
          </div>
          <div className="p-6">
            {session?.viewedTreatments && session.viewedTreatments.length > 0 ? (
              <div className="space-y-3">
                {session.viewedTreatments.map((treatment) => (
                  <div key={treatment} className="flex justify-between items-center p-4 border border-nhs-pale-grey rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-nhs-pale-grey rounded-lg flex items-center justify-center">
                        <TreatmentIcon className="w-5 h-5 text-nhs-blue" />
                      </div>
                      <span className="font-semibold text-text-primary">
                        {getTreatmentLabel(treatment)}
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-nhs-green/10 text-nhs-green text-xs font-semibold rounded-full flex items-center gap-1">
                      <CheckIcon className="w-3 h-3" />
                      {t('summary.viewed', 'Viewed')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary">
                {t('summary.noTreatments', 'You have not explored any treatments yet.')}
                <Link to="/treatments" className="text-nhs-blue hover:underline ml-2 print:hidden">
                  {t('summary.exploreTreatments', 'Explore treatments')}
                </Link>
              </p>
            )}
          </div>
        </section>

        {/* Questions for Your Team Section - Enhanced */}
        <section className="bg-white border border-nhs-pale-grey rounded-2xl mb-6 overflow-hidden shadow-sm print:border-gray-300 print:rounded-lg">
          <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-nhs-warm-yellow/10 to-transparent border-b border-nhs-pale-grey">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-3">
              <div className="w-10 h-10 bg-nhs-warm-yellow/20 rounded-xl flex items-center justify-center">
                <QuestionIcon className="w-6 h-6 text-nhs-warm-yellow" />
              </div>
              {t('summary.sections.questions', 'Questions for Your Team')}
            </h2>
          </div>
          <div className="p-6">
            <ul className="space-y-3 mb-6">
              {/* Default suggested questions */}
              <li className="flex items-start gap-4 p-4 border border-nhs-pale-grey rounded-lg">
                <span className="w-6 h-6 text-[#ffb81c] flex-shrink-0">
                  <LightbulbIcon className="w-full h-full" />
                </span>
                <span className="text-text-primary">
                  {t('summary.question1', 'Which treatment options are suitable for my situation?')}
                </span>
              </li>
              <li className="flex items-start gap-4 p-4 border border-nhs-pale-grey rounded-lg">
                <span className="w-6 h-6 text-[#ffb81c] flex-shrink-0">
                  <LightbulbIcon className="w-full h-full" />
                </span>
                <span className="text-text-primary">
                  {t('summary.question2', 'What would my daily life look like with each treatment?')}
                </span>
              </li>
              <li className="flex items-start gap-4 p-4 border border-nhs-pale-grey rounded-lg">
                <span className="w-6 h-6 text-[#ffb81c] flex-shrink-0">
                  <LightbulbIcon className="w-full h-full" />
                </span>
                <span className="text-text-primary">
                  {t('summary.question3', 'How do I start the process for my preferred treatment?')}
                </span>
              </li>
              {/* User added questions */}
              {userQuestions.map((question, index) => (
                <li key={index} className="flex items-start gap-4 p-4 border border-nhs-pale-grey rounded-lg bg-nhs-blue/5">
                  <span className="w-6 h-6 text-nhs-blue flex-shrink-0">
                    <QuestionIcon className="w-full h-full" />
                  </span>
                  <span className="text-text-primary flex-1">{question}</span>
                  <button
                    onClick={() => handleRemoveQuestion(index)}
                    className="p-1 text-text-muted hover:text-[#d4351c] hover:bg-red-50 rounded transition-colors print:hidden"
                    aria-label={t('common.remove', 'Remove')}
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>

            {/* Add question input - hidden when printing */}
            <div className="flex gap-3 print:hidden">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
                placeholder={t('summary.addQuestionPlaceholder', 'Type your own question...')}
                className="flex-1 px-4 py-2 border-2 border-nhs-pale-grey rounded-md focus:outline-none focus:border-nhs-blue focus:ring-2 focus:ring-nhs-blue/20"
              />
              <button
                onClick={handleAddQuestion}
                disabled={!newQuestion.trim()}
                className="px-4 py-2 bg-nhs-blue text-white font-semibold rounded-md hover:bg-nhs-blue-dark disabled:bg-nhs-mid-grey disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-focus"
              >
                {t('common.add', 'Add')}
              </button>
            </div>
          </div>
        </section>

        {/* Next Steps Section - Enhanced */}
        <section className="bg-white border border-nhs-pale-grey rounded-2xl mb-6 overflow-hidden shadow-sm print:border-gray-300 print:rounded-lg">
          <div className="px-6 py-5 bg-gradient-to-r from-nhs-aqua-green/10 to-transparent border-b border-nhs-pale-grey">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-3">
              <div className="w-10 h-10 bg-nhs-aqua-green/20 rounded-xl flex items-center justify-center">
                <NextStepsIcon className="w-6 h-6 text-nhs-aqua-green" />
              </div>
              {t('summary.sections.nextSteps', 'Suggested Next Steps')}
            </h2>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              <li className="flex items-start gap-4 pb-4 border-b border-nhs-pale-grey">
                <span className="w-7 h-7 bg-nhs-blue text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  1
                </span>
                <div>
                  <p className="font-semibold text-text-primary">
                    {t('summary.step1.title', 'Review this summary')}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {t('summary.step1.description', 'Take time to look through what you have explored and think about any additional questions.')}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4 pb-4 border-b border-nhs-pale-grey">
                <span className="w-7 h-7 bg-nhs-blue text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  2
                </span>
                <div>
                  <p className="font-semibold text-text-primary">
                    {t('summary.step2.title', 'Share with family or carers')}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {t('summary.step2.description', 'If you have support at home, discuss your thoughts with them.')}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-7 h-7 bg-nhs-blue text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  3
                </span>
                <div>
                  <p className="font-semibold text-text-primary">
                    {t('summary.step3.title', 'Discuss with your kidney care team')}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {t('summary.step3.description', 'Bring this summary to your next appointment to discuss your options.')}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* Privacy Reminder - Enhanced */}
        <div className="bg-gradient-to-r from-nhs-blue/5 to-nhs-blue/10 border border-nhs-blue/20 rounded-2xl p-5 mb-6 flex items-start gap-4 print:bg-gray-100 print:rounded-lg">
          <div className="w-12 h-12 bg-nhs-blue/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <LockIcon className="w-6 h-6 text-nhs-blue" />
          </div>
          <div>
            <p className="font-bold text-text-primary text-lg">
              {t('summary.privacy.title', 'Your Privacy')}
            </p>
            <p className="text-sm text-text-secondary mt-1 leading-relaxed">
              {t('summary.privacy.text', 'This information is stored only in your browser and will be cleared when you end your session. No personal data has been saved on any server.')}
            </p>
          </div>
        </div>

        {/* Disclaimer - Enhanced */}
        <div className="bg-gradient-to-r from-nhs-warm-yellow/10 to-nhs-orange/10 border-l-4 border-nhs-warm-yellow rounded-2xl p-5 mb-8 print:bg-gray-100 print:border-gray-400 print:rounded-lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-nhs-warm-yellow/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <WarningIcon className="w-6 h-6 text-nhs-orange print:text-gray-600" />
            </div>
            <div>
              <p className="font-bold text-text-primary text-lg print:text-gray-700">
                {t('summary.disclaimer.title', 'Important Reminder')}
              </p>
              <p className="text-sm text-text-secondary mt-1 leading-relaxed print:text-gray-600">
                {t(
                  'summary.disclaimer.text',
                  'This summary is for information purposes only and does not constitute medical advice. Always discuss your treatment options with your kidney care team who know your individual circumstances.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons - Enhanced */}
        <div className="bg-gradient-to-r from-nhs-green/10 to-nhs-green/5 rounded-2xl p-8 mb-8 text-center print:hidden">
          <h3 className="text-xl font-bold text-text-primary mb-2">Ready for your next appointment?</h3>
          <p className="text-text-secondary mb-6">Print this summary to take with you to your kidney care team</p>
          <button
            onClick={handlePrint}
            className="group inline-flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-nhs-green to-nhs-green-dark text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-focus focus:ring-offset-2"
          >
            <PrintIcon className="w-6 h-6" />
            {t('summary.printForAppointment', 'Print for Your Appointment')}
          </button>
        </div>

        {/* Start Over Button - Enhanced */}
        <div className="text-center print:hidden">
          <button
            onClick={handleStartOver}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-nhs-red hover:bg-nhs-red/5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-focus"
          >
            <RefreshIcon className="w-5 h-5" />
            {t('summary.startOver', 'Start Over')}
          </button>
        </div>

        {/* Navigation - Enhanced */}
        <nav
          className="bg-white rounded-2xl p-6 border border-nhs-pale-grey shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden"
          aria-label="Page navigation"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/hub')}
              className="inline-flex items-center gap-2 text-nhs-blue hover:bg-nhs-blue/5 px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-focus"
            >
              <BackIcon className="w-4 h-4" />
              {t('nav.backToHub', 'Back to Hub')}
            </button>
            <span className="text-nhs-pale-grey hidden sm:inline">|</span>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-text-secondary hover:text-nhs-blue hover:bg-nhs-blue/5 px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-focus"
            >
              <HomeIcon className="w-4 h-4" />
              {t('nav.returnToHome', 'Return to Home')}
            </Link>
          </div>
          <Link
            to="/chat"
            className="group inline-flex items-center gap-2 text-nhs-blue hover:bg-nhs-blue/5 px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-focus font-medium"
          >
            {t('summary.askMore', 'Have more questions?')}
            <ForwardIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </nav>

        {/* Print Footer */}
        <div className="hidden print:block print:mt-8 print:pt-4 print:border-t print:border-gray-300">
          <p className="text-xs text-gray-500 text-center">
            Generated by NHS Kidney Treatment Decision Aid - {sessionDate} - This document is for discussion with your healthcare team only
          </p>
        </div>
      </div>
    </main>
  );
}

// Icon Components
function PrintIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9V2h12v7" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
  );
}

function JourneyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
    </svg>
  );
}

function StageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  );
}

function TreatmentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function QuestionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
    </svg>
  );
}

function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function NextStepsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function BackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function ForwardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}
