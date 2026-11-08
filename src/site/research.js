export const researchCases = [
  {
    id: 'portfolio-controls',
    title: 'Comparing portfolio risk controls',
    category: 'Portfolio research',
    summary:
      'A study of 26 portfolio-control configurations under three transaction-cost assumptions, examining growth, drawdown, tracking and turnover.',
    question:
      'How can a portfolio control reduce losses or allocation drift while retaining growth and limiting the cost of trading?',
    decision:
      "Identified a rebalancing band that met the study's historical tracking and turnover criteria. Assessed protection alongside participation in market gains and trading costs.",
    limitation:
      'The historical simulations used simplified price, cash-return and execution assumptions. Results depend on those choices and do not establish future performance.',
    steps: [
      {
        title: 'Define the comparison',
        body:
          'Compared volatility targeting, drawdown controls, rebalancing bands and calendar-based alternatives against explicit objectives for their portfolio roles.',
      },
      {
        title: 'Examine costs and historical periods',
        body:
          'Evaluated each configuration under the cost assumptions, using separate historical development and holdout periods for the relevant family.',
      },
      {
        title: 'Weigh the full trade-off',
        body:
          'Assessed drawdown protection together with growth, allocation tracking and turnover to determine which approach met the stated criteria.',
      },
    ],
    tags: ['Portfolio analysis', 'Risk controls', 'Historical testing'],
    relevance:
      'Connects an investment objective to a comparative study, with the financial trade-offs and evaluation criteria made explicit.',
  },
  {
    id: 'etf-comparison',
    title: 'Comparing income and cash-management ETFs',
    category: 'Investment research',
    summary:
      'An eight-fund comparison organized by portfolio role, liquidity, fees and historical drawdown.',
    question:
      'Which exposures, costs and history limitations matter when comparing products that serve different portfolio purposes?',
    decision:
      'Compared cash-like, dividend-equity and option-income products within their respective roles, and incorporated inception-history limitations into risk scenarios.',
    limitation:
      'Fund histories differ in length and market coverage. Historical analogs depend on the comparison chosen and cannot guarantee a future loss limit.',
    steps: [
      {
        title: 'Separate the portfolio roles',
        body:
          'Grouped products by the function they serve, so a cash-management holding and an equity-income fund were assessed against appropriate objectives.',
      },
      {
        title: 'Compare observable characteristics',
        body:
          'Examined fees, quoted spreads and drawdown history, keeping the available evidence and its limitations visible.',
      },
      {
        title: 'Account for gaps in fund history',
        body:
          'Flagged products whose inception dates exclude important market periods and used an explicit class-analog scenario when considering risk and sizing.',
      },
    ],
    tags: ['ETF research', 'Product comparison', 'Portfolio construction'],
    relevance:
      'Shows how product research informs a portfolio question through role, cost, liquidity and the quality of the historical comparison.',
  },
  {
    id: 'data-mismatch',
    title: 'A placebo check for a return calculation',
    category: 'Data integrity',
    summary:
      'An investigation of an apparent return pattern that traced the calculation back to incompatible price adjustments.',
    question:
      'Does an apparent return pattern reflect a market relationship or an inconsistency in the inputs?',
    decision:
      'Required compatible price fields in the corrected analysis. The corrected evidence no longer supported the original pattern.',
    limitation:
      'The original and corrected analyses used different test populations. Their comparison is not a paired estimate of the correction alone, and other data paths require their own checks.',
    steps: [
      {
        title: 'Question the pattern',
        body:
          'Used a placebo comparison that did not rely on the proposed market mechanism and examined whether the apparent effect remained.',
      },
      {
        title: 'Trace the price conventions',
        body:
          'Checked how each price field handled corporate actions and whether the fields used together in the return calculation were compatible.',
      },
      {
        title: 'Correct the input requirement',
        body:
          'Specified consistent inputs, reran the analysis and reassessed which conclusion the evidence supported.',
      },
    ],
    tags: ['Data validation', 'Placebo tests', 'Research design'],
    relevance:
      'Links source evaluation to financial reasoning by showing how a calculation depends on the meaning of its inputs.',
  },
];
