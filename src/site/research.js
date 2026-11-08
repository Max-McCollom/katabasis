export const researchCases = [
  {
    "id": "portfolio-controls",
    "title": "Portfolio risk-control comparison",
    "category": "Portfolio research",
    "summary": "A study of 26 portfolio-control configurations under three transaction-cost assumptions, examining growth, drawdown, tracking and turnover.",
    "scope": "26 configurations; three transaction-cost assumptions; separate historical development and holdout periods for the relevant family.",
    "keyDecision": "A rebalancing band met the study's historical tracking and turnover criteria.",
    "question": "How can a portfolio control reduce losses or allocation drift while retaining growth and limiting the cost of trading?",
    "decision": "Identified a rebalancing band that met the study's historical tracking and turnover criteria. Assessed protection alongside participation in market gains and trading costs.",
    "limitation": "The historical simulations used simplified price, cash-return and execution assumptions. Results depend on those choices and do not establish future performance.",
    "comparison": {
      "heading": "Portfolio objectives and recorded decisions",
      "caption": "Historical findings and resulting research decisions",
      "headers": [
        "Question tested",
        "Recorded outcome",
        "Research decision"
      ],
      "rows": [
        [
          "Allocation tracking and turnover",
          "The selected rebalancing band met the specified historical criteria under all three tested cost assumptions.",
          "Retain the affirmative result within the scope of this study."
        ],
        [
          "Protection and participation",
          "A control reduced modeled drawdown but missed the growth objective.",
          "Do not adopt protection on that result alone."
        ],
        [
          "An alternative on evaluation data",
          "An already-viewed holdout made another configuration look more attractive.",
          "Record a question for new observation instead of using the evaluation set to select again."
        ]
      ],
      "note": "Qualitative summary of recorded portfolio-study decisions. The historical simulations used simplified price, cash-return and execution assumptions."
    },
    "steps": [
      {
        "title": "Define the comparison",
        "body": "Compared volatility targeting, drawdown controls, rebalancing bands and calendar-based alternatives against explicit objectives for their portfolio roles.",
        "rationale": "Protection, growth and allocation tracking are different objectives. A control needs to be assessed against the role it is meant to serve."
      },
      {
        "title": "Examine costs and historical periods",
        "body": "Evaluated each configuration under the cost assumptions, using separate historical development and holdout periods for the relevant family.",
        "rationale": "A result depends on the historical period and the assumed cost of trading, so both belong in the evaluation."
      },
      {
        "title": "Evaluate the joint criteria",
        "body": "Assessed drawdown protection together with growth, allocation tracking and turnover to determine which approach met the stated criteria.",
        "rationale": "Reducing losses alone does not settle whether a control meets the portfolio objective."
      }
    ],
    "tags": [
      "Portfolio analysis",
      "Risk controls",
      "Historical testing"
    ],
    "systems": [
      "portfolio-research",
      "simulation-replay"
    ],
    "relevance": "Connects an investment objective to a comparative study, with the financial trade-offs and evaluation criteria made explicit.",
    "record": {
      "kind": "Historical portfolio-control study",
      "sourceLabel": "Portfolio-control study and cost-sensitivity decision records, July 2026; source review November 2026.",
      "body": [
        "A selected rebalancing band met the historical allocation-tracking and turnover criteria under all three tested transaction-cost assumptions. The result answered a defined portfolio-control question.",
        "Another control improved modeled drawdown but missed the study's growth objective, so protection alone did not justify adoption. An alternative that looked attractive on an already-viewed holdout was recorded as a question for new observation rather than treated as fresh validation."
      ]
    }
  },
  {
    "id": "etf-comparison",
    "title": "Income and cash-management ETF comparison",
    "category": "Investment research",
    "summary": "An eight-fund comparison organized by portfolio role, liquidity, fees and historical drawdown.",
    "scope": "Eight funds across cash-management, dividend-equity and option-income roles.",
    "keyDecision": "Compare products within their portfolio roles and account for missing market periods in risk scenarios.",
    "question": "Which exposures, costs and history limitations matter when comparing products that serve different portfolio purposes?",
    "decision": "Compared cash-like, dividend-equity and option-income products within their respective roles, and incorporated inception-history limitations into risk scenarios.",
    "limitation": "Fund histories differ in length and market coverage. Historical analogs depend on the comparison chosen and cannot guarantee a future loss limit.",
    "comparison": {
      "heading": "Product roles and comparison criteria",
      "caption": "Eight-fund comparison framework",
      "headers": [
        "Dimension",
        "Evidence examined",
        "Research decision"
      ],
      "rows": [
        [
          "Portfolio function",
          "Cash-like, dividend-equity and option-income products",
          "Compare products within the roles they are intended to serve."
        ],
        [
          "Costs and liquidity",
          "Fees and quoted spreads",
          "Consider trading friction alongside the portfolio purpose."
        ],
        [
          "Historical risk",
          "Available drawdown history",
          "Keep the observed market coverage visible when interpreting risk."
        ],
        [
          "Missing history",
          "Inception dates and gaps in important market periods",
          "Use an explicit class-analog scenario when considering risk and sizing."
        ]
      ],
      "note": "The comparison keeps product characteristics, historical observations and scenario assumptions distinct."
    },
    "steps": [
      {
        "title": "Separate the portfolio roles",
        "body": "Grouped products by the function they serve, so a cash-management holding and an equity-income fund were assessed against appropriate objectives.",
        "rationale": "Products that serve different portfolio purposes need different objectives for the comparison to be useful."
      },
      {
        "title": "Compare observable characteristics",
        "body": "Examined fees, quoted spreads and drawdown history, keeping the available evidence and its limitations visible.",
        "rationale": "The role of a holding needs to be considered together with its costs, liquidity and observed risk."
      },
      {
        "title": "Account for gaps in fund history",
        "body": "Flagged products whose inception dates exclude important market periods and used an explicit class-analog scenario when considering risk and sizing.",
        "rationale": "A short fund history may omit the market conditions that matter to a risk decision."
      }
    ],
    "tags": [
      "ETF research",
      "Product comparison",
      "Portfolio construction"
    ],
    "systems": [
      "portfolio-research"
    ],
    "relevance": "Shows how product research informs a portfolio question through role, cost, liquidity and the quality of the historical comparison.",
    "record": {
      "kind": "Investment-product comparison",
      "sourceLabel": "Eight-fund comparison and portfolio-risk scenario records, July 2026; source review November 2026.",
      "body": [
        "The study grouped eight funds by cash-management, dividend-equity and option-income roles. Costs, quoted spreads and observed drawdown were interpreted in relation to those different portfolio jobs.",
        "The risk assessment was revised where a short post-inception record omitted important market conditions. An explicit class-analog scenario replaced an overly favorable reading of the available fund history. The analog remained a modeling choice rather than a guaranteed loss limit."
      ]
    }
  },
  {
    "id": "data-mismatch",
    "title": "Price-field compatibility and placebo testing",
    "category": "Data integrity",
    "summary": "An investigation of an apparent return pattern that traced the calculation back to incompatible price adjustments.",
    "scope": "Placebo comparison, price-convention review and corrected analysis; the original and corrected test populations differ.",
    "keyDecision": "Require compatible price fields. The corrected evidence no longer supported the original pattern.",
    "question": "Does an apparent return pattern reflect a market relationship or an inconsistency in the inputs?",
    "decision": "Required compatible price fields in the corrected analysis. The corrected evidence no longer supported the original pattern.",
    "limitation": "The original and corrected analyses used different test populations. Their comparison is not a paired estimate of the correction alone, and other data paths require their own checks.",
    "comparison": {
      "heading": "Input compatibility and corrected interpretation",
      "caption": "Analysis decisions and conclusions",
      "headers": [
        "Analysis",
        "Input issue or requirement",
        "Conclusion recorded"
      ],
      "rows": [
        [
          "Original analysis",
          "Incompatible price adjustments in the return calculation",
          "An apparent return pattern prompted investigation."
        ],
        [
          "Corrected analysis",
          "Compatible price fields required",
          "The corrected evidence no longer supported the original pattern."
        ]
      ],
      "note": "The test populations differed. These records are not a paired estimate of the price-field correction alone."
    },
    "steps": [
      {
        "title": "Test alternative explanations",
        "body": "Used a placebo comparison that did not rely on the proposed market mechanism and examined whether the apparent effect remained.",
        "rationale": "A comparison outside the proposed mechanism helps question whether the market explanation accounts for the result."
      },
      {
        "title": "Trace the price conventions",
        "body": "Checked how each price field handled corporate actions and whether the fields used together in the return calculation were compatible.",
        "rationale": "A return calculation depends on the meaning and adjustment conventions of its inputs."
      },
      {
        "title": "Correct the input requirement",
        "body": "Specified consistent inputs, reran the analysis and reassessed which conclusion the evidence supported.",
        "rationale": "Correcting the calculation requires a fresh assessment of the financial claim."
      }
    ],
    "tags": [
      "Data validation",
      "Placebo tests",
      "Research design"
    ],
    "systems": [
      "data-factory",
      "evidence-evaluation"
    ],
    "relevance": "Links source evaluation to financial reasoning by showing how a calculation depends on the meaning of its inputs.",
    "record": {
      "kind": "Data-integrity investigation",
      "sourceLabel": "Price-convention, placebo and corrected-analysis records, July 2026; source review November 2026.",
      "body": [
        "A mechanism-free placebo retained an apparent return pattern, directing attention to the calculation's inputs. The review found prices with incompatible corporate-action adjustments.",
        "The corrected path requires compatible fields, and the corrected evidence no longer supported the original pattern. The original and corrected populations differed, so the comparison is not a paired estimate of the price-field correction alone."
      ]
    }
  },
  {
    "id": "hypothesis-design",
    "title": "Economic mechanism and hypothesis specification",
    "category": "Research design",
    "summary": "A revision to the hypothesis framework made counterparty incentives, market constraints and practical capacity explicit, while allowing both premium-selling and long-convexity explanations.",
    "scope": "A documented framework revision incorporated into hypothesis specifications and research review; not a return or trading-strategy result.",
    "keyDecision": "Ask why an opportunity could persist without making premium collection the only acceptable explanation.",
    "question": "What must a financial hypothesis explain before it deserves further research, and could the wording of those requirements exclude useful questions?",
    "decision": "Specified questions about economic mechanism, counterparty incentives, constraints and capacity. Broadened the counterparty rubric so it could also examine who might underprice a tail, rather than presume every opportunity involved selling a premium.",
    "limitation": "A plausible mechanism helps define and prioritize research. It does not establish an exploitable return, adequate measurement or a successfully tested strategy.",
    "comparison": {
      "heading": "Hypothesis requirements and framework revision",
      "caption": "Hypothesis requirements and the reason for revising them",
      "headers": [
        "Research requirement",
        "What it asks",
        "Why it belongs in the framework"
      ],
      "rows": [
        [
          "Economic mechanism",
          "Why could the proposed relationship exist?",
          "A market story needs an explanation that evidence can investigate."
        ],
        [
          "Counterparty incentives",
          "Who is on the other side, and what could motivate that behavior?",
          "A proposed opportunity should account for the other participant."
        ],
        [
          "Constraints and capacity",
          "What could sustain the effect, and could it be collected at the intended scale?",
          "An apparent relationship may be unavailable after practical limits are considered."
        ],
        [
          "Direction of the explanation",
          "Could the question concern underpriced tail exposure as well as premium collection?",
          "A review rubric should not exclude a hypothesis simply because its economics run in the opposite direction."
        ]
      ],
      "note": "These are research-design questions. They do not disclose a candidate strategy, a trading rule or a claim of investment performance."
    },
    "steps": [
      {
        "title": "Require an economic explanation",
        "body": "Made the mechanism, counterparty incentives and possible persistence part of the hypothesis specification and review process.",
        "rationale": "A statistical pattern alone does not explain why a relationship could remain available to an investor."
      },
      {
        "title": "Assess directional bias in the framework",
        "body": "Broadened premium-selling language to include long-convexity hypotheses and the question of who might underprice a tail.",
        "rationale": "The standards used to review an idea also influence which ideas the system can consider."
      },
      {
        "title": "Connect the explanation to a research decision",
        "body": "Included practical constraints, capacity considerations and evidence that could weaken the explanation when deciding what to investigate next.",
        "rationale": "Research priority should reflect both an economic rationale and a way to challenge it."
      }
    ],
    "tags": [
      "Financial hypotheses",
      "Economic mechanisms",
      "Research prioritization"
    ],
    "systems": [
      "hypothesis-discovery",
      "evidence-evaluation"
    ],
    "relevance": "Demonstrates a concrete system-design decision: revising the questions used to generate and review research so the framework supports a broader, economically reasoned opportunity set.",
    "record": {
      "kind": "Financial research-framework revision",
      "sourceLabel": "Hypothesis-framework design and review records, July 2026; source review November 2026.",
      "body": [
        "The framework incorporated questions about mechanism, counterparty incentives, sustaining constraints and practical capacity into hypothesis specifications and research review.",
        "The wording was later broadened to consider underpriced tail exposure and long-convexity ideas alongside premium selling. This changed the kinds of financially reasoned questions the process could investigate."
      ]
    }
  },
  {
    "id": "narrowed-claim",
    "title": "Reproduction and observation sensitivity",
    "category": "Historical research",
    "summary": "An exact rerun reproduced a recorded result. A separate test of sensitivity to an observation choice weakened part of the claim, so the conclusion was narrowed.",
    "scope": "Recorded baseline reproduction and a separate observation-sensitivity comparison in historical research.",
    "keyDecision": "Keep the successful reproduction and the unfavorable sensitivity result as separate findings.",
    "question": "Does reproducing an original output establish that its financial conclusion survives a reasonable change in how the observations are made?",
    "decision": "Recorded reproduction of the baseline separately from the sensitivity test. Retained only the portion of the conclusion supported by both, rather than treating a successful rerun as evidence for the full claim.",
    "limitation": "The comparison concerns a narrow set of recorded historical observations. It does not establish a generally robust strategy, an optimal observation rule or future performance.",
    "comparison": {
      "heading": "Reproduction, sensitivity and conclusion",
      "caption": "Recorded results and the conclusions they permit",
      "headers": [
        "Test",
        "Question answered",
        "Conclusion recorded"
      ],
      "rows": [
        [
          "Exact reproduction",
          "Can the recorded inputs and procedure recover the baseline output?",
          "The rerun reproduced the recorded result."
        ],
        [
          "Observation sensitivity",
          "Does the claim survive a change in an observation choice?",
          "The separate test weakened part of the claim."
        ],
        [
          "Combined interpretation",
          "What can be retained after considering both results?",
          "The conclusion was narrowed; reproduction did not erase the sensitivity finding."
        ]
      ],
      "note": "The records distinguish a reproducible calculation from a claim that is robust to the tested research choice."
    },
    "steps": [
      {
        "title": "Recover the baseline",
        "body": "Used the recorded inputs and procedure to check whether the original output could be reproduced.",
        "rationale": "A sensitivity comparison needs a baseline whose reproduction is understood."
      },
      {
        "title": "Test observation sensitivity",
        "body": "Compared the claim with a test that changed an observation choice, keeping its result distinct from the exact rerun.",
        "rationale": "Repeating the same calculation does not test whether the conclusion depends on that research choice."
      },
      {
        "title": "Narrow the conclusion",
        "body": "Preserved both findings and revised the interpretation to reflect the weaker support in the sensitivity test.",
        "rationale": "A successful test should not overwrite an unfavorable result from a test of a different condition."
      }
    ],
    "tags": [
      "Controlled replay",
      "Reproducibility",
      "Robustness"
    ],
    "systems": [
      "simulation-replay",
      "evidence-evaluation"
    ],
    "relevance": "Shows how research evaluation changes a conclusion: the system preserves both what was reproduced and what remained sensitive to an analysis choice.",
    "record": {
      "kind": "Historical reproduction and sensitivity review",
      "sourceLabel": "Recorded reproduction and observation-sensitivity reviews, July 2026; source review November 2026.",
      "body": [
        "The baseline output was recovered from the recorded inputs. A separate observation-sensitivity test weakened part of the financial claim.",
        "The research record retained both findings. The successful rerun established reproduction, while the separate test limited the conclusion that could be carried forward."
      ]
    }
  }
];
