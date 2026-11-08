export const systemGroups = [
  {
    "id": "market-evidence",
    "title": "Market evidence",
    "description": "Source acquisition and measurement, financially grounded hypotheses, later observations and alternative-data research."
  },
  {
    "id": "evaluation",
    "title": "Analysis and evaluation",
    "description": "Historical simulation, controlled replay, evidence scoring, options experiments and portfolio comparisons."
  },
  {
    "id": "research-operations",
    "title": "Research operations",
    "description": "Research task coordination, evidence and readiness review, and a native interface for human decisions."
  }
];

export const systemPages = [
  {
    "id": "data-factory",
    "slug": "data-measurement",
    "title": "Market Data & Measurement",
    "group": "market-evidence",
    "deck": "Turn acquired records into inputs whose meaning, timing and limitations can be inspected.",
    "purpose": "A market dataset can contain valid rows and still fail to measure what a research question requires. Acquisition, catalog and feature-and-label components organize source conventions and the distinction between information available at a decision and outcomes observed later.",
    "stage": "Implemented research components with recorded acquisition and data-quality investigations.",
    "components": [
      {
        "name": "Market-data acquisition and normalization",
        "role": "Retains raw responses, normalizes market observations and records coverage and freshness.",
        "state": "Recorded acquisition and research artifacts."
      },
      {
        "name": "Data catalog and admission",
        "role": "Matches a research request to compatible inputs and preserves adjustment information.",
        "state": "Implemented source and consumer-specific checks."
      },
      {
        "name": "Decision-time features and outcome labels",
        "role": "Separates decision-time information from later outcomes used to evaluate a question.",
        "state": "Implemented pipeline; additional feature definitions remain in development."
      },
      {
        "name": "Replay data cache and full-chain archive",
        "role": "Separates analysis-ready replay inputs from the archive retention needed to inspect coverage.",
        "state": "Source and test evidence; complete coverage is not established."
      }
    ],
    "flow": [
      {
        "label": "Specify the measurement",
        "description": "Start with the financial object and the history the comparison needs, rather than the existence of a file."
      },
      {
        "label": "Acquire and retain context",
        "description": "Keep source records, timing, coverage and adjustment conventions with the normalized inputs."
      },
      {
        "label": "Check measurement suitability",
        "description": "Determine whether the available fields satisfy this calculation, including compatibility between prices used together."
      },
      {
        "label": "Construct the analysis input",
        "description": "Keep features available at the decision separate from future labels and expose missing evidence."
      }
    ],
    "decisions": [
      {
        "decision": "Require compatible price conventions",
        "rationale": "Mixing differently adjusted fields can create an apparent return without a market mechanism.",
        "consequence": "The corrected return path requires compatible inputs and refuses an unsatisfied request."
      },
      {
        "decision": "Assess suitability for each consumer",
        "rationale": "Coverage alone does not show that a dataset measures the object a hypothesis needs.",
        "consequence": "Data availability and admissibility remain separate judgments."
      },
      {
        "decision": "Separate features from outcomes",
        "rationale": "Later information must not silently become part of an earlier decision.",
        "consequence": "The distinction remains part of the research specification."
      }
    ],
    "record": {
      "title": "Price-field incompatibility and corrected input requirements",
      "body": [
        "A placebo comparison challenged an apparent return pattern. Source review found incompatible corporate-action adjustments in prices used together. The useful result was tracing the apparent effect back to the meaning of the inputs.",
        "The corrected path requires compatible fields and the corrected evidence no longer supported the original pattern. This is a concrete connection between financial reasoning, a data requirement and a changed research conclusion."
      ],
      "kind": "Recorded data-integrity investigation",
      "sourceLabel": "Source review: November 2026; recorded price-convention and placebo analyses.",
      "limitation": "The original and corrected test populations differed. Their comparison is not a paired estimate of the correction alone, and the protection does not certify every data path."
    },
    "related": [
      {
        "href": "/work/data-mismatch/",
        "label": "Price-field compatibility and placebo testing"
      }
    ],
    "connections": [
      {
        "id": "hypothesis-discovery",
        "label": "Hypothesis Specification & Discovery",
        "reason": "The financial question determines the required measurement."
      },
      {
        "id": "forward-observer",
        "label": "Prospective Observation",
        "reason": "Later observations also need explicit coverage and source meaning."
      }
    ]
  },
  {
    "id": "hypothesis-discovery",
    "slug": "hypothesis-discovery",
    "title": "Hypothesis Specification & Discovery",
    "group": "market-evidence",
    "deck": "Make the economic explanation part of the research specification, before interpreting the output.",
    "purpose": "Discovery organizes proposed market relationships into questions that can be investigated. The framework asks what mechanism could produce an effect, who is on the other side, what constraint could sustain it and whether it remains practical at the intended scale. Those questions shape the research agenda.",
    "stage": "Implemented hypothesis records and review logic; template readiness varies.",
    "components": [
      {
        "name": "Hypothesis specifications and templates",
        "role": "Record the proposed mechanism, conditions, comparison and invalidation criteria.",
        "state": "Research implementation; some templates remain incomplete."
      },
      {
        "name": "Hypothesis review rubric",
        "role": "Considers counterparty incentives, constraints and capacity when prioritizing research.",
        "state": "Recorded design decisions incorporated into hypothesis review."
      },
      {
        "name": "Research routing and evidence classification",
        "role": "Classifies available evidence and routes the next research action.",
        "state": "Implemented orchestration, distinct from a completed financial finding."
      }
    ],
    "flow": [
      {
        "label": "Describe the proposed mechanism",
        "description": "Explain why an effect could exist, rather than beginning and ending with an attractive historical result."
      },
      {
        "label": "Identify competing explanations",
        "description": "Ask what else could produce the observation and what evidence would weaken the preferred account."
      },
      {
        "label": "Specify a comparison",
        "description": "Connect the claim to usable data, an appropriate alternative and an interpretation rule."
      },
      {
        "label": "Prioritize the next investigation",
        "description": "Use the review to decide what deserves more work, while keeping research priority separate from demonstrated opportunity."
      }
    ],
    "decisions": [
      {
        "decision": "Ask who is on the other side",
        "rationale": "A persistent opportunity needs an economic explanation for why another participant might accept the trade-off.",
        "consequence": "Counterparty incentives and constraints became explicit research questions."
      },
      {
        "decision": "Include capacity in the specification",
        "rationale": "An effect can be interesting in principle but impractical at the intended size.",
        "consequence": "Practical collection belongs alongside the proposed mechanism."
      },
      {
        "decision": "Remove a bias in the rubric",
        "rationale": "A framework focused only on selling risk can overlook reasons that protection might be underpriced.",
        "consequence": "The wording was broadened to examine long-convexity ideas as well as premium-selling ideas."
      }
    ],
    "record": {
      "title": "Revision of counterparty and capacity requirements",
      "body": [
        "I required hypotheses to explain their mechanism, counterparty, sustaining constraint and intended scale. This made economic reasoning part of the review process, rather than an explanation attached after a result appeared.",
        "I later broadened the counterparty rubric so it could examine underpriced tails and long-convexity ideas alongside premium selling. The revision changed the opportunity set the research process could consider; it did not establish that any particular opportunity was exploitable."
      ],
      "kind": "Recorded financial research-design decision",
      "sourceLabel": "Source review: November 2026; recorded hypothesis-framework decisions.",
      "limitation": "A structured card and a favorable review grade support research organization and priority. They do not establish a tradable return or show that every template is complete."
    },
    "related": [
      {
        "href": "/work/hypothesis-design/",
        "label": "Economic mechanism and hypothesis specification"
      }
    ],
    "connections": [
      {
        "id": "data-factory",
        "label": "Market Data & Measurement",
        "reason": "A proposed mechanism needs a suitable measurement."
      },
      {
        "id": "evidence-evaluation",
        "label": "Evidence Evaluation",
        "reason": "The resulting claim still needs tests capable of weakening it."
      }
    ]
  },
  {
    "id": "forward-observer",
    "slug": "prospective-observation",
    "title": "Prospective Observation",
    "group": "market-evidence",
    "deck": "Preserve later observations without confusing an observation session with an investment decision.",
    "purpose": "Historical analysis can suggest a question that needs later evidence. The prospective-observation workflow organizes observe-only sessions, captures relevant observations, joins outcomes after they become available and records what a session actually measured. An observation is useful only in relation to the question, its timing and its coverage.",
    "stage": "Implemented observation components with historical session records.",
    "components": [
      {
        "name": "Prospective observation sessions",
        "role": "Records observe-only sessions, observations and session manifests.",
        "state": "Implemented with historical records."
      },
      {
        "name": "Market-day controller and channels",
        "role": "Organize observation work and retain completion or missingness information.",
        "state": "Research components with differing integration states."
      },
      {
        "name": "Observation-to-evidence adapter",
        "role": "Reshapes observations and later outcomes for evidence evaluation.",
        "state": "Implemented; record construction still needs financial interpretation."
      },
      {
        "name": "Volatility research channels",
        "role": "Organizes volatility observations and diagnostics while retaining history and measurement limitations.",
        "state": "Recorded data and diagnostics; coverage remains a constraint."
      }
    ],
    "flow": [
      {
        "label": "Define the observation",
        "description": "Connect the requested evidence to a research question and distinguish it from information already consulted."
      },
      {
        "label": "Record the session",
        "description": "Preserve what was observed and the context needed to understand completion, coverage and missing measurements."
      },
      {
        "label": "Join later outcomes",
        "description": "Attach outcomes only after they become available, without treating each horizon as an independent event."
      },
      {
        "label": "Review the evidence",
        "description": "Ask whether the observations cover enough independent events and relevant conditions to change the claim."
      }
    ],
    "decisions": [
      {
        "decision": "Separate observation from action",
        "rationale": "Collecting evidence does not itself justify an investment decision.",
        "consequence": "The observer is described through research records and outcomes."
      },
      {
        "decision": "Preserve missingness",
        "rationale": "An elapsed schedule or an attempted collection is not the same as a completed financial measurement.",
        "consequence": "Absent evidence remains visible rather than becoming an assumed observation."
      },
      {
        "decision": "Count events rather than labels",
        "rationale": "Several outcome horizons from one observation share the same underlying event.",
        "consequence": "More rows do not automatically provide more independent support."
      }
    ],
    "record": {
      "title": "Prospective evidence coverage and completion",
      "body": [
        "The project has recorded observation sessions and adapters that connect their outputs to research evaluation. Their purpose is to retain an inspectable path from an observation to a later outcome, rather than silently replace a historical result with a stronger forward claim.",
        "Some later project records still contained missing measurements and incomplete readiness tracking. That distinction matters: a process can continue producing records while the financial evidence required for the original question remains incomplete."
      ],
      "kind": "Recorded observation and evidence review",
      "sourceLabel": "Source review: November 2026; recorded observation sessions and subsequent coverage records.",
      "limitation": "Historical session records do not establish uninterrupted current collection, sufficient independent future events or support for a particular financial claim."
    },
    "related": [
      {
        "href": "/work/narrowed-claim/",
        "label": "Reproduction and observation sensitivity"
      }
    ],
    "connections": [
      {
        "id": "data-factory",
        "label": "Market Data & Measurement",
        "reason": "Observation quality depends on source meaning and coverage."
      },
      {
        "id": "evidence-evaluation",
        "label": "Evidence Evaluation",
        "reason": "Outcome records still require interpretation and dependence checks."
      }
    ]
  },
  {
    "id": "simulation-replay",
    "slug": "simulation-replay",
    "title": "Historical Simulation & Replay",
    "group": "evaluation",
    "deck": "Change a research choice while keeping the baseline and the rest of the comparison inspectable.",
    "purpose": "Replay helps examine how a recorded outcome depends on a specific choice. The project includes historical option research, a counterfactual-analysis workflow for limited counterfactual changes and timing-sensitivity checks. Recovering the baseline is a separate task from determining whether a proposed change improves the financial outcome.",
    "stage": "Implemented research tools with recorded historical counterfactual studies.",
    "components": [
      {
        "name": "Historical options simulation and observe-only research",
        "role": "Models historical option outcomes under recorded selection, fill and exit assumptions.",
        "state": "Implemented and used in recorded research."
      },
      {
        "name": "Counterfactual analysis and controlled replay",
        "role": "Reuses a recorded simulator to compare limited changes with a recovered control.",
        "state": "Recorded counterfactual studies."
      },
      {
        "name": "Timing-sensitivity checks",
        "role": "Examines how observation timing and available samples affect the comparison.",
        "state": "Recorded diagnostic analyses."
      }
    ],
    "flow": [
      {
        "label": "Recover the control",
        "description": "Reproduce the baseline from recorded inputs before interpreting a changed result."
      },
      {
        "label": "Change a bounded choice",
        "description": "Keep the comparison focused so the question concerns the intended change rather than an entirely different experiment."
      },
      {
        "label": "Evaluate aggregate outcomes",
        "description": "Assess prevented losses together with missed winners and aggregate modeled results."
      },
      {
        "label": "Test observation sensitivity",
        "description": "Check timing and missing-observation sensitivity before treating the conclusion as stable."
      }
    ],
    "decisions": [
      {
        "decision": "Keep reproduction separate from improvement",
        "rationale": "Matching a baseline shows that the recorded calculation can be recovered.",
        "consequence": "An exact rerun does not settle the counterfactual question."
      },
      {
        "decision": "Evaluate the complete outcome distribution",
        "rationale": "A tighter loss rule can improve one exit subset while removing valuable participation elsewhere.",
        "consequence": "A favorable subset is read alongside aggregate results."
      },
      {
        "decision": "Test observation choices",
        "rationale": "A conclusion can depend on timing and which recorded cases remain available.",
        "consequence": "A sensitive claim is narrowed rather than treated as universally robust."
      }
    ],
    "record": {
      "title": "Subset and aggregate outcomes in controlled replay",
      "body": [
        "In a recorded exit-rule comparison, a tighter loss rule improved the average result among the cases that exited at that floor. It also truncated a large eventual winner and worsened the aggregate modeled result. The useful financial question was the total trade-off, not only the losses avoided.",
        "Separate timing checks showed that some conclusions depended on the observed timing and available samples. Another recorded review distinguished a successful reproduction from a robustness test that weakened part of the claim, preserving the two judgments independently."
      ],
      "kind": "Recorded historical replay and sensitivity studies",
      "sourceLabel": "Source review: November 2026; recorded replay and timing-sensitivity analyses.",
      "limitation": "These were bounded historical counterfactuals with small samples and modeled execution. They do not establish a generally optimal exit policy or an investment-performance record."
    },
    "related": [
      {
        "href": "/work/narrowed-claim/",
        "label": "Reproduction and observation sensitivity"
      }
    ],
    "connections": [
      {
        "id": "evidence-evaluation",
        "label": "Evidence Evaluation",
        "reason": "Reproduction and sensitivity answer different evidence questions."
      },
      {
        "id": "options-lab",
        "label": "Options Research & Experiment Design",
        "reason": "Broader experiments also need explicit models and complete outcomes."
      }
    ]
  },
  {
    "id": "evidence-evaluation",
    "slug": "evidence-evaluation",
    "title": "Evidence Evaluation",
    "group": "evaluation",
    "deck": "Distinguish a completed calculation, a reproducible result and a supported financial claim.",
    "purpose": "Evaluation connects recorded outcomes to the question they are supposed to answer. Evidence-scoring, selection-accounting and research-acceptance components consider costs, uncertainty, related observations and the history of the research process. The purpose is to retain the reasons a conclusion is accepted, narrowed or left unresolved.",
    "stage": "Implemented scoring and acceptance components with uneven integration and bounded recorded analyses.",
    "components": [
      {
        "name": "Evidence scoring",
        "role": "Evaluates registered outcomes, costs, tails and the adequacy of the evidence.",
        "state": "Core implementation and separate experimental modules."
      },
      {
        "name": "Selection accounting and lineage",
        "role": "Retains relationships among research attempts and examines selection uncertainty.",
        "state": "Implemented diagnostics; use varies across research paths."
      },
      {
        "name": "Research acceptance checks",
        "role": "Checks the supporting research package and review conditions before candidate acceptance.",
        "state": "Implemented acceptance checker; acceptance is a research judgment."
      },
      {
        "name": "Research records and source index",
        "role": "Preserves hypotheses, sources, interpretations, corrections and rejected findings.",
        "state": "Recorded research history requiring primary-artifact corroboration."
      }
    ],
    "flow": [
      {
        "label": "State the claim",
        "description": "Identify exactly which conclusion the comparison is meant to support."
      },
      {
        "label": "Inspect the evidence",
        "description": "Consider source quality, costs, assumptions, related observations and the search that produced the result."
      },
      {
        "label": "Separate the tests",
        "description": "Keep reproduction, sensitivity and economic support as distinct judgments."
      },
      {
        "label": "Preserve the decision",
        "description": "Retain the reason a claim was supported, narrowed or left open for further evidence."
      }
    ],
    "decisions": [
      {
        "decision": "Do not substitute one passed test for another",
        "rationale": "A calculation can reproduce while a timing change weakens its interpretation.",
        "consequence": "Each result remains visible in the research record."
      },
      {
        "decision": "Account for related evidence",
        "rationale": "Several labels or trials may depend on the same underlying event or research search.",
        "consequence": "Output volume is not treated as automatic replication."
      },
      {
        "decision": "Keep acceptance distinct from operation",
        "rationale": "A research package and an investment action require different evidence and review.",
        "consequence": "Candidate acceptance does not establish capital readiness."
      }
    ],
    "record": {
      "title": "Reproduction and sensitivity produced different conclusions",
      "body": [
        "A recorded review recovered the original output from its inputs. A separate test changed an observation choice and did not support the full claim. The conclusion was narrowed rather than allowing the successful reproduction to erase the unfavorable sensitivity result.",
        "This distinction is also useful for source research. A real, correctly dated source can fail to support the complete hypothesis attached to it. The workflow therefore records the outcome of a task separately from the strength of the financial conclusion."
      ],
      "kind": "Recorded evidence and claim review",
      "sourceLabel": "Source review: November 2026; recorded reproduction, sensitivity and evidence reviews.",
      "limitation": "The existence of a diagnostic does not show that every decision uses it. Experimental or synthetic analyses do not independently certify investment validity."
    },
    "related": [
      {
        "href": "/work/narrowed-claim/",
        "label": "Reproduction and observation sensitivity"
      },
      {
        "href": "/work/data-mismatch/",
        "label": "Price-field compatibility and placebo testing"
      }
    ],
    "connections": [
      {
        "id": "hypothesis-discovery",
        "label": "Hypothesis Specification & Discovery",
        "reason": "Evaluation needs a clearly bounded claim."
      },
      {
        "id": "governance",
        "label": "Research Governance",
        "reason": "The conclusion and the next permitted action remain separate."
      }
    ]
  },
  {
    "id": "options-lab",
    "slug": "options-research",
    "title": "Options Research & Experiment Design",
    "group": "evaluation",
    "deck": "Preserve the opportunity set and modeled outcomes, including the opportunities an experiment did not select.",
    "purpose": "The options-research workflow supports recorded-data experiments in option research. Its design retains selected and unselected opportunities, modeled fills and no-fills, lifecycle outcomes and relationships among observations. This makes the denominator of an experiment inspectable and helps distinguish many generated assignments from repeated evidence for a hypothesis.",
    "stage": "A recorded-data research campaign and separate synthetic acceptance tests.",
    "components": [
      {
        "name": "Options experiment design",
        "role": "Organizes experiments over a retained opportunity census and records the resulting assignments.",
        "state": "Implemented with a recorded market-data campaign."
      },
      {
        "name": "Fill and lifecycle models",
        "role": "Represent fills, no-fills, gaps and later outcomes within the experiment.",
        "state": "Research models with explicit assumptions."
      },
      {
        "name": "Experiment evidence scoring",
        "role": "Keeps dependence, selection and holdout considerations attached to the campaign record.",
        "state": "Recorded scoring; the model-guided branch remains an untrained placeholder."
      }
    ],
    "flow": [
      {
        "label": "Retain the opportunity census",
        "description": "Preserve the cases available to the experiment, not only the ones chosen."
      },
      {
        "label": "Record modeled participation",
        "description": "Distinguish a selected assignment from a modeled fill and keep no-fill outcomes."
      },
      {
        "label": "Follow the outcome",
        "description": "Track the lifecycle while preserving the assumptions behind its modeled financial result."
      },
      {
        "label": "Examine repeated evidence",
        "description": "Assess whether a research family has meaningful repetition across distinct observations."
      }
    ],
    "decisions": [
      {
        "decision": "Keep selected and unselected cases",
        "rationale": "Studying only chosen cases hides the opportunity set against which selection should be understood.",
        "consequence": "The campaign retains its denominator."
      },
      {
        "decision": "Model no-fills and gaps",
        "rationale": "Selection does not guarantee participation at an assumed price.",
        "consequence": "Execution assumptions remain part of interpreting the outcome."
      },
      {
        "decision": "Separate assignment volume from replication",
        "rationale": "Many isolated configurations can leave each research family with little repeated evidence.",
        "consequence": "The next-design question becomes how to repeat predefined families across dates."
      }
    ],
    "record": {
      "title": "Insufficient repetition within related experiment groups",
      "body": [
        "A recorded-data campaign preserved opportunities, assignments and dependence groupings. Review found that many one-off configurations left too little repeated evidence within individual scoring groups. The campaign was useful for identifying that experimental-design problem.",
        "The resulting question was how to repeat predefined families over distinct observations, rather than interpret the number of assignments as independent confirmation. Separate synthetic acceptance tests exercised system behavior; they were not combined with the recorded-data campaign as market evidence."
      ],
      "kind": "Recorded experiment-design review",
      "sourceLabel": "Source review: November 2026; recorded-data campaign and separate synthetic test records.",
      "limitation": "Model assumptions and dependence groupings still require scrutiny. A preserved receipt does not independently validate every source record or modeled financial outcome."
    },
    "related": [
      {
        "href": "/work/narrowed-claim/",
        "label": "Reproduction and observation sensitivity"
      }
    ],
    "connections": [
      {
        "id": "simulation-replay",
        "label": "Historical Simulation & Replay",
        "reason": "A modeled outcome needs an explicit comparison and execution assumptions."
      },
      {
        "id": "evidence-evaluation",
        "label": "Evidence Evaluation",
        "reason": "Repeated evidence matters more than generated output volume."
      }
    ]
  },
  {
    "id": "portfolio-research",
    "slug": "portfolio-analysis",
    "title": "Portfolio Analysis",
    "group": "evaluation",
    "deck": "Connect investment products and risk controls to the objective they are meant to serve.",
    "purpose": "Portfolio research makes the trade-off explicit: protection, participation, allocation tracking and trading costs do not always improve together. The project includes an eight-fund investment-product comparison, historical studies of portfolio controls and report-only checks that connect portfolio state to research and review.",
    "stage": "Recorded investment comparisons and historical control studies; reporting components have differing maturity.",
    "components": [
      {
        "name": "Investment-product research",
        "role": "Compares funds by portfolio role, fees, liquidity and the history available for risk assessment.",
        "state": "Recorded eight-ETF study."
      },
      {
        "name": "Portfolio-control studies",
        "role": "Compares volatility targeting, drawdown controls, rebalancing bands and calendar alternatives.",
        "state": "Recorded historical studies under transaction-cost assumptions."
      },
      {
        "name": "Portfolio monitoring and reconciliation",
        "role": "Reports allocation drift, marks, cash differences and policy integrity for review.",
        "state": "Report-only probes; some risk measures are simplified proxies."
      }
    ],
    "flow": [
      {
        "label": "Define the portfolio objective",
        "description": "State whether the question concerns cash management, income, growth, protection or allocation tracking."
      },
      {
        "label": "Choose a suitable comparison",
        "description": "Assess products within their roles and controls against explicit objectives."
      },
      {
        "label": "Evaluate portfolio trade-offs",
        "description": "Consider growth, drawdown, history coverage, turnover and costs together."
      },
      {
        "label": "Retain the decision",
        "description": "Record what met the study criteria and which assumptions limit the conclusion."
      }
    ],
    "decisions": [
      {
        "decision": "Compare products within their roles",
        "rationale": "A cash-like holding and an equity-income product answer different portfolio questions.",
        "consequence": "The comparison avoids treating their historical outcomes as interchangeable."
      },
      {
        "decision": "Make missing history explicit",
        "rationale": "A short post-inception record can omit conditions relevant to a risk decision.",
        "consequence": "An explicit class-analog scenario informed the ETF risk assessment."
      },
      {
        "decision": "Assess the full control objective",
        "rationale": "A lower drawdown can come with less growth or more trading.",
        "consequence": "Protection is evaluated alongside participation, tracking and turnover."
      }
    ],
    "record": {
      "title": "Historical rebalancing criteria under transaction-cost assumptions",
      "body": [
        "The portfolio-control study compared 26 configurations under three transaction-cost assumptions. A rebalancing band met the study's historical allocation-tracking and turnover criteria. This was a result about a defined portfolio objective, rather than a claim that one control was universally best.",
        "The eight-ETF comparison addressed a different question. It distinguished cash-management, dividend-equity and option-income roles and incorporated gaps in fund history into risk scenarios. Together, the studies show how the intended portfolio function changes the comparison and the interpretation."
      ],
      "kind": "Recorded portfolio and investment-product research",
      "sourceLabel": "Source review: November 2026; recorded portfolio-control and eight-fund comparison studies.",
      "limitation": "Historical simulations used simplified price, cash-return and execution assumptions. Fund histories and class analogs also limit inference; these studies do not establish future performance or an optimal allocation."
    },
    "related": [
      {
        "href": "/work/portfolio-controls/",
        "label": "Portfolio risk-control comparison"
      },
      {
        "href": "/work/etf-comparison/",
        "label": "Income and cash-management ETF comparison"
      }
    ],
    "connections": [
      {
        "id": "data-factory",
        "label": "Market Data & Measurement",
        "reason": "The investment comparison depends on compatible history and clear inputs."
      },
      {
        "id": "evidence-evaluation",
        "label": "Evidence Evaluation",
        "reason": "Meeting a historical criterion is a bounded research result."
      }
    ]
  },
  {
    "id": "research-executive",
    "slug": "research-orchestration",
    "title": "Research Orchestration",
    "group": "research-operations",
    "deck": "Organize a research question into bounded work while preserving sources, disagreements and revisions.",
    "purpose": "Research orchestration connects research questions, dependent tasks, budget decisions and evidence records. Its role is to preserve the path from the original question to the current conclusion, including unsuccessful work and reasons to change the plan. Completing an assignment and establishing a financial claim remain different outcomes.",
    "stage": "Implemented research-assignment workflow with recorded demonstrations and distinct evidence-review outcomes.",
    "components": [
      {
        "name": "Task orchestration",
        "role": "Stores bounded research assignments, task routes, budget decisions, revisions and recovery state.",
        "state": "Implemented with recorded demonstrations."
      },
      {
        "name": "Evidence records",
        "role": "Associate source-specific claims, competing evidence and the current research question.",
        "state": "Implemented records and reviewed examples."
      },
      {
        "name": "Local analysis capability",
        "role": "Allows a research task to contribute analysis alongside source-based evidence.",
        "state": "Implemented capability; output still requires review."
      }
    ],
    "flow": [
      {
        "label": "Specify the research question",
        "description": "State the research question and the bounds of the work before dividing it into tasks."
      },
      {
        "label": "Route dependent work",
        "description": "Keep task relationships, required inputs and budget decisions attached to the research assignment."
      },
      {
        "label": "Compare the evidence",
        "description": "Retain source claims and competing information without equating successful retrieval with support."
      },
      {
        "label": "Revise the plan or conclusion",
        "description": "Preserve why the question changed, what remains unresolved and what requires human review."
      }
    ],
    "decisions": [
      {
        "decision": "Separate task and research outcomes",
        "rationale": "A task can execute correctly and return evidence against the hypothesis.",
        "consequence": "A completed assignment cannot silently become a successful financial conclusion."
      },
      {
        "decision": "Preserve competing evidence",
        "rationale": "A source may support one part of a claim while leaving another unresolved.",
        "consequence": "The research record retains the scope of support."
      },
      {
        "decision": "Retain unsuccessful work",
        "rationale": "Failed attempts affect the cost and history of research even when they produce no usable conclusion.",
        "consequence": "The workflow can be evaluated beyond its successful outputs."
      }
    ],
    "record": {
      "title": "Source validity and hypothesis support are separate",
      "body": [
        "Recorded demonstrations included successful factual tasks and conclusions that failed evidence review. A genuine, correctly dated source did not necessarily support the full hypothesis attached to it. The system therefore needed to preserve what the source actually established.",
        "The design makes an unresolved or rejected conclusion a legitimate outcome of completed work. Source research, local analysis and synthesis can contribute different evidence to the same research question, while the record retains the question, task history and reasons for revision."
      ],
      "kind": "Recorded research-workflow and evidence review",
      "sourceLabel": "Source review: November 2026; recorded task-orchestration demonstrations and evidence reviews.",
      "limitation": "Successful factual demonstrations do not establish investment-thesis quality. Separate AI review sessions are not independent expert verification, and heuristic confidence is not a calibrated investment probability."
    },
    "related": [
      {
        "href": "/notes/safe-refusal/",
        "label": "A completed task and a research result are separate outcomes"
      }
    ],
    "connections": [
      {
        "id": "narrative-pilot",
        "label": "Information Timing & Coverage",
        "reason": "Information gathering needs coverage, timing and research-cost discipline."
      },
      {
        "id": "operator-console",
        "label": "Research Monitoring & Review",
        "reason": "Research-assignment state and unresolved questions need to reach human review."
      }
    ]
  },
  {
    "id": "narrative-pilot",
    "slug": "information-timing",
    "title": "Information Timing & Coverage",
    "group": "market-evidence",
    "deck": "Evaluate whether an information source earns its cost, coverage and place in the research process.",
    "purpose": "The study collected public social and news material and compared its coverage and timing with market events under investigation. The financial question was whether the information arrived early enough, covered the relevant universe and added useful evidence. Successful collection alone could not answer those questions.",
    "stage": "Recorded study and coverage review; selective follow-up specified rather than fully implemented.",
    "components": [
      {
        "name": "Information-source collection",
        "role": "Captures public social and news records for a bounded study.",
        "state": "Historical capture implementation; selective follow-up remains in development."
      },
      {
        "name": "Source-coverage review",
        "role": "Examines record quality, source outages, universe overlap and information timing.",
        "state": "Recorded analysis and independently recounted capture records."
      },
      {
        "name": "Selective follow-up specification",
        "role": "Narrows sources and defines collection costs and stop-or-continue criteria.",
        "state": "Follow-up design includes collection budgets; collection integration remains in development."
      }
    ],
    "flow": [
      {
        "label": "Capture the information",
        "description": "Retain records and fetch failures so collection quality can be examined."
      },
      {
        "label": "Check the coverage",
        "description": "Compare the observed information universe with the market question it is supposed to address."
      },
      {
        "label": "Examine the timing",
        "description": "Ask whether information preceded the event rather than merely describing it afterward."
      },
      {
        "label": "Evaluate the need for further study",
        "description": "Specify narrower sources, costs and continuation criteria based on the observed weaknesses."
      }
    ],
    "decisions": [
      {
        "decision": "Distinguish clean capture from useful evidence",
        "rationale": "Well-formed records can still arrive too late or cover the wrong universe.",
        "consequence": "Collection quality and financial usefulness were reviewed separately."
      },
      {
        "decision": "Make coverage failures visible",
        "rationale": "Source saturation and outages change what an apparent absence of information means.",
        "consequence": "Missing coverage became part of interpreting the study."
      },
      {
        "decision": "Specify a more selective follow-up",
        "rationale": "Broader collection is not automatically the most informative use of research time and money.",
        "consequence": "The redesign introduced narrower sources and explicit cost and continuation criteria."
      }
    ],
    "record": {
      "title": "Coverage findings and revised collection specification",
      "body": [
        "The recorded study found no persuasive early information pattern within its bounded analysis. Universe mismatch, saturation and outages limited what the captured material could say about the market events being studied. A subsequent recount supported the integrity of the capture records, not a prediction claim.",
        "The follow-up specification narrowed the sources, moved collection earlier and added cost and stop-or-continue criteria. This is a research-design outcome: the study changed the next question and collection plan. The specified improvements should not be represented as an already deployed predictive engine."
      ],
      "kind": "Recorded alternative-data study and follow-up design",
      "sourceLabel": "Source review: November 2026; recorded study, coverage analysis and follow-up specification.",
      "limitation": "A short historical study cannot settle whether narratives generally lead prices. The selective redesign remains partly specified, so realized savings or predictive success are not established."
    },
    "related": [
      {
        "href": "/notes/safe-refusal/",
        "label": "A completed task and a research result are separate outcomes"
      }
    ],
    "connections": [
      {
        "id": "research-executive",
        "label": "Research Orchestration",
        "reason": "Source gathering contributes evidence to a bounded research question."
      },
      {
        "id": "data-factory",
        "label": "Market Data & Measurement",
        "reason": "Coverage and missingness matter alongside captured content."
      }
    ]
  },
  {
    "id": "governance",
    "slug": "research-governance",
    "title": "Research Governance",
    "group": "research-operations",
    "deck": "Keep research conclusions, system readiness and the next human decision distinct.",
    "purpose": "Governance components organize evidence requirements, research state and readiness for subsequent work. The important distinction is practical: a specified design, an implemented component, a deployment and an observed run are different forms of evidence. A successful research task does not remove the need for the relevant review.",
    "stage": "Implemented research and readiness controls with incomplete operating integrations.",
    "components": [
      {
        "name": "Research routing and evidence classification",
        "role": "Classifies evidence and routes the next research action.",
        "state": "Implemented research orchestration."
      },
      {
        "name": "Research monitoring",
        "role": "Detects stale sources, missing consumers and inconsistent research registrations.",
        "state": "Implemented components and recorded findings; current liveness was not remeasured."
      },
      {
        "name": "Research progress monitoring",
        "role": "Uses knowledge artifacts to examine research progress and stagnation.",
        "state": "A landed implementation and configuration exist; installed operation was not established."
      },
      {
        "name": "Readiness and authority model",
        "role": "Separates intended design, implementation and evidence of actual operation.",
        "state": "Implemented contracts with differing completion states."
      },
      {
        "name": "Research specifications and staged work",
        "role": "Preserves research directions, handoffs, queued work and the system inventory.",
        "state": "Recorded governance artifacts; some machinery remains inactive."
      },
      {
        "name": "Service monitoring",
        "role": "Organizes freshness checks, watchdogs, drills, incident findings and escalation.",
        "state": "Mixed implemented and contract-only components; current liveness was not remeasured."
      }
    ],
    "flow": [
      {
        "label": "Identify the required evidence",
        "description": "State what must be known for the next research or operating decision."
      },
      {
        "label": "Compare records with requirements",
        "description": "Look for stale inputs, missing consumers, inconsistent state and unresolved readiness work."
      },
      {
        "label": "Preserve the finding",
        "description": "Keep the reason for a block or required review attached to the relevant work."
      },
      {
        "label": "Present findings for review",
        "description": "Present what is known and what remains unresolved without allowing completion language to replace evidence."
      }
    ],
    "decisions": [
      {
        "decision": "Keep readiness states distinct",
        "rationale": "Source code can exist without a verified deployment or an observed successful run.",
        "consequence": "Implementation is not presented as proof of current operation."
      },
      {
        "decision": "Treat research completion as its own outcome",
        "rationale": "A completed calculation can leave the financial question unanswered.",
        "consequence": "Research records do not confer broader readiness by themselves."
      },
      {
        "decision": "Examine progress through evidence",
        "rationale": "Repeated activity can preserve a schedule without resolving the underlying question.",
        "consequence": "Progress review considers knowledge artifacts and unresolved work."
      }
    ],
    "record": {
      "title": "Readiness classification and unresolved integration",
      "body": [
        "The readiness model distinguishes intended design, implementation, deployment and observed operation. Evidence in one category cannot silently stand in for the others. This gives a review a specific question: what has actually been demonstrated for the next step?",
        "Research monitoring contributes findings about stale sources, missing consumers and inconsistent registrations. The research-progress monitoring implementation adds a way to examine research progress through knowledge artifacts. Its source and configuration exist, while installed operation remains a separate readiness question."
      ],
      "kind": "Source and readiness review",
      "sourceLabel": "Source review: November 2026; component inventory and recorded readiness distinctions.",
      "limitation": "Registry labels and configured schedules do not establish current runtime health. Research acceptance and software checks do not establish live investment readiness."
    },
    "related": [
      {
        "href": "/notes/safe-refusal/",
        "label": "A completed task and a research result are separate outcomes"
      }
    ],
    "connections": [
      {
        "id": "evidence-evaluation",
        "label": "Evidence Evaluation",
        "reason": "The supporting claim must remain distinct from the next action."
      },
      {
        "id": "operator-console",
        "label": "Research Monitoring & Review",
        "reason": "Findings and missing evidence need a readable human review surface."
      }
    ]
  },
  {
    "id": "operator-console",
    "slug": "research-monitoring",
    "title": "Research Monitoring & Review",
    "group": "research-operations",
    "deck": "Present research assignments, evidence and source state for human review.",
    "purpose": "The native research interface presents research assignments, evidence and source state through a read-only projection. The design distinguishes fresh, stale, unavailable and fixture information so a reader can understand what is being shown. A recorded intention and an executed action are also separate outcomes.",
    "stage": "Native interface source and recorded render and test artifacts.",
    "components": [
      {
        "name": "Native research interface",
        "role": "Presents research assignments, evidence and source state for review.",
        "state": "Native interface source and recorded render artifacts."
      },
      {
        "name": "Read-only projection",
        "role": "Projects underlying research records into the interface without turning a view into an action.",
        "state": "Implemented projection components."
      },
      {
        "name": "Decision-intent records",
        "role": "Retains a record of an operator intention and its associated review context.",
        "state": "Receipt service records intent rather than executing it."
      },
      {
        "name": "Source freshness and evidence state",
        "role": "Distinguishes stale, unavailable and fixture state from usable current records.",
        "state": "Implemented source and recorded interface tests."
      }
    ],
    "flow": [
      {
        "label": "Read the underlying state",
        "description": "Use assignment, evidence and source records as inputs to the projection."
      },
      {
        "label": "Preserve the state distinction",
        "description": "Keep missing, stale and fixture information identifiable instead of presenting a uniform appearance of certainty."
      },
      {
        "label": "Present the research context",
        "description": "Show the question, recorded evidence and unresolved work in a surface intended for human review."
      },
      {
        "label": "Record the intention",
        "description": "Retain the operator decision record while keeping it separate from execution."
      }
    ],
    "decisions": [
      {
        "decision": "Use a read-only projection",
        "rationale": "Inspecting evidence and changing an operating system are different tasks.",
        "consequence": "The review surface is described through what it displays and records."
      },
      {
        "decision": "Make state quality visible",
        "rationale": "A polished interface can otherwise make stale or unavailable information look current.",
        "consequence": "Freshness, unavailability and fixture status remain meaningful distinctions."
      },
      {
        "decision": "Separate intent from execution",
        "rationale": "A receipt proves that an intention was recorded, not that a downstream action occurred.",
        "consequence": "Decision history is not presented as an execution record."
      }
    ],
    "record": {
      "title": "Research-state projection and decision-intent records",
      "body": [
        "The project contains native interface source, a read-only projection and recorded render and test artifacts. Its role is to make research state accessible to a human reader, including research questions, evidence and the quality of the available source state.",
        "The decision-intent record service is a particularly important boundary. It records intent; it does not itself execute the action. The public explanation can therefore show how a finding reaches review without implying that an attractive interface establishes an autonomous investment operation."
      ],
      "kind": "Recorded interface and source review",
      "sourceLabel": "Source review: November 2026; native research interface source and recorded interface artifacts.",
      "limitation": "Source and render artifacts establish interface work, not current service availability. Fixture displays and recorded intentions must remain distinct from observed operating outcomes."
    },
    "related": [
      {
        "href": "/notes/safe-refusal/",
        "label": "A completed task and a research result are separate outcomes"
      }
    ],
    "connections": [
      {
        "id": "research-executive",
        "label": "Research Orchestration",
        "reason": "Research history and unresolved questions supply the review context."
      },
      {
        "id": "governance",
        "label": "Research Governance",
        "reason": "A readable state still requires the appropriate evidence and review."
      }
    ]
  }
];
