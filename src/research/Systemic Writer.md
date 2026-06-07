# Designing Toward a Theory: An AI-Assisted Writing System as Design Experiment

**Kurt Rowley**  
Applied Systems Scientist | Integrated Systemics R&D

---

## What This Is

This is a case study of a thirteen-month design experiment in applied systems science — not a software project, though software is what it produced. The distinction matters. A software project aims to ship a working product. A design experiment aims to learn something true about a complex domain through the process of building something. The product that emerges is both the output and the evidence: evidence that the understanding it embodies is sufficiently accurate to function in real-world conditions.

The domain in this case is expert writing — specifically, the cognitive structure of the long-form writing process and the question of what a software environment would look like if it were built around that structure rather than around the easier-to-automate activity of text generation. The experiment ran from May 2025 through June 2026 and produced approximately thirty discrete software iterations before arriving at a production-targeted implementation. What follows is a structured account of what the experiment did, what it found, and what those findings mean.

The methodological framing is the same one that has governed ISRD's applied systems science work across domains: evolutionary design — iterating toward fit states through structured cycles of variation, testing, and selection, rather than specifying a solution in advance and deploying it at scale. This case study belongs to the same lineage as ISRD's work in complex medical illness, instructional systems design, and organizational dynamics. The isomorphism across those domains is not metaphorical. The same underlying dynamics — attractor states that resist change, feedback loops that maintain them, leverage points that can shift them when correctly identified — operate whether the complex system in question is a regulatory biology, a training and development program, or the cognitive architecture of a practicing writer.

---

## Background and Lineage

The experiment grows out of a long-standing applied systems science practice focused on solving hard human problems through design experiments, iterative modeling, and functional translation from theory into praxis. Over the course of a career working at the boundary between conceptual systems thinking and real-world implementation — from educational systems and expert instructional design to medical systems analysis — a consistent pattern emerged: the hardest problems in complex domains are not primarily solved by knowing more about the domain. They are solved by modeling the domain's dynamics accurately enough to identify where an intervention can create durable change, rather than surface-level displacement.

Writing presents this problem in a particularly sharp form. Writing instruction is ancient — Aristotle's *Poetics* is still assigned in MFA programs — and extensive. The craft advice the tradition contains is, for the most part, observationally reliable. It describes what works. But it almost never explains why. When you know what works but not why, you can follow a rule but cannot adapt it. You can reproduce a technique in the context where someone else found it useful, but you cannot judge whether it applies to your situation.

Systems science offers a different entry point. A written work, viewed through an attractor-basin lens, is an intervention in the reader's attractor landscape: it either shifts a stable state — reorganizes a conceptual framework, simulates an emotional experience, activates a latent pattern of recognition — or it fails to do so, regardless of its surface quality. This reframe transforms the design question. The problem is not how to generate better text. It is how to model the writing process as a complex system — with identifiable stages, leverage points, and feedback requirements — and build a software environment that scaffolds that structure in a way that preserves human judgment at every consequential decision point.

The earlier work on adaptive writing tutors and instructional systems design established the theoretical orientation. The experiment described here applied it to the current AI era: not AI as a writing generator, but AI as a structured process facilitator.

---

## The Design Problem

Expert writing is a complex cognitive process that resists simple automation. Writers do not primarily lack words. They lack structured process: a way to move from raw material through successive stages of understanding, organization, and articulation without losing their voice or judgment to the tool. The design question was whether a software environment could scaffold that process in a way that genuinely improves writing outcomes, while keeping the human writer as the primary decision-maker at every stage.

This is a harder problem than it appears, because the dominant AI writing tools are built around the opposite assumption. Most of what the current generation of AI writing software does is generate text — quickly, fluently, and without regard to whether the writer understands what the generated text is doing or why. The friction that tools like these remove is often the friction that produces quality: the struggle to find the right word is sometimes the evidence that the writer has not yet found the right idea. A tool that removes the struggle before the idea is found does not help the writer. It substitutes for them.

The experiment was an attempt to build something genuinely different: a phase-gated workflow engine in which the AI's role is to facilitate each stage of a structured writing process — surface material, identify patterns, propose structure, generate drafts — while the writer retains explicit approval authority before the system advances. The AI proposes. The human decides. The system advances only on human confirmation.

This is not primarily a safety architecture, though it functions as one. It is the correct cognitive model for the writing process itself: writing is a sequence of decisions under uncertainty, and a tool that automates past decision points removes the very judgment that produces quality.

---

## Method

The method was iterative design experimentation across approximately thirty discrete software implementations over thirteen months. Each iteration served simultaneously as a functional prototype and a research instrument. Implementations were evaluated in realistic writing conditions — actual long-form projects, multiple genres, real writing problems — not synthetic benchmarks. Failures were productive: each dead end surfaced a constraint that shaped the next cycle.

This is the core discipline of evolutionary design as ISRD practices it. The reason evolutionary design has proven so functionally powerful — in software engineering, instructional design, biological systems, and organizational development — comes down to a property of incremental change that full-specification approaches lack: when you change one thing at a time and test it under real conditions, failures are small, localized, and analyzable. You can see what broke and why. You can adapt your architecture based on what you learned without having to dismantle an entire construction. A large, fully-specified system that fails — and in complex environments, it almost always eventually does — produces expensive, entangled failure with an unclear path to recovery. ISRD applies the same lesson to intervention design that software engineering learned from waterfall's limits: small, testable changes; honest measurement; disciplined revision; and the patience to let the design improve through contact with reality.

Three types of design decisions operated simultaneously throughout the experiment and resolved at different rates — a pattern worth naming explicitly, because it is characteristic of design experiments in complex domains and because misreading which type of question you are answering is a common source of stalled iteration.

Technical decisions — which UI framework, what architecture, how to integrate AI backends — resolved relatively early through direct testing. The wrong choices were quickly visible as constraints, and the right choices were confirmed by the absence of constraint.

Functional decisions — what the tool must actually do, how data flows through it, what an artifact is and how it differs from a chat message — resolved through mid-cycle iteration. These required working with real writing projects before the right answers became visible.

Theoretical decisions — what model of expert writing should govern the system, what the phases are, what the writer is actually doing at each stage — resolved latest, through accumulated understanding. The theoretical framework was not fully stable until the final third of the experiment. This is the characteristic asymmetry of design experiments in complex domains: the hardest question, the one most consequential for everything else, is also the one that takes longest to answer.

---

## What the Iterations Revealed

### Cycle One: Stack and Scaffold (May–November 2025)

The experiment began with ArmChairWriter — an initial scaffolding effort that established the basic framing of a personal writing environment while revealing that adapting an existing tool was not the right path. The first serious Python implementation, SystemicWriter (py original), introduced the name that would eventually stick and established what would prove to be a durable architectural principle: the AI backend as a module separable from the UI. Tkinter was the initial UI stack; its limitations became visible quickly.

The Scriberator series that followed — three numbered iterations using PySimpleGUI — introduced persistent JSON-based project files, a meaningful AI chat layer, and eventually a clean module decomposition: independent panels sharing a singleton project manager. By Scriberator 13, a README documented the architecture explicitly, and the principle of module independence — each component runnable standalone for testing — was confirmed as the right structural pattern.

The finding from this cycle was that the module plugin architecture, independent panels sharing a singleton project manager, was correct from the moment it was found. It was never revisited. The technical architecture question resolved first and early, as expected.

### Cycle Two: Functional Inventory (November 2025–January 2026)

The ChatWriter and BookWriter iterations refined the functional inventory in ways that were not predictable in advance. The critical finding was a distinction that seems obvious in retrospect but was not obvious from the outside: artifacts — AI-generated content objects that persist, can be versioned, and can be approved or rejected — are a fundamentally different kind of data from chat messages. Chat is conversational and ephemeral. Artifacts are structured, persistent, and consequential. A writing tool that organizes its data around chat has the wrong data model. A writing tool that organizes its data around artifacts has the right one.

This finding shaped every subsequent iteration. The functional question — what is the central data type the tool must manage? — was answered by working with real writing projects until the right answer became undeniable. The answer was artifacts, not conversations, not files.

The RAG (Retrieval-Augmented Generation) question resolved during this cycle as well: external document integration was feasible and valuable, but as a module, not as a foundation. Source document management needed its own layer, distinct from both the AI backend and the artifact store. The markdown renderer recurred as an independent necessity in iteration after iteration — eventually becoming a named, reusable component rather than code that got rewritten each time.

### Cycle Three: Agent and Process Architecture (January–February 2026)

Writing WCA (Writing Cognitive Architecture) introduced the first formal multi-agent decomposition: named specialist agents for thematic analysis, structural analysis, and orchestration, with a Director Console as the human-in-command UI. Writing CVO (Cognitive Vector Ontology) explored semantic embedding and ontology-driven content organization. ABC Writer externalized system prompts as JSON configuration for the first time, separating process knowledge from code.

The agent decomposition was conceptually sound and technically feasible. What it revealed was that multi-agent systems need a stable governing process model to sequence them — without that model, the agents are capable components without a coherent workflow to organize them. The conceptual architecture had outrun the theoretical framework. It was the first clear signal that the theoretical question — what model of expert writing governs the system — was the binding constraint.

Externalizing system prompts as JSON configuration proved immediately and permanently valuable. The move separated what the tool knows from what the tool does. It made process knowledge auditable, portable, and improvable without code changes. This architectural decision was carried forward without revision.

### Cycle Four: UI Stack Resolution and First Mature Version (February–March 2026)

Author Flower was the first PySide6 iteration. The stack change was immediately decisive. The UI quality and widget capability limitations of PySimpleGUI dissolved. The interface that the experiment had been approximating for months was now straightforwardly buildable. This was the kind of resolution that feels obvious in retrospect and is genuinely not predictable from the outside: the wrong stack was not a bad choice, it was a necessary path. The limitations that eventually made PySide6 clearly right were not visible until the alternatives had been explored fully enough to make the comparison conclusive.

Author Flower also introduced the first named writing methodology embedded in the tool: the Dual Emotional Journey, a framework for fiction that organized the writing process around two parallel emotional trajectories — the protagonist's and the reader's. This was significant not because the specific framework proved permanent, but because it established the principle: the tool should embody a theory of writing, not just provide general AI assistance.

Writing Yodel (v6) was the most feature-complete pre-final iteration. It introduced the Cognitive Task Generator — a multi-phase AI execution engine with skill schemas, artifact versioning, human-review checkpoints, and session resilience (crash recovery with state restoration). The skill library externalized process knowledge into portable, authorable schemas: structured specifications of what the AI should do at each phase, how the output should be formatted, and what the human review checkpoint should assess.

The CTG was the first functional realization of the core thesis. Phase gates with explicit human approval before system advancement worked as intended. The skill library worked as intended. Session resilience was a real-world requirement that had not been anticipated at the design stage — a finding available only through realistic testing conditions. Writing Yodel was architecturally mature. It was also complex enough to warrant a fresh, disciplined restructuring before being treated as a product.

### Cycle Five: Theory Consolidation (April 2026)

The web app investigation (Writing Web App 01) produced the clearest framework documentation to date. The ARCT+CTA framework for fiction and the REF framework for nonfiction — explicit, phase-gate orchestration protocols specifying what the AI does and what the writer decides at each stage — were articulated in sufficient detail to constitute a genuine specification rather than a design aspiration. The SaaS evaluation that accompanied this cycle concluded that the desktop-first path was correct for a single-user, privacy-sensitive writing environment. The web app was set aside. The frameworks were carried forward.

Writing Zoo researched Human-in-the-Loop (HITL) agent architecture explicitly: pause-and-resume patterns, approval gate design, task state machines. The HITL architecture — agent proposes, human approves, system resumes — was confirmed as correct. The principle that the human is always the primary decision-maker was formalized not as a constraint on the AI but as the correct model of the writing process itself.

The ReaderFirst Writing System iterations were the theoretical inflection point of the entire experiment. Nine software sub-versions appeared in a single day — a rate that is itself diagnostic. When theory is clear and stable, implementation accelerates sharply. The binding constraint through most of the experiment had been theoretical: the right model of writing had not yet been found. When it was found, the implementation bottleneck dissolved.

What crystallized during this cycle was a complete theoretical account of what long-form writing is actually doing. The Reader-First model frames a piece of writing not as content delivery but as an intervention in the reader's attractor landscape — an attempt to shift a stable cognitive or emotional state toward a different one. This framing had been implicit in earlier iterations. Here it was made explicit, operational, and comprehensive enough to govern every phase of the software's design.

The model distinguishes three types of literature by the mechanism through which each produces reader change: nonfiction operates through schema reorganization — rebuilding the conceptual framework the reader uses to interpret a domain; fiction operates through identity simulation — transporting the reader into a character's experience under narrative pressure; and transformation literature operates through symbolic isomorphism — activating latent recognition patterns the reader already carries but has not yet been able to articulate. Each type has its own intervention logic, its own validity criterion, and its own craft strategy. The software's phase-gate architecture needed to account for all three, with explicit fork points wherever the types diverge.

The feedback-loop analysis that emerged alongside this framework was equally consequential for the software design. Oral tradition, the model argues, operated as a closed feedback system: a performer read the audience in real time and adjusted continuously. Written literature broke that loop in two ways — by separating production from the reader's encounter, and by standardizing the text so it could not adapt to individual reader variation. The software's role, properly understood, is to partially restore that lost feedback function: the explicit reader model substitutes for live audience observation during writing; the phase-gate structure with human review at each transition provides a form of deliberate mid-course correction that pure generative AI cannot support; and the audit and monitoring phases after publication treat reader response as a design input rather than an afterthought.

### Cycle Six: Production Implementation (May–June 2026)

The React implementation (Systemic Writer React) served primarily as a theoretical pressure test — forcing the accumulated framework into a formal specification by building against it. What emerged from that process was not a deployable product but something more valuable at this stage: two mature versions of *The Reader-First Writing System*, a full theoretical and methodological work addressed to practitioners.

Version 4 is the general writing version. It grounds the Reader-First methodology in four core systems science concepts — attractors, feedback loops, sensitivity to initial conditions, and fractal structure — and walks through a 10-phase process organized in two design phases preceding craft (Intervention Analysis, Diffusion Architecture) and eight craft phases thereafter (Reader Modeling, Research, Architecture, Prototype, Draft, Audit, Publish/Monitor/Maintain, and Film/Video Adaptation). The work is addressed to any serious long-form writer seeking a principled framework for designing reader experience rather than simply producing text.

Version 5 is the systems-science-practitioner version. It expands the conceptual foundation from four core concepts to nine, organized in a three-tier framework: the first tier describes what kind of thing a complex system is (attractors, feedback, fractal structure, networks); the second tier describes how complex systems change (sensitivity to initial conditions, self-organization, thresholds); the third tier provides the operational practitioner concepts (evolutionary pathways, resilience, and how to read craft advice through a systems lens). Four new chapters are added to Part One; the 10-phase methodology carries forward unchanged. This version is addressed specifically to practitioners working in applied intervention contexts — health, education, organizational change, social systems — who need writing to function not as general communication but as a precision instrument for attractor-state change. An ISRD Practitioner appendix specifies how the Reader-First methodology integrates with ISRD's broader six-phase intervention cycle.

Both versions treat AI as a phase-appropriate support layer — addressed in appendices — rather than as the organizing principle. The method works without AI. What AI does is reduce the cognitive load on the analytical phases and make the reader modeling and research phases more practically tractable for solo practitioners. The AI's role is always to facilitate phase work; the phase-gate structure, with human decisions at each transition, remains the governing architecture.

Systemic Writer (pySide6) implemented this framework as the production desktop application: PySide6, modular app package, template-driven phases, skills system seeded from the skill library work, multi-vendor AI backend, proposal-and-approval dialog at each phase gate, reports generation, rewrite tools, and help system. The template-driven phase system — overridable defaults corresponding to the methodology's phases — added the flexibility needed to support multiple writing genres and literature types without changing code.

The combination of a stable theoretical framework, a mature methodological specification, a validated UI stack, and a clean modular architecture produced the first version worth treating as a product rather than a prototype.

---

## Key Findings

**The right problem frame arrived late.** Early iterations treated the tool as an AI writing assistant — something that helps you write. The productive reframe, which arrived in the middle cycles, was: the tool is a phase-gated intervention engine. The AI does not write. It facilitates a structured cognitive process in which the writer makes all consequential decisions. This reframe changed every subsequent design decision, including several that had already been made correctly but were not yet understood in terms that explained why they were correct.

This is a finding about design experiments in complex domains, not just about this project: the correct problem frame often cannot be arrived at deductively. It requires sustained engagement with the domain through successive approximations. Researchers who expect to arrive at the right frame before the experiment begins will consistently underestimate how much the frame itself is a product of the inquiry.

**Architecture and theory resolved at different rates.** The modular plugin architecture was confirmed in cycle one and never revisited. The right UI stack was confirmed in cycle four. The theoretical framework — the Reader-First model, the three literature types, the feedback-loop analysis, the 10-phase methodology — was not fully stable until cycle five, more than a year into the experiment. Design experiments in complex domains should expect this asymmetry and plan for it. Treating unresolved theoretical questions as implementation problems produces iterations that are technically competent but functionally misdirected.

**Externalizing process knowledge was decisive.** The move from embedded prompts to JSON skill schemas, then to template-driven phase definitions, separated what the tool knows from what the tool does. This made the system extensible without code changes and made expert writing knowledge auditable, portable, and improvable — which is both a practical result and a theoretical one. A tool that embeds its process knowledge in code cannot be revised, studied, or extended by anyone who is not a developer. A tool that externalizes process knowledge into authorable schemas is a research instrument as well as a product.

**Human-in-the-loop as design principle, not safety feature.** The HITL architecture was initially introduced because it seemed appropriate for AI-assisted tools. It turned out to be correct for a different reason: writing is a sequence of decisions under uncertainty, and a tool that automates past decision points removes the very judgment that produces quality. Approval gates are not friction. They are the mechanism. The design experiment produced this finding through realistic testing — through actual experience of what happens when decision points are automated — not through theoretical argument.

**Theory and methodology are separable artifacts.** The most durable product of the experiment is not the software but the theoretical and methodological framework — *The Reader-First Writing System* — which exists independently of any implementation and transfers to practitioners who will never use the software. The software embodies the theory; the theory stands on its own. In design experiments of this kind, the moment when accumulated understanding becomes a transferable specification is the inflection point. Before that moment, each iteration generates partial understanding. After it, both implementation and transmission become tractable.

**Nine versions in one day is a signal.** The rate of productive iteration tracks the clarity of the governing theory. Throughout the experiment, when iteration was slow and each cycle seemed to produce marginal rather than structural improvement, the binding constraint was theoretical: the right model of the domain had not been found. When theory resolved, the implementation followed rapidly. This is a pattern that should be recognizable across design experiments in complex domains and should inform how researchers allocate attention when iteration slows.

---

## What This Illustrates

The experiment demonstrates something that systems science has claimed theoretically but has fewer empirical case studies to show for: that complex cognitive processes — processes that have historically resisted formalization because practitioners cannot fully articulate what they do — can be modeled as phase-gated systems with identifiable attractor dynamics, leverage points, and feedback requirements. Expert writing is one such process. The experiment produced a working model of it that can be encoded in software, articulated in a practitioner methodology, tested in realistic conditions, and revised as understanding deepens.

The feedback-loop analysis that the theoretical work produced has particular relevance to the broader question of how AI can be used well in complex cognitive domains. Oral tradition worked because it had a closed feedback loop — performance, audience response, adjustment — operating continuously. Written literature broke that loop, and most writing instruction has never fully reckoned with the consequences. AI-assisted writing tools, as currently designed, break it further: they substitute generated text for the writer's deliberate decision-making at precisely the points where deliberate decision-making is most consequential. The phase-gate architecture recovers something that the broken feedback loop lost: it restores a form of deliberate mid-course correction by requiring the writer to evaluate and approve AI output before the process advances. This is not a novel insight about AI safety. It is a finding about what the writing process actually requires — one that the experiment reached through the same iterative logic it was trying to encode in software.

The experiment also illustrates the characteristic dynamics of design experiments in complex domains: the asymmetric resolution of technical, functional, and theoretical questions; the role of accumulated failure as the primary dataset; the productive function of dead ends; and the sudden acceleration that follows theoretical resolution. These dynamics are isomorphic with what ISRD observes in other applied systems science contexts. The same patterns appear whether the complex system under investigation is a chronic illness, an organizational dysfunction, or the cognitive architecture of a writing process.

---

## Current State and Forward Work

Systemic Writer (pySide6) is the production-targeted implementation as of June 2026. It is a private application, currently functioning as both a writing environment and a continued research instrument. The Reader-First framework is implemented across its phase structure. The skills system is seeded. The multi-vendor AI backend supports flexibility across providers.

*The Reader-First Writing System* exists in two versions. Version 4, the general writing version, is being prepared for publication. Version 5, the systems-science-practitioner version with the expanded nine-concept framework and ISRD Practitioner appendix, is under continued development alongside ISRD's broader methodological documentation work.

The next phase of the empirical research is user validation: whether the phase-gate model, as implemented, produces measurable differences in writing quality and process clarity for writers beyond the researcher-developer. The within-system comparison — same writers, same genre, assisted versus unassisted phases — is the appropriate control treatment for a complex systems research context, following the design experiment logic that an existing condition serves as its own baseline rather than requiring a separate control group.

---

## A Note on Methodology

Readers familiar with ISRD's broader work will recognize the structure of this experiment as an instance of the six-phase cycle described in the ISRD methodology documentation: mapping (understanding the existing landscape of AI writing tools and their assumptions), analysis (diagnosing the attractor dynamics of the expert writing process), intervention design (the theoretical framework that emerged through the middle cycles), evolutionary development and testing (the thirty software iterations), deployment (the production implementation), and monitoring and evaluation (the user validation work ahead).

The isomorphism between this experiment and ISRD's work in other domains is not coincidental. It is what systems science predicts: the same dynamics govern complex design problems regardless of domain, and the methodology that addresses those dynamics correctly will transfer across domains. The value of the case library that accumulates across ISRD projects is precisely this: each project confirms and refines the methodology that the others have tested. The AI-assisted writing experiment is one data point in that accumulation. The lessons it produced are available to every subsequent design experiment that Integrated Systemics R&D undertakes.

---

*Kurt Rowley is the founder of Integrated Systemics R&D (ISRD), an applied complex systems science organization. His published research includes work in instructional design cycles and design experiments. This case study is part of a continuing series documenting ISRD's applied systems science projects.*

*ISRD — [isrd.com](https://isrd.com)*
