export const researchCases = [
  {
    id: 'portfolio-controls',
    title: 'Comparing portfolio risk controls',
    category: 'Portfolio research',
    summary:
      'A study of 26 portfolio-control configurations under three transaction-cost assumptions, examining growth, drawdown, tracking and turnover.',
    scope:
      '26 configurations; three transaction-cost assumptions; separate historical development and holdout periods for the relevant family.',
    keyDecision:
      "A rebalancing band met the study's historical tracking and turnover criteria.",
    question:
      'How can a portfolio control reduce losses or allocation drift while retaining growth and limiting the cost of trading?',
    decision:
      "Identified a rebalancing band that met the study's historical tracking and turnover criteria. Assessed protection alongside participation in market gains and trading costs.",
    limitation:
      'The historical simulations used simplified price, cash-return and execution assumptions. Results depend on those choices and do not establish future performance.',
    comparison: {
      heading: 'Protection, participation and the cost of trading',
      caption: 'Portfolio-control comparison framework',
      headers: ['Dimension', 'What was examined', 'How it informed the assessment'],
      rows: [
        ['Growth', 'Participation in market gains', 'Read alongside drawdown protection and trading costs.'],
        ['Drawdown', 'Protection against portfolio losses', 'Assessed together with growth, allocation tracking and turnover.'],
        ['Allocation tracking', 'Drift from the intended allocation', 'A rebalancing band met the historical tracking and turnover criteria.'],
        ['Turnover and costs', 'Trading activity under three transaction-cost assumptions', 'The cost of trading formed part of the comparison.'],
      ],
      note: 'The study compared volatility targeting, drawdown controls, rebalancing bands and calendar-based alternatives.',
    },
    steps: [
      {
        title: 'Define the comparison',
        body:
          'Compared volatility targeting, drawdown controls, rebalancing bands and calendar-based alternatives against explicit objectives for their portfolio roles.',
        rationale:
          'Protection, growth and allocation tracking are different objectives. A control needs to be assessed against the role it is meant to serve.',
      },
      {
        title: 'Examine costs and historical periods',
        body:
          'Evaluated each configuration under the cost assumptions, using separate historical development and holdout periods for the relevant family.',
        rationale:
          'A result depends on the historical period and the assumed cost of trading, so both belong in the evaluation.',
      },
      {
        title: 'Weigh the full trade-off',
        body:
          'Assessed drawdown protection together with growth, allocation tracking and turnover to determine which approach met the stated criteria.',
        rationale:
          'Reducing losses alone does not settle whether a control meets the portfolio objective.',
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
    scope:
      'Eight funds across cash-management, dividend-equity and option-income roles.',
    keyDecision:
      'Compare products within their portfolio roles and account for missing market periods in risk scenarios.',
    question:
      'Which exposures, costs and history limitations matter when comparing products that serve different portfolio purposes?',
    decision:
      'Compared cash-like, dividend-equity and option-income products within their respective roles, and incorporated inception-history limitations into risk scenarios.',
    limitation:
      'Fund histories differ in length and market coverage. Historical analogs depend on the comparison chosen and cannot guarantee a future loss limit.',
    comparison: {
      heading: 'Portfolio role changes the comparison',
      caption: 'Eight-fund comparison framework',
      headers: ['Dimension', 'Evidence examined', 'Research decision'],
      rows: [
        ['Portfolio function', 'Cash-like, dividend-equity and option-income products', 'Compare products within the roles they are intended to serve.'],
        ['Costs and liquidity', 'Fees and quoted spreads', 'Consider trading friction alongside the portfolio purpose.'],
        ['Historical risk', 'Available drawdown history', 'Keep the observed market coverage visible when interpreting risk.'],
        ['Missing history', 'Inception dates and gaps in important market periods', 'Use an explicit class-analog scenario when considering risk and sizing.'],
      ],
      note: 'The comparison keeps product characteristics, historical observations and scenario assumptions distinct.',
    },
    steps: [
      {
        title: 'Separate the portfolio roles',
        body:
          'Grouped products by the function they serve, so a cash-management holding and an equity-income fund were assessed against appropriate objectives.',
        rationale:
          'Products that serve different portfolio purposes need different objectives for the comparison to be useful.',
      },
      {
        title: 'Compare observable characteristics',
        body:
          'Examined fees, quoted spreads and drawdown history, keeping the available evidence and its limitations visible.',
        rationale:
          'The role of a holding needs to be considered together with its costs, liquidity and observed risk.',
      },
      {
        title: 'Account for gaps in fund history',
        body:
          'Flagged products whose inception dates exclude important market periods and used an explicit class-analog scenario when considering risk and sizing.',
        rationale:
          'A short fund history may omit the market conditions that matter to a risk decision.',
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
    scope:
      'Placebo comparison, price-convention review and corrected analysis; the original and corrected test populations differ.',
    keyDecision:
      'Require compatible price fields. The corrected evidence no longer supported the original pattern.',
    question:
      'Does an apparent return pattern reflect a market relationship or an inconsistency in the inputs?',
    decision:
      'Required compatible price fields in the corrected analysis. The corrected evidence no longer supported the original pattern.',
    limitation:
      'The original and corrected analyses used different test populations. Their comparison is not a paired estimate of the correction alone, and other data paths require their own checks.',
    comparison: {
      heading: 'The conclusion changed when the inputs were corrected',
      caption: 'Analysis decisions and conclusions',
      headers: ['Analysis', 'Input issue or requirement', 'Conclusion recorded'],
      rows: [
        ['Original analysis', 'Incompatible price adjustments in the return calculation', 'An apparent return pattern prompted investigation.'],
        ['Corrected analysis', 'Compatible price fields required', 'The corrected evidence no longer supported the original pattern.'],
      ],
      note: 'The test populations differed. These records are not a paired estimate of the price-field correction alone.',
    },
    steps: [
      {
        title: 'Question the pattern',
        body:
          'Used a placebo comparison that did not rely on the proposed market mechanism and examined whether the apparent effect remained.',
        rationale:
          'A comparison outside the proposed mechanism helps question whether the market explanation accounts for the result.',
      },
      {
        title: 'Trace the price conventions',
        body:
          'Checked how each price field handled corporate actions and whether the fields used together in the return calculation were compatible.',
        rationale:
          'A return calculation depends on the meaning and adjustment conventions of its inputs.',
      },
      {
        title: 'Correct the input requirement',
        body:
          'Specified consistent inputs, reran the analysis and reassessed which conclusion the evidence supported.',
        rationale:
          'Correcting the calculation requires a fresh assessment of the financial claim.',
      },
    ],
    tags: ['Data validation', 'Placebo tests', 'Research design'],
    relevance:
      'Links source evaluation to financial reasoning by showing how a calculation depends on the meaning of its inputs.',
  },
];
